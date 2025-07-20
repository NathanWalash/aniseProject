import { API_BASE_URL } from '../utils/api';

export async function getProposals(daoAddress: string, limit = 20, startAfter?: string) {
  const url = new URL(`${API_BASE_URL}/api/daos/${daoAddress}/proposals`);
  url.searchParams.append('limit', String(limit));
  if (startAfter) url.searchParams.append('startAfter', startAfter);
  const res = await fetch(url.toString());
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch proposals');
  return data.proposals;
}

export async function getProposal(daoAddress: string, proposalId: string) {
  const res = await fetch(`${API_BASE_URL}/api/daos/${daoAddress}/proposals/${proposalId}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch proposal');
  return data;
}

export async function getProposalVotes(daoAddress: string, proposalId: string) {
  const res = await fetch(`${API_BASE_URL}/api/daos/${daoAddress}/proposals/${proposalId}/votes`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch proposal votes');
  return data.votes;
} 