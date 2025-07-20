import { API_BASE_URL } from '../utils/api';

// Calls GET /api/daos/:daoAddress/claims to list all claims for a DAO.
export async function getClaims(daoAddress: string, limit = 20, startAfter?: string) {
  const url = new URL(`${API_BASE_URL}/api/daos/${daoAddress}/claims`);
  url.searchParams.append('limit', String(limit));
  if (startAfter) url.searchParams.append('startAfter', startAfter);
  const res = await fetch(url.toString());
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch claims');
  return data.claims;
}

// Calls GET /api/daos/:daoAddress/claims/:claimId to get claim details.
export async function getClaim(daoAddress: string, claimId: string) {
  const res = await fetch(`${API_BASE_URL}/api/daos/${daoAddress}/claims/${claimId}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch claim');
  return data;
}

// Calls GET /api/daos/:daoAddress/claims/:claimId/votes to get the votes object for a claim.
export async function getClaimVotes(daoAddress: string, claimId: string) {
  const res = await fetch(`${API_BASE_URL}/api/daos/${daoAddress}/claims/${claimId}/votes`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch claim votes');
  return data.votes;
} 