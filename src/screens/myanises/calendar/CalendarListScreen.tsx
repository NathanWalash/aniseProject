import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  RefreshControl, Alert, ActivityIndicator, FlatList
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import { calendarApi, Event } from '../../../services/calendarApi';
import { walletConnectService } from '../../../../wallet/walletConnectInstance';
import { API_BASE_URL, getAuthHeaders } from '../../../utils/api';
import { EventCard } from './EventCard';

interface CalendarListScreenProps {
  route: {
    params: {
      daoAddress: string;
    };
  };
  navigation: any;
}

export const CalendarListScreen: React.FC<CalendarListScreenProps> = ({ route, navigation }) => {
  const { daoAddress } = route.params;
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'ongoing' | 'past'>('all');
  const [currentUserAddress, setCurrentUserAddress] = useState<string | null>(null);
  const [creatorNames, setCreatorNames] = useState<{ [key: string]: string }>({});

  const loadEvents = useCallback(async () => {
    try {
      setLoading(true);
      const eventsData = await calendarApi.listEvents(daoAddress);
      setEvents(eventsData);
    } catch (error) {
      console.error('Error loading events:', error);
      Alert.alert('Error', 'Failed to load events');
    } finally {
      setLoading(false);
    }
  }, [daoAddress]);

  const fetchCreatorNames = useCallback(async () => {
    console.log('Fetching creator names for events:', events);
    const newCreatorNames: Record<string, string> = {};
    const uniqueCreators = new Set(events.map(event => event.createdBy).filter(Boolean));
    console.log('Unique creators:', Array.from(uniqueCreators));
    
    try {
      const headers = await getAuthHeaders();
      
      for (const uid of uniqueCreators) {
        try {
          console.log('Fetching name for creator:', uid);
          const res = await fetch(`${API_BASE_URL}/api/auth/users/${uid}`, { headers });
          const data = await res.json();
          console.log('Creator data response:', data);
          if (res.ok) {
            newCreatorNames[uid] = `${data.firstName} ${data.lastName}`;
          }
        } catch (err) {
          console.error('Error fetching creator name:', err);
        }
      }
      console.log('Final creator names:', newCreatorNames);
      setCreatorNames(newCreatorNames);
    } catch (err) {
      console.error('Error getting auth headers:', err);
    }
  }, [events]);

  // Load events when component mounts
  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  // Fetch creator names when events change
  useEffect(() => {
    if (events.length > 0) {
      fetchCreatorNames();
    }
  }, [events]); // Remove fetchCreatorNames from dependencies to avoid circular dependency

  // Get current wallet address for checking if user is creator
  useEffect(() => {
    if (walletConnectService.isConnected() && walletConnectService.session?.namespaces?.eip155?.accounts[0]) {
      const address = walletConnectService.session.namespaces.eip155.accounts[0].split(':').pop();
      if (address) setCurrentUserAddress(address.toLowerCase());
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadEvents();
    }, [loadEvents])
  );

  useEffect(() => {
    applyFilter();
  }, [events, filter]);

  const applyFilter = () => {
    const now = new Date();
    let filtered = [...events];

    switch (filter) {
      case 'upcoming':
        filtered = events.filter(event => {
          const startTime = new Date(event.startTime * 1000);
          return startTime > now;
        });
        break;
      case 'ongoing':
        filtered = events.filter(event => {
          const startTime = new Date(event.startTime * 1000);
          const endTime = new Date(event.endTime * 1000);
          return startTime <= now && endTime >= now;
        });
        break;
      case 'past':
        filtered = events.filter(event => {
          const endTime = new Date(event.endTime * 1000);
          return endTime < now;
        });
        break;
      default:
        // 'all' - no filtering
        break;
    }

    setFilteredEvents(filtered);
  };

  const handleDeleteEvent = async (event: Event) => {
    try {
      await calendarApi.deleteEvent(daoAddress, event.eventId);
      await loadEvents();
    } catch (error: any) {
      console.error('Error deleting event:', error);
      Alert.alert('Error', error.message || 'Failed to delete event');
    }
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadEvents();
    setRefreshing(false);
  }, [loadEvents]);

  const renderFilterButton = (filterType: 'all' | 'upcoming' | 'ongoing' | 'past', label: string) => (
    <TouchableOpacity
      style={[styles.filterButton, filter === filterType && styles.filterButtonActive]}
      onPress={() => setFilter(filterType)}
    >
      <Text style={[styles.filterButtonText, filter === filterType && styles.filterButtonTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-back" size={24} color="#2563eb" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Events</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading events...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#2563eb" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Events</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.subtitleContainer}>
        <Text style={styles.subtitle}>{filteredEvents.length} events found</Text>
      </View>

      <View style={styles.filterContainer}>
        {renderFilterButton('all', 'All')}
        {renderFilterButton('upcoming', 'Upcoming')}
        {renderFilterButton('ongoing', 'Ongoing')}
        {renderFilterButton('past', 'Past')}
      </View>

      {filteredEvents.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="calendar-outline" size={48} color="#9ca3af" />
          <Text style={styles.emptyText}>No events found</Text>
          <Text style={styles.emptySubtext}>
            {filter === 'all' 
              ? 'Create your first event to get started'
              : `No ${filter} events found`
            }
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredEvents}
          keyExtractor={(item: Event) => item.eventId.toString()}
          renderItem={({ item }: { item: Event }) => (
            <EventCard
              event={item}
              onDelete={() => handleDeleteEvent(item)}
              isCreator={item.createdBy === currentUserAddress || item.creator === currentUserAddress}
              creatorName={creatorNames[item.createdBy]}
            />
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40, // Adjust as needed for spacing
  },
  subtitleContainer: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#f3f4f6',
  },
  filterButtonActive: {
    backgroundColor: '#2563eb',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  listContainer: {
    padding: 20,
  },
  listContent: {
    paddingBottom: 20, // Add some padding at the bottom for the last item
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 8,
    textAlign: 'center',
  },
}); 