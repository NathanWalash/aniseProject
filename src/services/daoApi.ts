import { API_BASE_URL } from '../utils/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export async function createDao(metadata: any, txHash: string, creatorUid?: string) {
  const idToken = await AsyncStorage.getItem('idToken');
  const res = await fetch(`${API_BASE_URL}/api/daos`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`,
    },
    body: JSON.stringify({ metadata, txHash, creatorUid }),
  });
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch (e) {
    throw new Error(`Non-JSON response from backend: ${text.slice(0, 200)}`);
  }
  if (!res.ok) throw new Error(data.error || 'Failed to create DAO');
  return data;
}

export async function getDaos(limit = 20, startAfter?: string) {
  const url = new URL(`${API_BASE_URL}/api/daos`);
  url.searchParams.append('limit', String(limit));
  if (startAfter) url.searchParams.append('startAfter', startAfter);
  const res = await fetch(url.toString());
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch DAOs');
  return data.daos;
}

export async function getDao(daoAddress: string) {
  const res = await fetch(`${API_BASE_URL}/api/daos/${daoAddress}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch DAO');
  return data;
}

export async function getDaoModules(daoAddress: string) {
  const res = await fetch(`${API_BASE_URL}/api/daos/${daoAddress}/modules`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch DAO modules');
  return data.modules;
}
// TODO: Add more DAO-related API calls as needed (proposals, claims, etc.) 