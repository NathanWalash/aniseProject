import React, { useEffect, useState, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import exampleNotifications from './exampleNotifications.json';
import { Swipeable } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming } from 'react-native-reanimated';

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

  const deleteNotification = (id: string) => {
    setNotifications(notifications => notifications.filter(n => n.id !== id));
  };

  const markAllAsRead = () => {
    setNotifications(notifications => notifications.map(n => ({ ...n, read: true })));
  };

  // DEMO: set 'today' to a fixed date in 2024
  const DEMO_TODAY = new Date('2024-06-09T12:00:00Z'); // Sunday, June 9, 2024
  const filteredNotifications = notifications.filter(n => {
    if (filter === 'all') return true;
    const notifDate = new Date(n.createdAt);
    // Use DEMO_TODAY for 'today' and 'week' filters
    const now = DEMO_TODAY;
    if (filter === 'today') {
      return notifDate.getFullYear() === now.getFullYear() &&
        notifDate.getMonth() === now.getMonth() &&
        notifDate.getDate() === now.getDate();
    }
    if (filter === 'week') {
      // Use DEMO_TODAY as the reference for the week
      const firstDayOfWeek = new Date(now);
      firstDayOfWeek.setDate(now.getDate() - now.getDay());
      const lastDayOfWeek = new Date(firstDayOfWeek);
      lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6);
      return notifDate >= firstDayOfWeek && notifDate <= lastDayOfWeek;
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
  // Sort so DEMO_TODAY group ("Today") is first, then others descending
  const groupKeys = Object.keys(grouped).sort((a, b) => {
    const demoTodayStr = DEMO_TODAY.toDateString();
    if (a === demoTodayStr) return -1;
    if (b === demoTodayStr) return 1;
    return new Date(b).getTime() - new Date(a).getTime();
  });

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  // Always show filter buttons, even if empty state
  const renderEmptyState = () => (
    <View style={styles.centered}>
      <Icon name="notifications-off-outline" size={64} color="#d1d5db" style={{ marginBottom: 12 }} />
      <Text style={styles.emptyTitle}>You're all caught up!</Text>
      <Text style={styles.emptySubtitle}>No notifications at the moment.</Text>
    </View>
  );

  // Animated pulse for unread dot
  function UnreadDotPulse({ show }: { show: boolean }) {
    const scale = useSharedValue(1);
    useEffect(() => {
      if (show) {
        scale.value = withRepeat(
          withSequence(
            withTiming(1.2, { duration: 400 }),
            withTiming(1, { duration: 400 })
          ),
          -1,
          true
        );
      } else {
        scale.value = 1;
      }
    }, [show]);
    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));
    if (!show) return null;
    return <Animated.View style={[styles.unreadDot, animatedStyle]} />;
  }

  // Swipeable right actions
  const renderRightActions = (notif: any) => (
    <View style={{ flexDirection: 'row', height: '100%' }}>
      {!notif.read && (
        <TouchableOpacity
          style={[styles.swipeAction, { backgroundColor: '#2563eb' }]}
          onPress={() => markAsRead(notif.id)}
        >
          <Icon name="checkmark-done-outline" size={22} color="#fff" />
          <Text style={styles.swipeText}>Read</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity
        style={[styles.swipeAction, { backgroundColor: '#ef4444' }]}
        onPress={() => deleteNotification(notif.id)}
      >
        <Icon name="trash-outline" size={22} color="#fff" />
        <Text style={styles.swipeText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  // Handle card tap: just mark as read
  const handleCardPress = (notif: any) => {
    markAsRead(notif.id);
  };

  // Handle long press
  const handleLongPress = (notif: any) => {
    Alert.alert(
      'Notification Options',
      'Choose an action:',
      [
        { text: 'Mute this type', onPress: () => {} },
        { text: 'View details', onPress: () => {} },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Sticky Header Bar */}
      <View style={styles.headerBar}>
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity onPress={markAllAsRead} style={styles.headerBtn} accessibilityLabel="Mark all as read">
          <Icon name="checkmark-done-outline" size={24} color="#2563eb" />
        </TouchableOpacity>
      </View>
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
      {filteredNotifications.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={groupKeys}
          keyExtractor={date => date}
          contentContainerStyle={styles.listContent}
          renderItem={({ item: date }) => (
            <View>
              <Text style={styles.dateHeader}>{date}</Text>
              {grouped[date].map((notif: any, idx: number) => (
                <Swipeable
                  key={notif.id}
                  renderRightActions={() => renderRightActions(notif)}
                  overshootRight={false}
                >
                  <TouchableOpacity
                    style={[styles.card, !notif.read && styles.cardUnread]}
                    activeOpacity={0.85}
                    onPress={() => handleCardPress(notif)}
                    onLongPress={() => handleLongPress(notif)}
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
                    <UnreadDotPulse show={!notif.read} />
                  </TouchableOpacity>
                </Swipeable>
              ))}
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'android' ? 36 : 56,
    paddingBottom: 12,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222',
  },
  headerBtn: {
    padding: 6,
    borderRadius: 20,
  },
  listContent: {
    paddingHorizontal: 0,
    paddingTop: 8,
    paddingBottom: 32,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    marginHorizontal: 16,
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
  swipeAction: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 72,
    height: '90%',
    marginVertical: 6,
    borderRadius: 14,
    marginRight: 8,
    flexDirection: 'column',
  },
  swipeText: {
    color: '#fff',
    fontSize: 12,
    marginTop: 2,
  },
}); 