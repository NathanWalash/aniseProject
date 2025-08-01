import React, { useState, useEffect } from 'react';
import { 
  View, Text, SafeAreaView, FlatList, StyleSheet, 
  TouchableOpacity, ActivityIndicator, RefreshControl 
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Announcement, listAnnouncements } from '../../../services/announcementApi';
import { AnnouncementCard } from './AnnouncementCard';
import { walletConnectService } from '../../../../wallet/walletConnectInstance';
import { API_BASE_URL, getAuthHeaders } from '../../../utils/api';

type FilterType = 'all' | 'GENERAL' | 'URGENT' | 'INFO';

interface AnnouncementsListScreenProps {
  navigation: any;
  route: {
    params: {
      daoAddress: string;
    };
  };
}

export const AnnouncementsListScreen: React.FC<AnnouncementsListScreenProps> = ({ navigation, route }) => {
  const [filter, setFilter] = useState<FilterType>('all');
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creatorNames, setCreatorNames] = useState<Record<string, string>>({});
  const { daoAddress } = route.params;

  // Get current wallet address for checking if user is creator
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  useEffect(() => {
    if (walletConnectService.isConnected() && walletConnectService.session?.namespaces?.eip155?.accounts[0]) {
      const address = walletConnectService.session.namespaces.eip155.accounts[0].split(':').pop();
      if (address) setWalletAddress(address.toLowerCase());
    }
  }, []);

  const isCreator = (announcement: Announcement): boolean => {
    if (!walletAddress) return false;
    return announcement.creator.toLowerCase() === walletAddress;
  };

  const filteredAnnouncements = announcements.filter(announcement => {
    if (filter === 'all') return true;
    return announcement.announcementType === filter;
  });

  // Fetch announcements on mount
  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setLoading(true);
        setError(null);
        const { announcements: fetchedAnnouncements } = await listAnnouncements(daoAddress);
        setAnnouncements(fetchedAnnouncements);
      } catch (err: any) {
        console.error('Error fetching announcements:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, [daoAddress]);

  // Fetch creator names when announcements change
  useEffect(() => {
    const fetchCreatorNames = async () => {
      console.log('Fetching creator names for announcements:', announcements);
      const newCreatorNames: Record<string, string> = {};
      const uniqueCreators = new Set(announcements.map(announcement => announcement.createdBy));
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
    };

    if (announcements.length > 0) {
      fetchCreatorNames();
    }
  }, [announcements]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const { announcements: fetchedAnnouncements } = await listAnnouncements(daoAddress);
      setAnnouncements(fetchedAnnouncements);
      setError(null);
    } catch (err: any) {
      console.error('Error refreshing announcements:', err);
      setError(err.message);
    } finally {
      setRefreshing(false);
    }
  };

  const renderFilterButton = (type: FilterType, label: string) => (
    <TouchableOpacity
      style={[styles.filterButton, filter === type && styles.filterButtonActive]}
      onPress={() => setFilter(type)}
    >
      <Text style={[styles.filterText, filter === type && styles.filterTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderAnnouncement = ({ item }: { item: Announcement }) => (
    <AnnouncementCard
      announcement={item}
      isCreator={isCreator(item)}
      onEdit={() => {
        // TODO: Implement edit functionality
        console.log('Edit announcement:', item.announcementId);
      }}
      onDelete={() => {
        // TODO: Implement delete functionality
        console.log('Delete announcement:', item.announcementId);
      }}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon name="megaphone" size={48} color="#9CA3AF" />
      <Text style={styles.emptyTitle}>No Announcements</Text>
      <Text style={styles.emptyText}>
        {filter === 'all' 
          ? 'No announcements have been created yet.'
          : `No ${filter.toLowerCase()} announcements found.`
        }
      </Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Loading announcements...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-back" size={24} color="#2563eb" />
        </TouchableOpacity>
        <Text style={styles.title}>Announcements</Text>
        <TouchableOpacity 
          onPress={() => {
            // TODO: Navigate to create announcement
            console.log('Create new announcement');
          }}
          style={styles.addButton}
        >
          <Icon name="add" size={24} color="#2563eb" />
        </TouchableOpacity>
      </View>

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        {renderFilterButton('all', 'All')}
        {renderFilterButton('GENERAL', 'General')}
        {renderFilterButton('URGENT', 'Urgent')}
        {renderFilterButton('INFO', 'Info')}
      </View>

      {/* Error Message */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Announcements List */}
      <FlatList
        data={filteredAnnouncements}
        renderItem={renderAnnouncement}
        keyExtractor={(item) => item.announcementId}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F7'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5'
  },
  backButton: {
    padding: 4
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827'
  },
  addButton: {
    padding: 4
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5'
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center'
  },
  filterButtonActive: {
    backgroundColor: '#2563eb'
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280'
  },
  filterTextActive: {
    color: '#fff'
  },
  errorContainer: {
    margin: 16,
    padding: 12,
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FECACA'
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    textAlign: 'center'
  },
  listContainer: {
    padding: 16
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280'
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 32
  }
}); 