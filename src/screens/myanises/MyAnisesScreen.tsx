import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, SafeAreaView, ScrollView, Alert, ActivityIndicator, TextInput, TouchableOpacity, RefreshControl } from 'react-native';
import { AniseCard } from './AniseCard';
import { Anise } from './types/myAnise';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../../utils/api';

// Helper to format date
function formatDate(dateVal: any) {
  if (!dateVal) return '';
  // Firestore Timestamp object (new SDK)
  if (typeof dateVal === 'object' && typeof dateVal._seconds === 'number') {
    return new Date(dateVal._seconds * 1000).toLocaleDateString();
  }
  // Firestore Timestamp object (old SDK)
  if (typeof dateVal === 'object' && typeof dateVal.seconds === 'number') {
    return new Date(dateVal.seconds * 1000).toLocaleDateString();
  }
  // Milliseconds timestamp
  if (typeof dateVal === 'number') {
    return new Date(dateVal).toLocaleDateString();
  }
  // ISO or human-readable string
  if (typeof dateVal === 'string') {
    const d = new Date(dateVal);
    return isNaN(d.getTime()) ? dateVal : d.toLocaleDateString();
  }
  return '';
}

export default function MyAnisesScreen({ navigation, user }: { navigation: any, user: any }) {
  const [myAnises, setMyAnises] = useState<Anise[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  // Get user data
  const walletAddress = user?.wallet?.address;
  const uid = user?.uid;

  // Fetch DAOs with proper error handling and state management
  const fetchMyAnises = useCallback(async (options: { reset?: boolean; refresh?: boolean } = {}) => {
    const { reset = false, refresh = false } = options;
    
    // Validate required data
    if (!uid) {
      console.log('[MyAnises] No UID available:', { uid });
      setError('Please log in to view your Anises');
      setInitialLoad(false);
      return;
    }

    if (!walletAddress) {
      console.log('[MyAnises] No wallet connected:', { uid });
      setError('Please connect your wallet to view your Anises');
      setInitialLoad(false);
      return;
    }

    // Don't fetch if already loading (unless it's a refresh)
    if (!refresh && loading) {
      console.log('[MyAnises] Already loading, skipping fetch');
      return;
    }

    // Set loading state
    if (!refresh) setLoading(true);

    // Reset state if needed
    if (reset) {
      setPage(1);
      setMyAnises([]);
    }

    try {
      console.log('[MyAnises] Fetching DAOs:', { uid, walletAddress, page, search });
      
      const idToken = await AsyncStorage.getItem('idToken');
      if (!idToken) {
        throw new Error('Not authenticated');
      }

      const params = new URLSearchParams({
        page: String(reset ? 1 : page),
        limit: '10',
        ...(search && { search })
      });

      const url = `${API_BASE_URL}/api/users/${uid}/daos?${params}`;
      console.log('[MyAnises] Fetching from URL:', url);
      
      let errorData;
      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${idToken}` },
      });

      try {
        errorData = await res.json();
      } catch (e) {
        console.error('[MyAnises] Failed to parse response:', e);
        throw new Error('Failed to parse server response');
      }

      if (!res.ok) {
        console.error('[MyAnises] API error:', errorData);
        throw new Error(errorData.error || `Failed to fetch DAOs: ${res.status}`);
      }

      const data = errorData; // We already parsed it
      console.log('[MyAnises] Received data:', {
        total: data.total,
        hasMore: data.hasMore,
        daoCount: data.daos?.length
      });
      
      if (!Array.isArray(data.daos)) {
        console.error('[MyAnises] Invalid data format:', data);
        throw new Error('Invalid data format received from server');
      }

      const mapped: Anise[] = data.daos.map((dao: any) => {
        console.log('[MyAnises] Processing DAO:', {
          id: dao.daoAddress,
          name: dao.metadata?.name,
          role: dao.role,
          memberCount: dao.memberCount
        });
        
        return {
          id: dao.daoAddress,
          name: dao.metadata?.name || 'Unnamed DAO',
          description: dao.metadata?.description || '',
          members: dao.memberCount ?? 0,
          role: dao.role || 'Member',
          created: formatDate(dao.createdAt),
          status: 'Active',
          metadata: {
            name: dao.metadata?.name || '',
            description: dao.metadata?.description || '',
            intendedAudience: dao.metadata?.intendedAudience || '',
            mandate: dao.metadata?.mandate || '',
            isPublic: dao.metadata?.isPublic || false,
            templateId: dao.metadata?.templateId || ''
          },
          modules: dao.modules || {}
        };
      });

      console.log('[MyAnises] Mapped DAOs:', mapped.map(d => ({
        id: d.id,
        name: d.name,
        role: d.role
      })));

      setMyAnises(prev => {
        const newState = reset ? mapped : [...prev, ...mapped];
        console.log('[MyAnises] New state:', newState.length, 'DAOs');
        return newState;
      });
      setHasMore(data.hasMore);
      setError(null);
    } catch (err: any) {
      console.error('[MyAnises] Error:', err);
      setError(err.message || 'Failed to load your Anises');
      Alert.alert(
        'Error Loading Anises',
        `${err.message}\n\nPlease try again or contact support if the issue persists.`
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
      setInitialLoad(false);
    }
  }, [uid, walletAddress, page, search, loading]);

  // Initial load
  useEffect(() => {
    if (uid) {
      fetchMyAnises({ reset: true });
    } else {
      setInitialLoad(false);
    }
  }, [uid, walletAddress]);

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (uid && walletAddress) {
        fetchMyAnises({ reset: true });
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [search]);

  // Handle refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchMyAnises({ reset: true, refresh: true });
  }, [fetchMyAnises]);

  // Handle load more
  const handleLoadMore = () => {
    if (hasMore && !loading) {
      setPage(p => p + 1);
      fetchMyAnises();
    }
  };

  // Handler for the View & Manage button
  const handleViewManage = (anise: Anise) => {
    navigation.navigate('AniseDetails', { anise });
  };

  if (initialLoad) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F5F7' }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F5F7' }}>
      <View style={{ padding: 20, flex: 1 }}>
        {/* Header */}
        <View style={{ 
          flexDirection: 'row', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: 16 
        }}>
          <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#23202A' }}>
            My Anises
          </Text>
          {walletAddress && myAnises.length > 0 && (
            <TouchableOpacity 
              onPress={onRefresh}
              disabled={loading || refreshing}
              style={{ 
                backgroundColor: '#2563eb',
                padding: 8,
                borderRadius: 8,
                opacity: (loading || refreshing) ? 0.7 : 1
              }}
            >
              <Text style={{ color: '#fff', fontWeight: '500' }}>
                {loading || refreshing ? 'Refreshing...' : 'Refresh'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Search Bar - Only show if we have DAOs */}
        {walletAddress && myAnises.length > 0 && (
          <View style={{ marginBottom: 16 }}>
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search your Anises"
              style={{ 
                backgroundColor: '#fff',
                borderRadius: 8,
                padding: 12,
                fontSize: 16,
                borderWidth: 1,
                borderColor: '#eee'
              }}
              placeholderTextColor="#888"
            />
          </View>
        )}

        {/* Error State */}
        {error && (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: 'red', marginBottom: 12, textAlign: 'center' }}>{error}</Text>
            <TouchableOpacity 
              onPress={() => fetchMyAnises({ reset: true })}
              style={{ 
                backgroundColor: '#2563eb',
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 6
              }}
            >
              <Text style={{ color: '#fff' }}>Try Again</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* No Wallet Connected */}
        {!walletAddress && !error && (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: '#888', fontSize: 18, textAlign: 'center' }}>
              Connect your wallet to view your Anises
            </Text>
          </View>
        )}

        {/* No DAOs */}
        {walletAddress && !error && !loading && myAnises.length === 0 && (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: '#888', fontSize: 18, textAlign: 'center' }}>
              You're not a member of any Anises yet.{'\n'}Join or create one to get started!
            </Text>
          </View>
        )}

        {/* List of Anises */}
        {myAnises.length > 0 && (
          <ScrollView
            contentContainerStyle={{ paddingBottom: 40 }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#2563eb']}
                tintColor="#2563eb"
              />
            }
          >
            {myAnises.map(anise => (
              <AniseCard 
                key={anise.id} 
                anise={anise} 
                onViewManage={() => handleViewManage(anise)} 
              />
            ))}
            
            {/* Load More */}
            {hasMore && !loading && (
              <TouchableOpacity 
                onPress={handleLoadMore} 
                style={{ 
                  marginTop: 16,
                  alignSelf: 'center',
                  backgroundColor: '#2563eb',
                  borderRadius: 8,
                  paddingVertical: 10,
                  paddingHorizontal: 24
                }}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>
                  Load More
                </Text>
              </TouchableOpacity>
            )}
            
            {/* Loading More Indicator */}
            {loading && page > 1 && (
              <ActivityIndicator size="small" color="#2563eb" style={{ marginTop: 16 }} />
            )}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}