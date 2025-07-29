import { API_BASE_URL, getAuthHeaders } from '../utils/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ethers } from 'ethers';
import { walletConnectService } from '../../wallet/walletConnectInstance';
import ClaimVotingModuleAbi from './abis/ClaimVotingModule.json';
import DaoKernelAbi from './abis/DaoKernel.json';
import { AMOY_RPC_URL } from '../utils/rpc';
import { Alert, Linking } from 'react-native';
const POLYSCAN_PREFIX = 'https://amoy.polygonscan.com';

export interface Claim {
  claimId: string;
  title: string;
  description: string;
  amount: string;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  createdAt: {
    _seconds: number;
    _nanoseconds: number;
  };
  claimant: string;
  approvals: number;
  rejections: number;
  votes: Record<string, boolean>;
  voters: Record<string, {
    vote: boolean;
    timestamp: {
      _seconds: number;
      _nanoseconds: number;
    };
    txHash: string;
  }>;
  txHash: string;
  createdBy: string;
}

export const listClaims = async (daoAddress: string): Promise<{ claims: Claim[] }> => {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}/api/daos/${daoAddress}/claims`, { headers });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Failed to fetch claims');
    }

    return await res.json();
  } catch (err: any) {
    console.error('Error fetching claims:', err);
    throw err;
  }
};

// Create a new claim
export const createClaim = async (daoAddress: string, data: { title: string; amount: string; description: string }) => {
  try {
    // 1. Check if WalletConnect is connected
    if (!walletConnectService.isConnected()) {
      throw new Error('Please connect your wallet first');
    }

    // 2. Validate amount
    const amountNum = parseFloat(data.amount);
    if (isNaN(amountNum)) {
      throw new Error('Invalid amount');
    }

    // 3. Prepare the transaction
    const tx = {
      to: daoAddress,
      data: new ethers.Interface(ClaimVotingModuleAbi.abi).encodeFunctionData('createClaim', [
        data.title,
        ethers.parseUnits(amountNum.toString(), 18), // Convert GBP amount to wei (18 decimals)
        data.description
      ])
    };

    // 4. Send the transaction (this will trigger the MetaMask deeplink)
    console.log('Creating claim:', {
      title: data.title,
      amount: amountNum,
      amountInWei: ethers.parseUnits(amountNum.toString(), 18).toString(),
      description: data.description
    });
    
    // Try to open MetaMask app
    try {
      await Linking.openURL('metamask://');
    } catch (e) {
      console.log('Could not open MetaMask:', e);
    }
    
    const txHash = await walletConnectService.sendTransaction(tx) as string;
    console.log('Transaction sent:', txHash);

    // 5. Get JWT token
    const idToken = await AsyncStorage.getItem('idToken');
    if (!idToken) throw new Error('Not authenticated');

    // 6. Update backend
    const res = await fetch(`${API_BASE_URL}/api/daos/${daoAddress}/claims`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`,
      },
      body: JSON.stringify({ ...data, txHash }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Failed to create claim');
    }

    // 7. Show success alert with Polyscan link
    Alert.alert(
      'Transaction Sent',
      `Your claim was submitted!\n\nTx Hash: ${txHash}`,
      [
        { text: 'View on Polyscan', onPress: () => Linking.openURL(`${POLYSCAN_PREFIX}/tx/${txHash}`) },
        { text: 'OK' },
      ]
    );

    return await res.json();
  } catch (err: any) {
    console.error('Error creating claim:', err);
    throw err;
  }
};

// Get all claims for a DAO
export const getClaims = async (daoAddress: string, limit = 20, startAfter?: string) => {
  try {
    const url = new URL(`${API_BASE_URL}/api/daos/${daoAddress}/claims`);
    url.searchParams.append('limit', String(limit));
    if (startAfter) url.searchParams.append('startAfter', startAfter);

    const idToken = await AsyncStorage.getItem('idToken');
    if (!idToken) throw new Error('Not authenticated');

    const res = await fetch(url.toString(), {
      headers: { 'Authorization': `Bearer ${idToken}` },
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Failed to fetch claims');
    }

    return await res.json();
  } catch (err: any) {
    console.error('Error fetching claims:', err);
    throw err;
  }
};

// Get a single claim
export const getClaim = async (daoAddress: string, claimId: string) => {
  try {
    const idToken = await AsyncStorage.getItem('idToken');
    if (!idToken) throw new Error('Not authenticated');

    const res = await fetch(`${API_BASE_URL}/api/daos/${daoAddress}/claims/${claimId}`, {
      headers: { 'Authorization': `Bearer ${idToken}` },
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Failed to fetch claim');
    }

    return await res.json();
  } catch (err: any) {
    console.error('Error fetching claim:', err);
    throw err;
  }
};

// Vote on a claim
export const payoutClaim = async (daoAddress: string, claimId: string) => {
  try {
    // 1. Check if WalletConnect is connected
    if (!walletConnectService.isConnected()) {
      throw new Error('Please connect your wallet first');
    }

    // 2. Get the treasury address from the DAO
    const provider = new ethers.JsonRpcProvider(AMOY_RPC_URL);
    const daoContract = new ethers.Contract(daoAddress, DaoKernelAbi.abi, provider);
    const treasuryAddress = await daoContract.getTreasuryModule();
    
    if (!treasuryAddress || treasuryAddress === ethers.ZeroAddress) {
      throw new Error('Treasury module not found for this DAO');
    }

    // 3. Prepare the transaction
    const tx = {
      to: daoAddress,
      data: new ethers.Interface(ClaimVotingModuleAbi.abi).encodeFunctionData('payoutClaim', [
        claimId,
        treasuryAddress
      ])
    };

    // 3. Send the transaction (this will trigger the MetaMask deeplink)
    console.log('Paying out claim:', claimId);
    
    // Try to open MetaMask app
    try {
      await Linking.openURL('metamask://');
    } catch (e) {
      console.log('Could not open MetaMask:', e);
    }
    
    const txHash = await walletConnectService.sendTransaction(tx) as string;
    console.log('Transaction sent:', txHash);

    // 4. Get JWT token
    const idToken = await AsyncStorage.getItem('idToken');
    if (!idToken) throw new Error('Not authenticated');

    // 5. Update backend
    const res = await fetch(`${API_BASE_URL}/api/daos/${daoAddress}/claims/${claimId}/payout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`,
      },
      body: JSON.stringify({ txHash }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Failed to payout claim');
    }

    // 6. Show success alert with Polyscan link
    Alert.alert(
      'Payout Successful',
      `Claim has been paid out successfully!\n\nTx Hash: ${txHash}`,
      [
        { text: 'View on Polyscan', onPress: () => Linking.openURL(`${POLYSCAN_PREFIX}/tx/${txHash}`) },
        { text: 'OK' },
      ]
    );

    return await res.json();
  } catch (err: any) {
    console.error('Error paying out claim:', err);
    throw err;
  }
};

export const voteOnClaim = async (daoAddress: string, claimId: string, approve: boolean) => {
  try {
    // 1. Check if WalletConnect is connected
    if (!walletConnectService.isConnected()) {
      throw new Error('Please connect your wallet first');
    }

    // 2. Prepare the transaction
    const tx = {
      to: daoAddress,
      data: new ethers.Interface(ClaimVotingModuleAbi.abi).encodeFunctionData('voteOnClaim', [
        claimId,
        approve
      ])
    };

    // 3. Send the transaction
    console.log('Voting on claim:', { claimId, approve });
    const txHash = await walletConnectService.sendTransaction(tx) as string;
    console.log('Transaction sent:', txHash);

    // 4. Get JWT token
    const idToken = await AsyncStorage.getItem('idToken');
    if (!idToken) throw new Error('Not authenticated');

    // 5. Update backend
    const res = await fetch(`${API_BASE_URL}/api/daos/${daoAddress}/claims/${claimId}/vote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`,
      },
      body: JSON.stringify({ 
        txHash,
        voteType: approve ? 'approve' : 'reject'
      }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Failed to record vote');
    }

    // 6. Show success alert with Polyscan link
    Alert.alert(
      'Transaction Sent',
      `Your vote was submitted!\n\nTx Hash: ${txHash}`,
      [
        { text: 'View on Polyscan', onPress: () => Linking.openURL(`${POLYSCAN_PREFIX}/tx/${txHash}`) },
        { text: 'OK' },
      ]
    );

    return await res.json();
  } catch (err: any) {
    console.error('Error voting on claim:', err);
    throw err;
  }
}; 