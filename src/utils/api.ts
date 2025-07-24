import AsyncStorage from '@react-native-async-storage/async-storage';

export const API_BASE_URL = "https://9e742e6a8a04.ngrok-free.app";

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