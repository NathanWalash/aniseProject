import { API_BASE_URL } from '../utils/api';

// Calls GET /api/users/:userId/daos to list all DAOs a user is a member/admin of.
export async function getUserDaos(userId: string) {
  const res = await fetch(`${API_BASE_URL}/api/users/${userId}/daos`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch user DAOs');
  return data.daos;
}

// Calls GET /api/users/:userId/notifications to list all notifications for a user.
export async function getUserNotifications(userId: string) {
  const res = await fetch(`${API_BASE_URL}/api/users/${userId}/notifications`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch notifications');
  return data.notifications;
} 