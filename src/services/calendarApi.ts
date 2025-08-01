import { ethers } from 'ethers';
import { Linking, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { walletConnectService } from '../../wallet/walletConnectInstance';
import { API_BASE_URL } from '../utils/api';
import CalendarModule from './abis/CalendarModule.json';

const POLYSCAN_PREFIX = 'https://amoy.polygonscan.com';

export interface Event {
  eventId: number;
  title: string;
  description: string;
  location: string;
  creator: string;
  startTime: number; // Unix timestamp
  endTime: number; // Unix timestamp
  createdAt: {
    _seconds: number;
    _nanoseconds: number;
  };
  createdBy: string;
  txHash: string;
}

export const calendarApi = {
  async listEvents(daoAddress: string, offset = 0, limit = 20): Promise<Event[]> {
    try {
      const idToken = await AsyncStorage.getItem('idToken');
      if (!idToken) throw new Error('Not authenticated');

      const response = await fetch(`${API_BASE_URL}/api/daos/${daoAddress}/events?offset=${offset}&limit=${limit}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${idToken}`,
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch events');
      }

      const data = await response.json();
      return data.events || [];
    } catch (error) {
      console.error('Error listing events:', error);
      throw error;
    }
  },

  async getUpcomingEvents(daoAddress: string): Promise<Event[]> {
    try {
      const idToken = await AsyncStorage.getItem('idToken');
      if (!idToken) throw new Error('Not authenticated');

      const response = await fetch(`${API_BASE_URL}/api/daos/${daoAddress}/events/upcoming`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${idToken}`,
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch upcoming events');
      }

      const data = await response.json();
      return data.events || [];
    } catch (error) {
      console.error('Error getting upcoming events:', error);
      throw error;
    }
  },

  async getEvent(daoAddress: string, eventId: number): Promise<Event> {
    try {
      const idToken = await AsyncStorage.getItem('idToken');
      if (!idToken) throw new Error('Not authenticated');

      const response = await fetch(`${API_BASE_URL}/api/daos/${daoAddress}/events/${eventId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${idToken}`,
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch event');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting event:', error);
      throw error;
    }
  },

  async createEvent(
    daoAddress: string,
    title: string,
    description: string,
    location: string,
    startTime: Date,
    endTime: Date
  ): Promise<string> {
    try {
      // 1. Check if WalletConnect is connected
      if (!walletConnectService.isConnected()) {
        throw new Error('Please connect your wallet first');
      }

      // 2. Prepare the transaction
      const tx = {
        to: daoAddress,
        data: new ethers.Interface(CalendarModule.abi).encodeFunctionData('createEvent', [
          title,
          description,
          Math.floor(startTime.getTime() / 1000),
          Math.floor(endTime.getTime() / 1000),
          location
        ])
      };

      // 3. Send the transaction (this will trigger the MetaMask deeplink)
      console.log('Creating event:', {
        title,
        description,
        location,
        startTime: Math.floor(startTime.getTime() / 1000),
        endTime: Math.floor(endTime.getTime() / 1000)
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
      const res = await fetch(`${API_BASE_URL}/api/daos/${daoAddress}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          title,
          description,
          location,
          startTime: Math.floor(startTime.getTime() / 1000),
          endTime: Math.floor(endTime.getTime() / 1000),
          txHash
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to create event');
      }

      // 6. Show success alert with Polyscan link
      Alert.alert(
        'Transaction Sent',
        `Your event was created!\n\nTx Hash: ${txHash}`,
        [
          { text: 'View on Polyscan', onPress: () => Linking.openURL(`${POLYSCAN_PREFIX}/tx/${txHash}`) },
          { text: 'OK' },
        ]
      );

      return await res.json();
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  },

  async updateEvent(
    daoAddress: string,
    eventId: number,
    title: string,
    description: string,
    location: string,
    startTime: Date,
    endTime: Date
  ): Promise<string> {
    try {
      // 1. Check if WalletConnect is connected
      if (!walletConnectService.isConnected()) {
        throw new Error('Please connect your wallet first');
      }

      // 2. Prepare the transaction
      const tx = {
        to: daoAddress,
        data: new ethers.Interface(CalendarModule.abi).encodeFunctionData('updateEvent', [
          eventId,
          title,
          description,
          Math.floor(startTime.getTime() / 1000),
          Math.floor(endTime.getTime() / 1000),
          location
        ])
      };

      // 3. Send the transaction (this will trigger the MetaMask deeplink)
      console.log('Updating event:', {
        eventId,
        title,
        description,
        location,
        startTime: Math.floor(startTime.getTime() / 1000),
        endTime: Math.floor(endTime.getTime() / 1000)
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
      const res = await fetch(`${API_BASE_URL}/api/daos/${daoAddress}/events/${eventId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          title,
          description,
          location,
          startTime: Math.floor(startTime.getTime() / 1000),
          endTime: Math.floor(endTime.getTime() / 1000),
          txHash
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to update event');
      }

      // 6. Show success alert with Polyscan link
      Alert.alert(
        'Transaction Sent',
        `Your event was updated!\n\nTx Hash: ${txHash}`,
        [
          { text: 'View on Polyscan', onPress: () => Linking.openURL(`${POLYSCAN_PREFIX}/tx/${txHash}`) },
          { text: 'OK' },
        ]
      );

      return await res.json();
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  },

  async deleteEvent(daoAddress: string, eventId: number): Promise<string> {
    try {
      // 1. Check if WalletConnect is connected
      if (!walletConnectService.isConnected()) {
        throw new Error('Please connect your wallet first');
      }

      // 2. Prepare the transaction
      const tx = {
        to: daoAddress,
        data: new ethers.Interface(CalendarModule.abi).encodeFunctionData('deleteEvent', [
          eventId
        ])
      };

      // 3. Send the transaction (this will trigger the MetaMask deeplink)
      console.log('Deleting event:', { eventId });
      
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
      const res = await fetch(`${API_BASE_URL}/api/daos/${daoAddress}/events/${eventId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          txHash
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to delete event');
      }

      // 6. Show success alert with Polyscan link
      Alert.alert(
        'Transaction Sent',
        `Your event was deleted!\n\nTx Hash: ${txHash}`,
        [
          { text: 'View on Polyscan', onPress: () => Linking.openURL(`${POLYSCAN_PREFIX}/tx/${txHash}`) },
          { text: 'OK' },
        ]
      );

      return await res.json();
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
  }
}; 