import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Claim, listClaims } from '../../../services/claimApi';
import { ClaimCard } from '../components/ClaimCard';
import { VotingModal } from '../components/VotingModal';
import { walletConnectService } from '../../../../wallet/walletConnectInstance';
import { API_BASE_URL, getAuthHeaders } from '../../../utils/api';

type FilterType = 'pending' | 'approved' | 'rejected' | 'paid';

interface ClaimsListScreenProps {
  navigation: any;
  route: {
    params: {
      daoAddress: string;
      claimThreshold: number;
    };
  };
}

export const ClaimsListScreen: React.FC<ClaimsListScreenProps> = ({ navigation, route }) => {
  const [filter, setFilter] = useState<FilterType>('pending');
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creatorNames, setCreatorNames] = useState<Record<string, string>>({});
  const { daoAddress, claimThreshold } = route.params;

  // Fetch claims on mount and when filter changes
  useEffect(() => {
    const fetchClaims = async () => {
      try {
        setLoading(true);
        setError(null);
        const { claims: fetchedClaims } = await listClaims(daoAddress);
        setClaims(fetchedClaims);
      } catch (err: any) {
        console.error('Error fetching claims:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchClaims();
  }, [daoAddress]);

  // Fetch creator names when claims change
  useEffect(() => {
    const fetchCreatorNames = async () => {
      console.log('Fetching creator names for claims:', claims);
      const newCreatorNames: Record<string, string> = {};
      const uniqueCreators = new Set(claims.map(claim => claim.createdBy));
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

    if (claims.length > 0) {
      fetchCreatorNames();
    }
  }, [claims]);

  // Get current wallet address for checking if user has voted
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  useEffect(() => {
    if (walletConnectService.isConnected() && walletConnectService.session?.namespaces?.eip155?.accounts[0]) {
      const address = walletConnectService.session.namespaces.eip155.accounts[0].split(':').pop();
      if (address) setWalletAddress(address.toLowerCase());
    }
  }, []);

  const hasVoted = (claim: Claim): boolean => {
    if (!walletAddress) return false;
    return !!claim.voters[walletAddress];
  };

  const filteredClaims = claims.filter(claim => claim.status === filter);

  const renderFilterButton = (type: FilterType, label: string) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        filter === type && styles.activeFilter
      ]}
      onPress={() => setFilter(type)}
    >
      <Text style={[
        styles.filterText,
        filter === type && styles.activeFilterText
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-back" size={24} color="#2563eb" />
        </TouchableOpacity>
        <Text style={styles.title}>Claims</Text>
      </View>

      <View style={styles.filterContainer}>
        {renderFilterButton('pending', 'Pending')}
        {renderFilterButton('approved', 'Approved')}
        {renderFilterButton('rejected', 'Rejected')}
        {renderFilterButton('paid', 'Paid')}
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={filteredClaims}
          keyExtractor={item => item.claimId.toString()}
          renderItem={({ item }) => (
            <ClaimCard
              title={item.title}
              amount={item.amount}
              description={item.description}
              status={item.status}
              hasVoted={hasVoted(item)}
              isCreator={item.claimant?.toLowerCase() === walletAddress}
              creatorName={item.createdBy ? creatorNames[item.createdBy] : undefined}
              onPress={() => {
                if (item.status === 'pending' && !hasVoted(item) && item.claimant?.toLowerCase() !== walletAddress) {
                  setSelectedClaim(item);
                }
              }}
            />
          )}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.centerContainer}>
              <Text style={styles.emptyText}>No {filter} claims found</Text>
            </View>
          }
        />
      )}

      <VotingModal
        isVisible={!!selectedClaim}
        onClose={() => {
          setSelectedClaim(null);
          // Refresh claims after voting
          const fetchClaims = async () => {
            try {
              const { claims: fetchedClaims } = await listClaims(daoAddress);
              setClaims(fetchedClaims);
            } catch (err: any) {
              console.error('Error refreshing claims:', err);
            }
          };
          fetchClaims();
        }}
        daoAddress={daoAddress}
        type="claim"
        item={{
          id: selectedClaim?.claimId,
          title: selectedClaim?.title || '',
          description: selectedClaim?.description || '',
          amount: selectedClaim?.amount,
          approvals: selectedClaim?.approvals || 0,
          rejections: selectedClaim?.rejections || 0,
          claimant: selectedClaim?.claimant
        }}
        threshold={claimThreshold}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 12,
    color: '#111827',
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    flexWrap: 'wrap',  // Add this to allow wrapping of filters
    gap: 8,  // Add spacing between wrapped items
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
  },
  activeFilter: {
    backgroundColor: '#2563EB',
  },
  filterText: {
    fontSize: 14,
    color: '#6B7280',
  },
  activeFilterText: {
    color: '#FFFFFF',
  },
  listContent: {
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
}); 