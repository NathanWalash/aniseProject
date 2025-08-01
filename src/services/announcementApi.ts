import { ethers } from 'ethers';
import { Alert, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { walletConnectService } from '../../wallet/walletConnectInstance';
import { API_BASE_URL, getAuthHeaders } from '../utils/api';
import AnnouncementModuleAbi from './abis/AnnouncementModule.json';

const POLYSCAN_PREFIX = 'https://amoy.polygonscan.com';

export interface Announcement {
  announcementId: string;
  title: string;
  content: string;
  announcementType: 'GENERAL' | 'URGENT' | 'INFO';
  creator: string;
  expiresAt: {
    _seconds: number;
    _nanoseconds: number;
  };
  createdAt: {
    _seconds: number;
    _nanoseconds: number;
  };
  txHash: string;
  createdBy: string;
}

// List all announcements for a DAO
export const listAnnouncements = async (daoAddress: string): Promise<{ announcements: Announcement[] }> => {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}/api/daos/${daoAddress}/announcements`, { headers });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Failed to fetch announcements');
    }

    return await res.json();
  } catch (err: any) {
    console.error('Error fetching announcements:', err);
    throw err;
  }
};

// Create a new announcement
export const createAnnouncement = async (daoAddress: string, data: { 
  title: string; 
  content: string; 
  announcementType: number; 
  expiresAt: number 
}) => {
  try {
    // 1. Check if WalletConnect is connected
    if (!walletConnectService.isConnected()) {
      throw new Error('Please connect your wallet first');
    }

    // 2. Prepare the transaction
    const tx = {
      to: daoAddress,
      data: new ethers.Interface(AnnouncementModuleAbi.abi).encodeFunctionData('createAnnouncement', [
        data.title,
        data.content,
        data.announcementType, // 0=GENERAL, 1=URGENT, 2=INFO
        data.expiresAt // Unix timestamp
      ])
    };

    // 3. Send the transaction (this will trigger the MetaMask deeplink)
    console.log('Creating announcement:', {
      title: data.title,
      content: data.content,
      type: data.announcementType,
      expiresAt: data.expiresAt
    });
    
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
    const res = await fetch(`${API_BASE_URL}/api/daos/${daoAddress}/announcements`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`,
      },
      body: JSON.stringify({ ...data, txHash }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Failed to create announcement');
    }

    // 6. Show success alert with Polyscan link
    Alert.alert(
      'Transaction Sent',
      `Your announcement was created!\n\nTx Hash: ${txHash}`,
      [
        { text: 'View on Polyscan', onPress: () => Linking.openURL(`${POLYSCAN_PREFIX}/tx/${txHash}`) },
        { text: 'OK' },
      ]
    );

    return await res.json();
  } catch (err: any) {
    console.error('Error creating announcement:', err);
    throw err;
  }
};

// Get a single announcement
export const getAnnouncement = async (daoAddress: string, announcementId: string): Promise<Announcement> => {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}/api/daos/${daoAddress}/announcements/${announcementId}`, { headers });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Failed to fetch announcement');
    }

    return await res.json();
  } catch (err: any) {
    console.error('Error fetching announcement:', err);
    throw err;
  }
};

// Update an announcement
export const updateAnnouncement = async (daoAddress: string, announcementId: string, data: { 
  title: string; 
  content: string; 
  announcementType: number; 
  expiresAt: number 
}) => {
  try {
    // 1. Check if WalletConnect is connected
    if (!walletConnectService.isConnected()) {
      throw new Error('Please connect your wallet first');
    }

    // 2. Prepare the transaction
    const tx = {
      to: daoAddress,
      data: new ethers.Interface(AnnouncementModuleAbi.abi).encodeFunctionData('updateAnnouncement', [
        announcementId,
        data.title,
        data.content,
        data.announcementType,
        data.expiresAt
      ])
    };

    // 3. Send the transaction
    console.log('Updating announcement:', {
      announcementId,
      title: data.title,
      content: data.content,
      type: data.announcementType,
      expiresAt: data.expiresAt
    });
    
    const txHash = await walletConnectService.sendTransaction(tx) as string;
    console.log('Transaction sent:', txHash);

    // 4. Get JWT token
    const idToken = await AsyncStorage.getItem('idToken');
    if (!idToken) throw new Error('Not authenticated');

    // 5. Update backend
    const res = await fetch(`${API_BASE_URL}/api/daos/${daoAddress}/announcements/${announcementId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`,
      },
      body: JSON.stringify({ ...data, txHash }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Failed to update announcement');
    }

    // 6. Show success alert
    Alert.alert(
      'Transaction Sent',
      `Your announcement was updated!\n\nTx Hash: ${txHash}`,
      [
        { text: 'View on Polyscan', onPress: () => Linking.openURL(`${POLYSCAN_PREFIX}/tx/${txHash}`) },
        { text: 'OK' },
      ]
    );

    return await res.json();
  } catch (err: any) {
    console.error('Error updating announcement:', err);
    throw err;
  }
};

// Delete an announcement
export const deleteAnnouncement = async (daoAddress: string, announcementId: string) => {
  try {
    // 1. Check if WalletConnect is connected
    if (!walletConnectService.isConnected()) {
      throw new Error('Please connect your wallet first');
    }

    // 2. Prepare the transaction
    const tx = {
      to: daoAddress,
      data: new ethers.Interface(AnnouncementModuleAbi.abi).encodeFunctionData('deleteAnnouncement', [
        announcementId
      ])
    };

    // 3. Send the transaction
    console.log('Deleting announcement:', announcementId);
    
    const txHash = await walletConnectService.sendTransaction(tx) as string;
    console.log('Transaction sent:', txHash);

    // 4. Get JWT token
    const idToken = await AsyncStorage.getItem('idToken');
    if (!idToken) throw new Error('Not authenticated');

    // 5. Update backend
    const res = await fetch(`${API_BASE_URL}/api/daos/${daoAddress}/announcements/${announcementId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`,
      },
      body: JSON.stringify({ txHash }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Failed to delete announcement');
    }

    // 6. Show success alert
    Alert.alert(
      'Transaction Sent',
      `Your announcement was deleted!\n\nTx Hash: ${txHash}`,
      [
        { text: 'View on Polyscan', onPress: () => Linking.openURL(`${POLYSCAN_PREFIX}/tx/${txHash}`) },
        { text: 'OK' },
      ]
    );

    return await res.json();
  } catch (err: any) {
    console.error('Error deleting announcement:', err);
    throw err;
  }
}; 