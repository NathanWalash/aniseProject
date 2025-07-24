import { API_BASE_URL } from '../utils/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Helper to get auth headers
async function getAuthHeaders() {
  const idToken = await AsyncStorage.getItem('idToken');
  if (!idToken) {
    throw new Error('Not authenticated');
  }
  return {
    'Authorization': `Bearer ${idToken}`,
    'Content-Type': 'application/json'
  };
}

// Calls GET /api/daos/:daoAddress/members to list all members of a DAO.
export async function getMembers(daoAddress: string) {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE_URL}/api/daos/${daoAddress}/members`, { headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch members');
  return data.members;
}

// Calls GET /api/daos/:daoAddress/members/:memberAddress to get a member's profile/role.
export async function getMember(daoAddress: string, memberAddress: string) {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE_URL}/api/daos/${daoAddress}/members/${memberAddress}`, { headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch member');
  return data;
}

// Calls GET /api/daos/:daoAddress/join-requests to list all join requests for a DAO.
export async function getJoinRequests(daoAddress: string) {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE_URL}/api/daos/${daoAddress}/join-requests`, { headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch join requests');
  return data.joinRequests;
}

// Calls GET /api/daos/:daoAddress/join-requests/:memberAddress to get a single join request.
export async function getJoinRequest(daoAddress: string, memberAddress: string) {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE_URL}/api/daos/${daoAddress}/join-requests/${memberAddress}`, { headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch join request');
  return data;
}

// Calls POST /api/daos/:daoAddress/join-requests/:memberAddress/approve to accept a join request
export async function acceptJoinRequest(daoAddress: string, memberAddress: string, txHash: string) {
  const headers = await getAuthHeaders();
  const res = await fetch(
    `${API_BASE_URL}/api/daos/${daoAddress}/join-requests/${memberAddress}/approve`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify({ txHash })
    }
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to accept join request');
  return data;
}

// Calls POST /api/daos/:daoAddress/join-requests/:memberAddress/reject to reject a join request
export async function rejectJoinRequest(daoAddress: string, memberAddress: string, txHash: string) {
  const headers = await getAuthHeaders();
  const res = await fetch(
    `${API_BASE_URL}/api/daos/${daoAddress}/join-requests/${memberAddress}/reject`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify({ txHash })
    }
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to reject join request');
  return data;
} 