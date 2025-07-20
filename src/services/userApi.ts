import { API_BASE_URL } from '../utils/api';

export async function getUserDaos(userId: string) {
  const res = await fetch(`${API_BASE_URL}/api/users/${userId}/daos`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch user DAOs');
  return data.daos;
}

export async function getUserTokenBalance(userId: string) {
  const res = await fetch(`${API_BASE_URL}/api/users/${userId}/token-balance`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch user token balance');
  return data;
}

export async function getUserNotifications(userId: string) {
  const res = await fetch(`${API_BASE_URL}/api/users/${userId}/notifications`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch notifications');
  return data.notifications;
} 