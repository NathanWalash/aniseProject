import { ethers } from 'ethers';
import { Alert, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { walletConnectService } from '../../wallet/walletConnectInstance';
import { API_BASE_URL, getAuthHeaders } from '../utils/api';
import TaskManagementModuleAbi from './abis/TaskManagementModule.json';

const POLYSCAN_PREFIX = 'https://amoy.polygonscan.com';

export interface Task {
  taskId: string;
  title: string;
  description: string;
  creator: string;
  createdBy: string;
  status: 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  dueDate: {
    _seconds: number;
    _nanoseconds: number;
  };
  createdAt: {
    _seconds: number;
    _nanoseconds: number;
  };
  updatedAt: {
    _seconds: number;
    _nanoseconds: number;
  };
  txHash: string;
}

// List all tasks for a DAO
export const listTasks = async (daoAddress: string): Promise<{ tasks: Task[] }> => {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}/api/daos/${daoAddress}/tasks`, { headers });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Failed to fetch tasks');
    }

    return await res.json();
  } catch (err: any) {
    console.error('Error fetching tasks:', err);
    throw err;
  }
};

// Create a new task
export const createTask = async (daoAddress: string, data: { 
  title: string; 
  description: string; 
  priority: number; 
  dueDate: number 
}) => {
  try {
    // 1. Check if WalletConnect is connected
    if (!walletConnectService.isConnected()) {
      throw new Error('Please connect your wallet first');
    }

    // 2. Prepare the transaction
    const tx = {
      to: daoAddress,
      data: new ethers.Interface(TaskManagementModuleAbi.abi).encodeFunctionData('createTask', [
        data.title,
        data.description,
        data.priority, // 0=LOW, 1=MEDIUM, 2=HIGH, 3=URGENT
        data.dueDate // Unix timestamp
      ])
    };

    // 3. Send the transaction (this will trigger the MetaMask deeplink)
    console.log('Creating task:', {
      title: data.title,
      description: data.description,
      priority: data.priority,
      dueDate: data.dueDate
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
    const res = await fetch(`${API_BASE_URL}/api/daos/${daoAddress}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`,
      },
      body: JSON.stringify({ ...data, txHash }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Failed to create task');
    }

    // 6. Show success alert with Polyscan link
    Alert.alert(
      'Transaction Sent',
      `Your task was created!\n\nTx Hash: ${txHash}`,
      [
        { text: 'View on Polyscan', onPress: () => Linking.openURL(`${POLYSCAN_PREFIX}/tx/${txHash}`) },
        { text: 'OK' },
      ]
    );

    return await res.json();
  } catch (err: any) {
    console.error('Error creating task:', err);
    throw err;
  }
};

// Get a single task
export const getTask = async (daoAddress: string, taskId: string): Promise<Task> => {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}/api/daos/${daoAddress}/tasks/${taskId}`, { headers });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Failed to fetch task');
    }

    return await res.json();
  } catch (err: any) {
    console.error('Error fetching task:', err);
    throw err;
  }
};

// Update task status
export const updateTaskStatus = async (daoAddress: string, taskId: string, newStatus: number) => {
  try {
    // 1. Check if WalletConnect is connected
    if (!walletConnectService.isConnected()) {
      throw new Error('Please connect your wallet first');
    }

    // 2. Prepare the transaction
    const tx = {
      to: daoAddress,
      data: new ethers.Interface(TaskManagementModuleAbi.abi).encodeFunctionData('updateTaskStatus', [
        taskId,
        newStatus // 0=BACKLOG, 1=TODO, 2=IN_PROGRESS, 3=COMPLETED, 4=CANCELLED
      ])
    };

    // 3. Send the transaction
    console.log('Updating task status:', {
      taskId,
      newStatus
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
    const res = await fetch(`${API_BASE_URL}/api/daos/${daoAddress}/tasks/${taskId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`,
      },
      body: JSON.stringify({ newStatus, txHash }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Failed to update task status');
    }

    // 6. Show success alert
    Alert.alert(
      'Transaction Sent',
      `Task status updated!\n\nTx Hash: ${txHash}`,
      [
        { text: 'View on Polyscan', onPress: () => Linking.openURL(`${POLYSCAN_PREFIX}/tx/${txHash}`) },
        { text: 'OK' },
      ]
    );

    return await res.json();
  } catch (err: any) {
    console.error('Error updating task status:', err);
    throw err;
  }
};

// Update task details
export const updateTask = async (daoAddress: string, taskId: string, data: { 
  title: string; 
  description: string; 
  priority: number; 
  dueDate: number 
}) => {
  try {
    // 1. Check if WalletConnect is connected
    if (!walletConnectService.isConnected()) {
      throw new Error('Please connect your wallet first');
    }

    // 2. Prepare the transaction
    const tx = {
      to: daoAddress,
      data: new ethers.Interface(TaskManagementModuleAbi.abi).encodeFunctionData('updateTask', [
        taskId,
        data.title,
        data.description,
        data.priority,
        data.dueDate
      ])
    };

    // 3. Send the transaction
    console.log('Updating task:', {
      taskId,
      title: data.title,
      description: data.description,
      priority: data.priority,
      dueDate: data.dueDate
    });
    
    const txHash = await walletConnectService.sendTransaction(tx) as string;
    console.log('Transaction sent:', txHash);

    // 4. Get JWT token
    const idToken = await AsyncStorage.getItem('idToken');
    if (!idToken) throw new Error('Not authenticated');

    // 5. Update backend
    const res = await fetch(`${API_BASE_URL}/api/daos/${daoAddress}/tasks/${taskId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`,
      },
      body: JSON.stringify({ ...data, txHash }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Failed to update task');
    }

    // 6. Show success alert
    Alert.alert(
      'Transaction Sent',
      `Task updated!\n\nTx Hash: ${txHash}`,
      [
        { text: 'View on Polyscan', onPress: () => Linking.openURL(`${POLYSCAN_PREFIX}/tx/${txHash}`) },
        { text: 'OK' },
      ]
    );

    return await res.json();
  } catch (err: any) {
    console.error('Error updating task:', err);
    throw err;
  }
}; 