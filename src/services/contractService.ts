import { walletConnectService } from '../../wallet/walletConnectInstance';
import { Interface, hexlify } from 'ethers';
import { Alert, Linking } from 'react-native';

// Polygon Amoy chainId
const CHAIN_ID = 80002;

// Counter contract ABI
const COUNTER_ABI = [
  {
    "inputs": [],
    "name": "count",
    "outputs": [{ "internalType": "int256", "name": "", "type": "int256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "increment",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "decrement",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getCount",
    "outputs": [{ "internalType": "int256", "name": "", "type": "int256" }],
    "stateMutability": "view",
    "type": "function"
  }
];

const COUNTER_ADDRESS = '0x1853d3FEddb3E7B7a819d9051c4733f23802D696';

export async function getCounterValue() {
  if (!walletConnectService.isConnected()) throw new Error('Wallet not connected');
  const iface = new Interface(COUNTER_ABI);
  const data = iface.encodeFunctionData('getCount', []);
  const result = await walletConnectService.client!.request({
    topic: walletConnectService.session.topic,
    chainId: `eip155:${CHAIN_ID}`,
    request: {
      method: 'eth_call',
      params: [{
        to: COUNTER_ADDRESS,
        data,
      }, 'latest'],
    },
  });
  // Decode the result (ensure result is BytesLike)
  const [count] = iface.decodeFunctionResult('getCount', typeof result === 'string' ? result : hexlify(result));
  if (typeof count === 'bigint') {
    return Number(count);
  } else if (typeof count !== 'undefined') {
    return count.toString();
  }
  throw new Error('Unexpected result from getCount: ' + JSON.stringify(count));
}

export async function incrementCounter() {
  if (!walletConnectService.isConnected()) throw new Error('Wallet not connected');
  const iface = new Interface(COUNTER_ABI);
  const data = iface.encodeFunctionData('increment', []);
  const from = walletConnectService.session.namespaces.eip155.accounts[0].split(':').pop();
  const tx = {
    from,
    to: COUNTER_ADDRESS,
    data,
    chainId: CHAIN_ID,
  };
  console.log('[contractService] incrementCounter tx:', tx);
  console.log('[contractService] incrementCounter session:', walletConnectService.session);
  try {
    try {
      await Linking.openURL('metamask://');
    } catch (e) {
      console.log('Could not open MetaMask:', e);
    }
    await walletConnectService.sendTransaction(tx);
  } catch (err: any) {
    if (err?.message?.includes('Internal JSON-RPC error') || err?.code === 5000) {
      Alert.alert('Transaction Error', 'An error occurred while sending the transaction. Please try again.');
    }
    throw err;
  }
}

export async function decrementCounter() {
  if (!walletConnectService.isConnected()) throw new Error('Wallet not connected');
  const iface = new Interface(COUNTER_ABI);
  const data = iface.encodeFunctionData('decrement', []);
  const from = walletConnectService.session.namespaces.eip155.accounts[0].split(':').pop();
  const tx = {
    from,
    to: COUNTER_ADDRESS,
    data,
    chainId: CHAIN_ID,
  };
  console.log('[contractService] decrementCounter tx:', tx);
  console.log('[contractService] decrementCounter session:', walletConnectService.session);
  try {
    try {
      await Linking.openURL('metamask://');
    } catch (e) {
      console.log('Could not open MetaMask:', e);
    }
    await walletConnectService.sendTransaction(tx);
  } catch (err: any) {
    if (err?.message?.includes('Internal JSON-RPC error') || err?.code === 5000) {
      Alert.alert('Transaction Error', 'An error occurred while sending the transaction. Please try again.');
    }
    throw err;
  }
} 