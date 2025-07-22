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

  // Get wallet address from user profile
  const walletAddress = user?.wallet?.address;
  const uid = user?.uid;

  // Fetch DAOs with proper error handling and state management
  const fetchMyAnises = useCallback(async (options: { reset?: boolean; refresh?: boolean } = {}) => {
    const { reset = false, refresh = false } = options;
    
    // Validate required data
    if (!uid || !walletAddress) {
      console.log('Missing user data:', { uid, walletAddress });
      setError('Please connect your wallet first');
      return;
    }

    // Don't fetch if already loading (unless it's a refresh)
    if (!refresh && loading) {
      console.log('Already loading, skipping fetch');
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
      console.log('Fetching DAOs for:', { uid, walletAddress });
      
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
      console.log('Fetching from URL:', url);
      
      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${idToken}` },
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch DAOs: ${res.status}`);
      }

      const data = await res.json();
      console.log('Received data:', data);
      
      const mapped: Anise[] = data.daos.map((dao: any) => ({
        id: dao.daoAddress || dao.id,
        name: dao.metadata?.name || 'Unnamed DAO',
        members: dao.memberCount ?? '?',
        role: dao.role || '',
        created: formatDate(dao.createdAt),
        description: dao.metadata?.description || '',
        metadata: {
          name: dao.metadata?.name || '',
          description: dao.metadata?.description || '',
          intendedAudience: dao.metadata?.intendedAudience || '',
          mandate: dao.metadata?.mandate || '',
          isPublic: dao.metadata?.isPublic || false,
          templateId: dao.metadata?.templateId || ''
        }
      }));

      setMyAnises(reset || page === 1 ? mapped : prev => [...prev, ...mapped]);
      setHasMore(data.hasMore);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching DAOs:', err);
      setError(err.message || 'Failed to load your Nises');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [uid, walletAddress, page, search, loading]);

  // Initial load
  useEffect(() => {
    console.log('Initial load effect, user data:', { uid, walletAddress });
    if (walletAddress && uid) {
      fetchMyAnises({ reset: true });
    }
  }, [walletAddress, uid]);

  // Handle search with debounce
  useEffect(() => {
    if (!search) return; // Don't trigger on empty search
    
    const timer = setTimeout(() => {
      fetchMyAnises({ reset: true });
    }, 500);
    
    return () => clearTimeout(timer);
  }, [search]);

  // Handle refresh
  const onRefresh = useCallback(() => {
    console.log('Refreshing...');
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

  // Debug output
  console.log('Current state:', { 
    hasWallet: !!walletAddress, 
    loading, 
    refreshing, 
    anisesCount: myAnises.length,
    error 
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F5F7' }}>
      <View style={{ padding: 20, flex: 1 }}>
        {/* Header with Refresh Button */}
        <View style={{ 
          flexDirection: 'row', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: 16 
        }}>
          <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#23202A' }}>
            My Anises
          </Text>
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
        </View>

        {/* Search Bar */}
        {walletAddress && (
          <View style={{ marginBottom: 16 }}>
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search for a Nise"
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

        {/* No wallet address */}
        {!walletAddress && (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: '#888', fontSize: 18, textAlign: 'center', marginTop: 40 }}>
              Set up your wallet and join a Nise to see your groups here!
            </Text>
          </View>
        )}

        {/* Loading */}
        {walletAddress && loading && page === 1 && !refreshing && (
          <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 40 }} />
        )}

        {/* Error */}
        {walletAddress && error && (
          <View style={{ marginTop: 24, alignItems: 'center' }}>
            <Text style={{ color: 'red', marginBottom: 12 }}>{error}</Text>
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

        {/* No DAOs */}
        {walletAddress && !loading && !error && myAnises.length === 0 && (
          <Text style={{ color: '#888', fontSize: 18, textAlign: 'center', marginTop: 40 }}>
            You're not a member of any Nises yet. Join or create one to get started!
          </Text>
        )}

        {/* List of Anises */}
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
          
          {/* Load More button */}
          {hasMore && !loading && myAnises.length > 0 && (
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
          
          {/* Loading more indicator */}
          {loading && page > 1 && (
            <ActivityIndicator size="small" color="#2563eb" style={{ marginTop: 16 }} />
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}