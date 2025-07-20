import { API_BASE_URL } from '../utils/api';

export async function getMembers(daoAddress: string) {
  const res = await fetch(`${API_BASE_URL}/api/daos/${daoAddress}/members`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch members');
  return data.members;
}

export async function getMember(daoAddress: string, memberAddress: string) {
  const res = await fetch(`${API_BASE_URL}/api/daos/${daoAddress}/members/${memberAddress}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch member');
  return data;
}

export async function getJoinRequests(daoAddress: string) {
  const res = await fetch(`${API_BASE_URL}/api/daos/${daoAddress}/join-requests`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch join requests');
  return data.joinRequests;
} 