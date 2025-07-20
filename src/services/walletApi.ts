import { walletConnectService } from '../../wallet/walletConnectInstance';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../utils/api';
import { Alert, Linking } from 'react-native';
import { hexlify, toUtf8Bytes } from 'ethers';

export async function getWalletAddress(): Promise<string> {
  if (walletConnectService.session && walletConnectService.session.namespaces?.eip155?.accounts?.length) {
    const full = walletConnectService.session.namespaces.eip155.accounts[0];
    const addr = full.split(':').pop();
    return typeof addr === 'string' ? addr : '';
  }
  return '';
}

export async function connectAndLinkWallet(userId: string): Promise<string> {
  // 1. Connect wallet if not connected
  if (!walletConnectService.isConnected()) {
    await walletConnectService.init();
    const { uri } = await walletConnectService.connect();
    if (!uri) throw new Error('No WalletConnect URI generated');
    await Linking.openURL(uri);
    await walletConnectService.approve();
  }
  const address = await getWalletAddress();
  if (!address) throw new Error('Could not get wallet address');
  // 2. Prompt user to sign a message
  const message = `Link this wallet to my Anise account at ${userId}`;
  let signature: string;
  try {
    signature = await walletConnectService.client!.request({
      topic: walletConnectService.session.topic,
      chainId: 'eip155:80002',
      request: {
        method: 'personal_sign',
        params: [hexlify(toUtf8Bytes(message)), address],
      },
    });
  } catch (err: any) {
    throw new Error('Signature rejected or failed.');
  }
  // 3. Send to backend
  const idToken = await AsyncStorage.getItem('idToken');
  if (!idToken) throw new Error('Not authenticated');
  const res = await fetch(`${API_BASE_URL}/api/users/wallet/connect`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`,
    },
    body: JSON.stringify({ address, signature }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to link wallet');
  return address;
} 