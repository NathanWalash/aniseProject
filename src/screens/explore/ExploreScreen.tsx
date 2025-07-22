import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../../utils/api';

interface PublicDAO {
  daoAddress: string;
  metadata: {
    name: string;
    description: string;
    intendedAudience: string;
    mandate: string;
    isPublic: boolean;
    templateId: string;
  };
  memberCount: number;
  creator: string;
  creatorUid?: string; // Add creatorUid field
  createdAt: any;
  creatorDetails?: {
    firstName: string;
    lastName: string;
  };
}

const FILTERS = ['All', 'Recent', 'Popular'];

export default function ExploreScreen() {
  const [search, setSearch] = useState('');
  const [privateAddress, setPrivateAddress] = useState('');
  const [filter, setFilter] = useState('All');
  const [daos, setDaos] = useState<PublicDAO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Add effect to reset and fetch when filter changes
  useEffect(() => {
    setPage(1); // Reset page when filter changes
    fetchPublicDaos(true); // true means reset
  }, [filter]);

  const fetchPublicDaos = async (reset: boolean = false) => {
    try {
      console.log('Fetching public DAOs...', { filter, reset });
      const idToken = await AsyncStorage.getItem('idToken');
      if (!idToken) throw new Error('Not authenticated');

      const params = new URLSearchParams({
        page: String(reset ? 1 : page),
        limit: '10',
        ...(search && { search }),
        ...(filter !== 'All' && { sort: filter.toLowerCase() })
      });

      const url = `${API_BASE_URL}/api/daos?${params}`;
      console.log('Fetching from URL:', url);

      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${idToken}` }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        throw new Error(`Failed to fetch DAOs: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Received DAOs:', data);

      // Filter for public DAOs first
      const publicDaos = data.daos.filter((dao: any) => dao.metadata?.isPublic === true);
      
      // Fetch creator details for each public DAO
      const daosWithDetails = await Promise.all(publicDaos.map(async (dao: PublicDAO) => {
        try {
          // Get member count from members subcollection
          const membersSnapshot = await fetch(`${API_BASE_URL}/api/daos/${dao.daoAddress}/members`, {
            headers: { 'Authorization': `Bearer ${idToken}` }
          });
          
          let memberCount = 0;
          if (membersSnapshot.ok) {
            const membersData = await membersSnapshot.json();
            memberCount = membersData.members.length;
          }

          // Get creator details from members collection
          const creatorMemberDoc = await fetch(`${API_BASE_URL}/api/daos/${dao.daoAddress}/members/${dao.creator}`, {
            headers: { 'Authorization': `Bearer ${idToken}` }
          });

          let creatorDetails;
          if (creatorMemberDoc.ok) {
            const memberData = await creatorMemberDoc.json();
            console.log('Creator member data:', memberData);
            if (memberData.uid) {
              // Use the /auth/me endpoint with the creator's uid
              const userDoc = await fetch(`${API_BASE_URL}/api/auth/me?uid=${memberData.uid}`, {
                headers: { 'Authorization': `Bearer ${idToken}` }
              });
              if (userDoc.ok) {
                const userData = await userDoc.json();
                console.log('Creator user data:', userData);
                creatorDetails = {
                  firstName: userData.firstName || '',
                  lastName: userData.lastName || ''
                };
              }
            }
          }

          return {
            ...dao,
            memberCount,
            creatorDetails
          };
        } catch (err) {
          console.warn('Failed to fetch details for DAO:', dao.daoAddress, err);
          return {
            ...dao,
            memberCount: 1 // At least the creator is a member
          };
        }
      }));

      console.log('DAOs with details:', daosWithDetails);
      
      setDaos(prev => reset ? daosWithDetails : [...prev, ...daosWithDetails]);
      setHasMore(daosWithDetails.length === 10);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching DAOs:', err);
      setError(err.message || 'Failed to load DAOs');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      setPage(p => p + 1);
      fetchPublicDaos();
    }
  };

  const handleSearch = () => {
    setPage(1);
    fetchPublicDaos(true);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setPage(1);
    fetchPublicDaos(true);
  };

  const handleJoinPrivate = () => {
    // TODO: Implement private DAO join logic
    console.log('Joining private DAO:', privateAddress);
  };

  const handleJoinRequest = (dao: PublicDAO) => {
    // TODO: Implement join request logic
    console.log('Requesting to join:', dao.daoAddress);
  };

  // Update the filter handler to reset the page
  const handleFilterChange = (newFilter: string) => {
    if (newFilter === filter) return; // Don't do anything if filter hasn't changed
    setFilter(newFilter);
    // Page reset and fetch will happen in the useEffect
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header with Title and Refresh */}
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Explore Public DAOs</Text>
          <TouchableOpacity 
            onPress={handleRefresh}
            disabled={loading || refreshing}
            style={[
              styles.refreshButton,
              (loading || refreshing) && styles.refreshButtonDisabled
            ]}
          >
            <Icon 
              name="refresh" 
              size={20} 
              color="#fff" 
              style={refreshing && styles.refreshingIcon} 
            />
          </TouchableOpacity>
        </View>

        {/* Search and Private Join */}
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <Icon name="search" size={20} color="#6B7280" style={styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, { color: '#000000' }]} // Make text black
              placeholder="Search DAOs..."
              placeholderTextColor="#6B7280" // Keep placeholder gray
              value={search}
              onChangeText={setSearch}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
          </View>

          <View style={styles.privateContainer}>
            <Icon name="link" size={20} color="#6B7280" style={styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, { color: '#000000' }]} // Make text black
              placeholder="Enter DAO address to join..."
              placeholderTextColor="#6B7280" // Keep placeholder gray
              value={privateAddress}
              onChangeText={setPrivateAddress}
            />
            <TouchableOpacity
              style={[styles.joinButton, !privateAddress && styles.joinButtonDisabled]}
              onPress={handleJoinPrivate}
              disabled={!privateAddress}
            >
              <Text style={styles.joinButtonText}>Join</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Filters */}
        <View style={styles.filterContainer}>
          {FILTERS.map(f => (
            <TouchableOpacity
              key={f}
              onPress={() => handleFilterChange(f)}
              style={[styles.filterButton, filter === f && styles.filterButtonActive]}
            >
              <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Loading State */}
        {loading && page === 1 && !refreshing && (
          <ActivityIndicator size="large" color="#2563eb" style={styles.loader} />
        )}

        {/* Error State */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => fetchPublicDaos(true)}
            >
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* DAO List */}
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#2563eb']}
              tintColor="#2563eb"
            />
          }
        >
          {daos.map((dao, index) => (
            <View key={`${dao.daoAddress}-${index}`} style={styles.daoCard}>
              <View style={styles.daoHeader}>
                <Text style={styles.daoName}>{dao.metadata.name}</Text>
                <View style={styles.memberCountContainer}>
                  <Icon name="people" size={16} color="#6B7280" />
                  {dao.memberCount === undefined ? (
                    <ActivityIndicator size="small" color="#6B7280" style={{ marginLeft: 4 }} />
                  ) : (
                    <Text style={styles.memberCount}>
                      {dao.memberCount} members
                    </Text>
                  )}
                </View>
              </View>

              <Text style={styles.daoDescription}>{dao.metadata.description}</Text>

              <View style={styles.daoFooter}>
                <View style={styles.creatorInfo}>
                  <Icon name="person" size={16} color="#6B7280" />
                  <Text style={styles.creatorText}>
                    Created by{' '}
                    {dao.creatorDetails?.firstName ? (
                      <Text style={styles.creatorName}>
                        {dao.creatorDetails.firstName} {dao.creatorDetails.lastName}
                      </Text>
                    ) : (
                      <ActivityIndicator size="small" color="#6B7280" />
                    )}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.requestButton}
                  onPress={() => handleJoinRequest(dao)}
                >
                  <Text style={styles.requestButtonText}>Request to Join</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}

          {/* Load More */}
          {hasMore && !loading && daos.length > 0 && (
            <TouchableOpacity style={styles.loadMoreButton} onPress={handleLoadMore}>
              <Text style={styles.loadMoreText}>Load More</Text>
            </TouchableOpacity>
          )}

          {/* Loading More Indicator */}
          {loading && page > 1 && (
            <ActivityIndicator size="small" color="#2563eb" style={styles.loadingMore} />
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F7',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  refreshButton: {
    backgroundColor: '#2563eb',
    padding: 8,
    borderRadius: 8,
  },
  refreshButtonDisabled: {
    opacity: 0.5,
  },
  refreshingIcon: {
    transform: [{ rotate: '45deg' }],
  },
  searchSection: {
    gap: 12,
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
  },
  privateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
    color: '#000000', // Ensure text is black
    paddingVertical: 8,
  },
  joinButton: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginLeft: 8,
  },
  joinButtonDisabled: {
    opacity: 0.5,
  },
  joinButtonText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 14,
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterButtonActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  filterText: {
    color: '#6B7280',
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#fff',
  },
  scrollContent: {
    gap: 12,
  },
  daoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  daoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  daoName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  memberCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  memberCount: {
    fontSize: 14,
    color: '#6B7280',
  },
  daoDescription: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 12,
  },
  daoFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  creatorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  creatorText: {
    fontSize: 14,
    color: '#6B7280',
  },
  creatorName: {
    color: '#111827',
    fontWeight: '500',
  },
  creatorAddress: {
    color: '#6B7280',
    fontFamily: 'monospace',
  },
  requestButton: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  requestButtonText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 14,
  },
  loadMoreButton: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  loadMoreText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loadingMore: {
    marginTop: 16,
  },
  loader: {
    marginTop: 40,
  },
  errorContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  errorText: {
    color: '#EF4444',
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
}); 