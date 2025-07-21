import { API_BASE_URL } from '../utils/api';

// Calls GET /api/daos/:daoAddress/treasury to get treasury info for a DAO.
export async function getTreasury(daoAddress: string) {
  const res = await fetch(`${API_BASE_URL}/api/daos/${daoAddress}/treasury`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch treasury info');
  return data;
}

// Calls GET /api/daos/:daoAddress/treasury/transactions to list treasury transactions for a DAO.
export async function getTreasuryTransactions(daoAddress: string, limit = 20, startAfter?: string) {
  const url = new URL(`${API_BASE_URL}/api/daos/${daoAddress}/treasury/transactions`);
  url.searchParams.append('limit', String(limit));
  if (startAfter) url.searchParams.append('startAfter', startAfter);
  const res = await fetch(url.toString());
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch treasury transactions');
  return data.transactions;
} 