import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, SafeAreaView, ScrollView, Alert, ActivityIndicator, TextInput, TouchableOpacity } from 'react-native';
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

// Inefficient: fetch member count for each DAO by counting the members subcollection
async function fetchMemberCount(daoAddress: string, idToken: string): Promise<number | string> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/daos/${daoAddress}/members`, {
      headers: { 'Authorization': `Bearer ${idToken}` },
    });
    if (!res.ok) return '?';
    const data = await res.json();
    return Array.isArray(data.members) ? data.members.length : '?';
  } catch {
    return '?';
  }
}

export default function MyAnisesScreen({ navigation, user }: { navigation: any, user: any }) {
  const [myAnises, setMyAnises] = useState<Anise[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Get wallet address from user profile (assume passed as prop)
  console.log('[MyAnisesScreen] user prop:', user);
  const walletAddress = user?.walletAddress || user?.wallet?.address;
  const uid = user?.uid;
  console.log('[MyAnisesScreen] walletAddress:', walletAddress, 'uid:', uid);

  const fetchMyAnises = useCallback(async (reset = false) => {
    if (!uid) return;
    setLoading(true);
    setError(null);
    try {
      const idToken = await AsyncStorage.getItem('idToken');
      if (!idToken) throw new Error('Not authenticated');
      const params = new URLSearchParams();
      params.append('page', String(reset ? 1 : page));
      params.append('limit', '10');
      if (search) params.append('search', search);
      const url = `${API_BASE_URL}/api/users/${uid}/daos?${params.toString()}`;
      console.log('[MyAnisesScreen] Fetching:', url);
      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${idToken}` },
      });
      console.log('[MyAnisesScreen] Response status:', res.status);
      const data = await res.json();
      console.log('[MyAnisesScreen] Response data:', data);
      // Map API response to Anise type
      const mapped: Anise[] = (data.daos || []).map((dao: any) => ({
        id: dao.daoAddress || dao.id,
        name: dao.metadata?.name || 'Unnamed DAO',
        members: dao.memberCount ?? (dao.members ? dao.members.length : '?'),
        role: dao.role || '',
        created: dao.createdAt ? formatDate(dao.createdAt) : '',
      }));
      setMyAnises(reset ? mapped : prev => [...prev, ...mapped]);
      setHasMore(mapped.length === 10); // If less than limit, no more pages
    } catch (err: any) {
      setError(err.message || 'Failed to load your Nises');
    } finally {
      setLoading(false);
    }
  }, [uid, page, search]);

  // Fetch on mount and when search/page changes
  useEffect(() => {
    let cancelled = false;
    async function fetchAll() {
      if (walletAddress) {
        setLoading(true);
        setError(null);
        try {
          const idToken = await AsyncStorage.getItem('idToken');
          if (!idToken) throw new Error('Not authenticated');
          const params = new URLSearchParams();
          params.append('page', String(page));
          params.append('limit', '10');
          // Search is not functional yet (TODO: implement search functionality)
          // if (search) params.append('search', search);
          const url = `${API_BASE_URL}/api/users/${uid}/daos?${params.toString()}`;
          const res = await fetch(url, {
            headers: { 'Authorization': `Bearer ${idToken}` },
          });
          const data = await res.json();
          // Map API response to Anise type
          const mapped: Anise[] = await Promise.all((data.daos || []).map(async (dao: any) => {
            const memberCount = await fetchMemberCount(dao.daoAddress || dao.id, idToken);
            const createdAtVal = dao.createdAt || dao.created_at || dao.created || '';
            const formattedCreated = formatDate(createdAtVal);
            console.log('[MyAnisesScreen] dao.createdAt:', createdAtVal, 'formatted:', formattedCreated);
            return {
              id: dao.daoAddress || dao.id,
              name: dao.metadata?.name || 'Unnamed DAO',
              members: memberCount,
              role: dao.role || '',
              created: formattedCreated,
              description: dao.metadata?.description || '',
            };
          }));
          if (!cancelled) {
            setMyAnises(page === 1 ? mapped : prev => [...prev, ...mapped]);
            setHasMore(mapped.length === 10);
          }
        } catch (err: any) {
          if (!cancelled) setError(err.message || 'Failed to load your Nises');
        } finally {
          if (!cancelled) setLoading(false);
        }
      }
    }
    fetchAll();
    return () => { cancelled = true; };
  }, [walletAddress, page, uid]);

  // Handle search
  // Search bar is present but not functional (TODO: implement search functionality)
  // const handleSearch = (text: string) => {
  //   setSearch(text);
  //   setPage(1);
  //   setMyAnises([]);
  // };

  // Handle load more
  const handleLoadMore = () => {
    if (hasMore && !loading) setPage(p => p + 1);
  };

  // Handler for the View & Manage button
  const handleViewManage = (anise: Anise) => {
    Alert.alert('Manage', `Manage ${anise.name}`);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F5F7' }}>
      <View style={{ padding: 20, flex: 1 }}>
        <Text style={{ fontSize: 28, fontWeight: 'bold', marginBottom: 16, color: '#23202A' }}>
          My Anises
        </Text>
        {/* Search Bar (not functional yet) */}
        {walletAddress && (
          <View style={{ marginBottom: 16 }}>
            <TextInput
              value={search}
              onChangeText={() => {}} // No-op for now
              placeholder="Search for a Nise"
              style={{ backgroundColor: '#fff', borderRadius: 8, padding: 12, fontSize: 16, borderWidth: 1, borderColor: '#eee' }}
              placeholderTextColor="#888"
              editable={false} // Not functional yet
            />
            {/* TODO: Implement search functionality */}
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
        {walletAddress && loading && page === 1 && (
          <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 40 }} />
        )}
        {/* Error */}
        {walletAddress && error && (
          <Text style={{ color: 'red', marginTop: 24, textAlign: 'center' }}>{error}</Text>
        )}
        {/* No DAOs */}
        {walletAddress && !loading && !error && myAnises.length === 0 && (
          <Text style={{ color: '#888', fontSize: 18, textAlign: 'center', marginTop: 40 }}>
            You’re not a member of any Nises yet. Join or create one to get started!
          </Text>
        )}
        {/* List of Anises */}
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
          {myAnises.map(anise => (
            <AniseCard key={anise.id} anise={anise} onViewManage={() => handleViewManage(anise)} />
          ))}
          {/* Load More button */}
          {hasMore && !loading && myAnises.length > 0 && (
            <TouchableOpacity onPress={handleLoadMore} style={{ marginTop: 16, alignSelf: 'center', backgroundColor: '#2563eb', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 24 }}>
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Load More</Text>
            </TouchableOpacity>
          )}
          {loading && page > 1 && (
            <ActivityIndicator size="small" color="#2563eb" style={{ marginTop: 16 }} />
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}