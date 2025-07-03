import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Image, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import exampleNotifications from './exampleNotifications.json';

function formatDate(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  if (isToday) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  return date.toLocaleDateString();
}

const typeIcon: Record<string, string> = {
  invite: 'person-add-outline',
  membership: 'checkmark-done-outline',
  role: 'shield-checkmark-outline',
  proposal: 'document-text-outline',
  voting: 'checkbox-outline',
  proposal_result: 'ribbon-outline',
  payment: 'cash-outline',
  payment_issue: 'alert-circle-outline',
  subscription: 'calendar-outline',
  reminder: 'alarm-outline',
};

const FILTERS = [
  { label: 'All', value: 'all' },
  { label: 'Today', value: 'today' },
  { label: 'This Week', value: 'week' },
];

function isThisWeek(date: Date) {
  const now = new Date();
  const firstDayOfWeek = new Date(now);
  firstDayOfWeek.setDate(now.getDate() - now.getDay());
  const lastDayOfWeek = new Date(firstDayOfWeek);
  lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6);
  return date >= firstDayOfWeek && date <= lastDayOfWeek;
}

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setNotifications(exampleNotifications);
      setLoading(false);
    }, 800);
  }, []);

  const markAsRead = (id: string) => {
    setNotifications(notifications =>
      notifications.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  // Filter notifications
  const filteredNotifications = notifications.filter(n => {
    if (filter === 'all') return true;
    const date = new Date(n.createdAt);
    if (filter === 'today') {
      const now = new Date();
      return date.toDateString() === now.toDateString();
    }
    if (filter === 'week') {
      return isThisWeek(date);
    }
    return true;
  });

  // Group notifications by date
  const grouped = filteredNotifications.reduce((acc, notif) => {
    const date = new Date(notif.createdAt).toDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(notif);
    return acc;
  }, {} as Record<string, any[]>);
  const groupKeys = Object.keys(grouped).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (filteredNotifications.length === 0) {
    return (
      <View style={styles.centered}>
        <Icon name="notifications-off-outline" size={64} color="#d1d5db" style={{ marginBottom: 12 }} />
        <Text style={styles.emptyTitle}>You're all caught up!</Text>
        <Text style={styles.emptySubtitle}>No notifications at the moment.</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {/* Time Filter Segmented Control */}
      <View style={styles.filterRow}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f.value}
            style={[styles.filterBtn, filter === f.value && styles.filterBtnActive]}
            onPress={() => setFilter(f.value)}
            activeOpacity={0.8}
          >
            <Text style={[styles.filterText, filter === f.value && styles.filterTextActive]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <FlatList
        data={groupKeys}
        keyExtractor={date => date}
        contentContainerStyle={styles.listContent}
        renderItem={({ item: date }) => (
          <View>
            <Text style={styles.dateHeader}>{date}</Text>
            {grouped[date].map((notif: any, idx: number) => (
              <TouchableOpacity
                key={notif.id}
                style={[styles.card, !notif.read && styles.cardUnread]}
                activeOpacity={0.85}
                onPress={() => markAsRead(notif.id)}
              >
                <View style={styles.iconWrap}>
                  <Icon name={typeIcon[notif.type] || 'notifications-outline'} size={28} color={notif.read ? '#888' : '#2563eb'} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.message, !notif.read && styles.messageUnread]}>{notif.message}</Text>
                  <View style={styles.metaRow}>
                    {notif.groupName && (
                      <Text style={styles.groupName}>{notif.groupName}</Text>
                    )}
                    <Text style={styles.time}>{formatDate(notif.createdAt)}</Text>
                  </View>
                </View>
                {!notif.read && <View style={styles.unreadDot} />}
              </TouchableOpacity>
            ))}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: 0,
    paddingTop: 16,
    paddingBottom: 32,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    marginHorizontal: 16, // less wide than before
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  cardUnread: {
    backgroundColor: '#e0e7ff',
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  message: {
    fontSize: 16,
    color: '#222',
    marginBottom: 4,
  },
  messageUnread: {
    fontWeight: 'bold',
    color: '#2563eb',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  groupName: {
    color: '#2563eb',
    fontWeight: 'bold',
    fontSize: 13,
  },
  time: {
    color: '#888',
    fontSize: 13,
    marginLeft: 8,
  },
  unreadDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#2563eb',
    marginLeft: 10,
  },
  dateHeader: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 6,
    marginLeft: 20,
    marginTop: 10,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#888',
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    marginTop: 8,
    gap: 8,
  },
  filterBtn: {
    paddingVertical: 7,
    paddingHorizontal: 18,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    marginHorizontal: 4,
  },
  filterBtnActive: {
    backgroundColor: '#2563eb',
  },
  filterText: {
    color: '#222',
    fontWeight: '500',
    fontSize: 15,
  },
  filterTextActive: {
    color: '#fff',
  },
}); 