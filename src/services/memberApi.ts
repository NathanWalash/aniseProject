import { API_BASE_URL } from '../utils/api';

// Calls GET /api/daos/:daoAddress/members to list all members of a DAO.
export async function getMembers(daoAddress: string) {
  const res = await fetch(`${API_BASE_URL}/api/daos/${daoAddress}/members`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch members');
  return data.members;
}

// Calls GET /api/daos/:daoAddress/members/:memberAddress to get a member's profile/role.
export async function getMember(daoAddress: string, memberAddress: string) {
  const res = await fetch(`${API_BASE_URL}/api/daos/${daoAddress}/members/${memberAddress}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch member');
  return data;
}

// Calls GET /api/daos/:daoAddress/join-requests to list all join requests for a DAO.
export async function getJoinRequests(daoAddress: string) {
  const res = await fetch(`${API_BASE_URL}/api/daos/${daoAddress}/join-requests`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch join requests');
  return data.joinRequests;
} 