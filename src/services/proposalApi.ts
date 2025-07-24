import { API_BASE_URL } from '../utils/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ethers } from 'ethers';
import { walletConnectService } from '../../wallet/walletConnectInstance';
import ProposalVotingModuleAbi from './abis/ProposalVotingModule.json';
import { Alert, Linking } from 'react-native';

const POLYSCAN_PREFIX = 'https://amoy.polygonscan.com';

// Create a new proposal
export const createProposal = async (daoAddress: string, data: { title: string; description: string }) => {
  try {
    // 1. Check if WalletConnect is connected
    if (!walletConnectService.isConnected()) {
      throw new Error('Please connect your wallet first');
    }

    // 2. Prepare the transaction
    const tx = {
      to: daoAddress,
      data: new ethers.Interface(ProposalVotingModuleAbi.abi).encodeFunctionData('createProposal', [
        data.title,
        data.description
      ])
    };

    // 3. Send the transaction (this will trigger the MetaMask deeplink)
    console.log('Creating proposal:', data);
    const txHash = await walletConnectService.sendTransaction(tx) as string;
    console.log('Transaction sent:', txHash);

    // 4. Show success alert with Polyscan link
    Alert.alert(
      'Transaction Sent',
      `Your proposal was submitted!\n\nTx Hash: ${txHash}`,
      [
        { text: 'View on Polyscan', onPress: () => Linking.openURL(`${POLYSCAN_PREFIX}/tx/${txHash}`) },
        { text: 'OK' },
      ]
    );

    return { txHash };
  } catch (err: any) {
    console.error('Error creating proposal:', err);
    throw err;
  }
};

// Get all proposals for a DAO
export const getProposals = async (daoAddress: string, limit = 20, startAfter?: string) => {
  try {
    const url = new URL(`${API_BASE_URL}/api/daos/${daoAddress}/proposals`);
    url.searchParams.append('limit', String(limit));
    if (startAfter) url.searchParams.append('startAfter', startAfter);

    const idToken = await AsyncStorage.getItem('idToken');
    if (!idToken) throw new Error('Not authenticated');

    const res = await fetch(url.toString(), {
      headers: { 'Authorization': `Bearer ${idToken}` },
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Failed to fetch proposals');
    }

    return await res.json();
  } catch (err: any) {
    console.error('Error fetching proposals:', err);
    throw err;
  }
};

// Get a single proposal
export const getProposal = async (daoAddress: string, proposalId: string) => {
  try {
    const idToken = await AsyncStorage.getItem('idToken');
    if (!idToken) throw new Error('Not authenticated');

    const res = await fetch(`${API_BASE_URL}/api/daos/${daoAddress}/proposals/${proposalId}`, {
      headers: { 'Authorization': `Bearer ${idToken}` },
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Failed to fetch proposal');
    }

    return await res.json();
  } catch (err: any) {
    console.error('Error fetching proposal:', err);
    throw err;
  }
};

// Vote on a proposal
export const voteOnProposal = async (daoAddress: string, proposalId: string, approve: boolean) => {
  try {
    // 1. Check if WalletConnect is connected
    if (!walletConnectService.isConnected()) {
      throw new Error('Please connect your wallet first');
    }

    // 2. Prepare the transaction
    const tx = {
      to: daoAddress,
      data: new ethers.Interface(ProposalVotingModuleAbi.abi).encodeFunctionData('voteOnProposal', [
        proposalId,
        approve
      ])
    };

    // 3. Send the transaction
    console.log('Voting on proposal:', { proposalId, approve });
    const txHash = await walletConnectService.sendTransaction(tx) as string;
    console.log('Transaction sent:', txHash);

    // 4. Show success alert with Polyscan link
    Alert.alert(
      'Transaction Sent',
      `Your vote was submitted!\n\nTx Hash: ${txHash}`,
      [
        { text: 'View on Polyscan', onPress: () => Linking.openURL(`${POLYSCAN_PREFIX}/tx/${txHash}`) },
        { text: 'OK' },
      ]
    );

    return { txHash };
  } catch (err: any) {
    console.error('Error voting on proposal:', err);
    throw err;
  }
}; 