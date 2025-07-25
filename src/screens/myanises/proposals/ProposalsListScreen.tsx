import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Proposal, listProposals } from '../../../services/proposalApi';
import { ProposalCard } from '../components/ProposalCard';
import { VotingModal } from '../components/VotingModal';
import { walletConnectService } from '../../../../wallet/walletConnectInstance';
import { API_BASE_URL, getAuthHeaders } from '../../../utils/api';

type FilterType = 'pending' | 'approved' | 'rejected';

interface ProposalsListScreenProps {
  navigation: any;
  route: {
    params: {
      daoAddress: string;
      proposalThreshold: number;
    };
  };
}

export const ProposalsListScreen: React.FC<ProposalsListScreenProps> = ({ navigation, route }) => {
  const [filter, setFilter] = useState<FilterType>('pending');
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creatorNames, setCreatorNames] = useState<Record<string, string>>({});
  const { daoAddress, proposalThreshold } = route.params;

  // Fetch proposals on mount
  useEffect(() => {
    const fetchProposals = async () => {
      try {
        setLoading(true);
        setError(null);
        const { proposals: fetchedProposals } = await listProposals(daoAddress);
        setProposals(fetchedProposals);
      } catch (err: any) {
        console.error('Error fetching proposals:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProposals();
  }, [daoAddress]);

  // Fetch creator names when proposals change
  useEffect(() => {
    const fetchCreatorNames = async () => {
      console.log('Fetching creator names for proposals:', proposals);
      const newCreatorNames: Record<string, string> = {};
      const uniqueCreators = new Set(proposals.map(proposal => proposal.createdBy));
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

    if (proposals.length > 0) {
      fetchCreatorNames();
    }
  }, [proposals]);

  // Get current wallet address for checking if user has voted
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  useEffect(() => {
    if (walletConnectService.isConnected() && walletConnectService.session?.namespaces?.eip155?.accounts[0]) {
      const address = walletConnectService.session.namespaces.eip155.accounts[0].split(':').pop();
      if (address) setWalletAddress(address.toLowerCase());
    }
  }, []);

  const hasVoted = (proposal: Proposal): boolean => {
    if (!walletAddress) return false;
    return !!proposal.voters[walletAddress];
  };

  const filteredProposals = proposals.filter(proposal => proposal.status === filter);

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
        <Text style={styles.title}>Proposals</Text>
      </View>

      <View style={styles.filterContainer}>
        {renderFilterButton('pending', 'Pending')}
        {renderFilterButton('approved', 'Approved')}
        {renderFilterButton('rejected', 'Rejected')}
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
          data={filteredProposals}
          keyExtractor={item => item.proposalId.toString()}
          renderItem={({ item }) => (
            <ProposalCard
              title={item.title}
              description={item.description}
              status={item.status}
              hasVoted={hasVoted(item)}
              isCreator={item.proposer?.toLowerCase() === walletAddress}
              creatorName={item.createdBy ? creatorNames[item.createdBy] : undefined}
              onPress={() => {
                if (item.status === 'pending' && !hasVoted(item) && item.proposer?.toLowerCase() !== walletAddress) {
                  setSelectedProposal(item);
                }
              }}
            />
          )}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.centerContainer}>
              <Text style={styles.emptyText}>No {filter} proposals found</Text>
            </View>
          }
        />
      )}

      <VotingModal
        isVisible={!!selectedProposal}
        onClose={() => {
          setSelectedProposal(null);
          // Refresh proposals after voting
          const fetchProposals = async () => {
            try {
              const { proposals: fetchedProposals } = await listProposals(daoAddress);
              setProposals(fetchedProposals);
            } catch (err: any) {
              console.error('Error refreshing proposals:', err);
            }
          };
          fetchProposals();
        }}
        daoAddress={daoAddress}
        type="proposal"
        item={{
          id: selectedProposal?.proposalId,
          title: selectedProposal?.title || '',
          description: selectedProposal?.description || '',
          approvals: selectedProposal?.approvals || 0,
          rejections: selectedProposal?.rejections || 0,
          proposer: selectedProposal?.proposer
        }}
        threshold={proposalThreshold}
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
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginRight: 8,
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