import AsyncStorage from '@react-native-async-storage/async-storage';

export const API_BASE_URL = "https://90906d78e97b.ngrok-free.app";
export async function getAuthHeaders() {
  const idToken = await AsyncStorage.getItem('idToken');
  if (!idToken) {
    throw new Error('Not authenticated');
  }
  return {
    'Authorization': `Bearer ${idToken}`,
    'Content-Type': 'application/json'
  };
}