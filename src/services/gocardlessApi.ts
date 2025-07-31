import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../utils/api';

// Helper function to get auth token
const getAuthHeaders = async () => {
  const idToken = await AsyncStorage.getItem('idToken');
  if (!idToken) throw new Error('No auth token found');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${idToken}`,
  };
};

// Start GoCardless redirect flow
export const startRedirectFlow = async () => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/start-redirect-flow`, {
      method: 'POST',
      headers,
      body: JSON.stringify({}),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP ${response.status}: Failed to start redirect flow`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error starting redirect flow:', error);
    throw error;
  }
};

// Confirm GoCardless redirect flow
export const confirmRedirectFlow = async (redirectFlowId: string, sessionToken: string) => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/confirm-redirect-flow`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        redirect_flow_id: redirectFlowId,
        session_token: sessionToken,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to confirm redirect flow');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error confirming redirect flow:', error);
    throw error;
  }
}; 