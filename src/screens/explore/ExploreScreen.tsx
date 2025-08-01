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
  Modal,
  Alert,
  Linking,
} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../../utils/api';
import { Interface } from 'ethers';
import { walletConnectService } from '../../../wallet/walletConnectInstance';
import MemberModuleAbiJson from '../../services/abis/MemberModule.json';
import AdvancedSearch, { SearchFilters } from '../../components/AdvancedSearch';
const MemberModuleAbi = MemberModuleAbiJson.abi || MemberModuleAbiJson;

// Add navigation type
type RootStackParamList = {
  AniseDetails: {
    anise: {
      id: string;
      name: string;
      description: string;
      members: number;
      role: string;
      created: string;
      metadata: {
        name: string;
        description: string;
        intendedAudience: string;
        mandate: string;
        isPublic: boolean;
        templateId: string;
      };
    };
  };
};

// Update the PublicDAO interface
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
  creatorUid?: string;
  createdAt: any;
  creatorDetails?: {
    firstName: string;
    lastName: string;
  };
  membershipStatus?: 'none' | 'member' | 'pending';
  modules?: {
    MemberModule?: {
      address: string;
    };
    ProposalVotingModule?: {
      address: string;
    };
    ClaimVotingModule?: {
      address: string;
    };
    TreasuryModule?: {
      address: string;
    };
  };
}

const FILTERS = ['All', 'Recent', 'Popular'];

// Add DAO Details Modal Component
const DaoDetailsModal = ({ visible, dao, onClose, onJoinRequest }: {
  visible: boolean;
  dao: PublicDAO | null;
  onClose: () => void;
  onJoinRequest: (dao: PublicDAO) => void;
}) => {
  if (!dao) return null;

  const renderModalJoinButton = () => {
    console.log('Rendering modal button for DAO:', dao.daoAddress, 'Status:', dao.membershipStatus);
    
    switch (dao.membershipStatus) {
      case 'member':
        return (
          <TouchableOpacity
            style={[styles.modalJoinButton, { opacity: 0.8 }]}
            disabled={true}
          >
            <Text style={styles.modalJoinButtonText}>Already a Member</Text>
          </TouchableOpacity>
        );
      case 'pending':
        return (
          <TouchableOpacity
            style={[styles.modalJoinButton, { opacity: 0.6 }]}
            disabled={true}
          >
            <Text style={styles.modalJoinButtonText}>Request Pending</Text>
          </TouchableOpacity>
        );
      default:
        return (
          <TouchableOpacity
            style={styles.modalJoinButton}
            onPress={() => {
              onJoinRequest(dao);
              onClose();
            }}
          >
            <Text style={styles.modalJoinButtonText}>Request to Join</Text>
          </TouchableOpacity>
        );
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{dao.metadata.name}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            {/* Description */}
            <View style={styles.modalSection}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.sectionText}>{dao.metadata.description}</Text>
            </View>

            {/* Details */}
            <View style={styles.modalSection}>
              <Text style={styles.sectionTitle}>Details</Text>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Members</Text>
                <Text style={styles.detailValue}>{dao.memberCount}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Template</Text>
                <Text style={styles.detailValue}>{dao.metadata.templateId}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Created By</Text>
                <Text style={styles.detailValue}>
                  {dao.creatorDetails?.firstName 
                    ? `${dao.creatorDetails.firstName} ${dao.creatorDetails.lastName}`
                    : dao.creator.slice(0, 6) + '...' + dao.creator.slice(-4)}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Created On</Text>
                <Text style={styles.detailValue}>
                  {dao.createdAt?._seconds 
                    ? new Date(dao.createdAt._seconds * 1000).toLocaleDateString()
                    : 'N/A'}
                </Text>
              </View>
            </View>

            {/* Purpose */}
            <View style={styles.modalSection}>
              <Text style={styles.sectionTitle}>Purpose</Text>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Intended Audience</Text>
                <Text style={styles.detailValue}>{dao.metadata.intendedAudience}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Mandate</Text>
                <Text style={styles.detailValue}>{dao.metadata.mandate}</Text>
              </View>
            </View>

            {/* Join Button */}
            {renderModalJoinButton()}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default function ExploreScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [search, setSearch] = useState('');
  const [privateAddress, setPrivateAddress] = useState('');
  const [filter, setFilter] = useState('All');
  const [daos, setDaos] = useState<PublicDAO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDao, setSelectedDao] = useState<PublicDAO | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [userWalletAddress, setUserWalletAddress] = useState<string | null>(null);
  
  // New search filters state
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    query: '',
    sortBy: 'all',
    memberCount: 'any',
    privateKey: undefined,
  });

  // Add effect to get user data including wallet address
  useEffect(() => {
    const getUserData = async () => {
      try {
        const idToken = await AsyncStorage.getItem('idToken');
        if (!idToken) return;

        const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
          headers: { 'Authorization': `Bearer ${idToken}` }
        });

        if (response.ok) {
          const userData = await response.json();
          console.log('User data:', userData);
          if (userData.wallet?.address) {
            // Use original case wallet address, don't convert to lowercase
            setUserWalletAddress(userData.wallet.address);
          }
        }
      } catch (err) {
        console.error('Failed to get user data:', err);
      }
    };
    getUserData();
  }, []);

  // Add effect to reset and fetch when searchFilters change
  useEffect(() => {
    setPage(1); // Reset page when filters change
    fetchPublicDaos(true); // true means reset
  }, [searchFilters]);

  // Update membership status check to use the correct wallet address
  const checkMembershipStatus = async (daoAddress: string, idToken: string) => {
    try {
      if (!userWalletAddress) {
        console.log('No wallet address available');
        return 'none';
      }

      console.log(`Checking membership status for DAO: ${daoAddress} and wallet: ${userWalletAddress}`);
      
      // First check if user is already a member by checking their role
      // Use original case wallet address, don't convert to lowercase
      const memberResponse = await fetch(`${API_BASE_URL}/api/daos/${daoAddress}/members/${userWalletAddress}`, {
        headers: { 'Authorization': `Bearer ${idToken}` }
      });
      
      console.log('Member check response:', memberResponse.status);
      if (memberResponse.ok) {
        const memberData = await memberResponse.json();
        console.log('Member data:', memberData);
        // Fix: Check for status 'member' instead of role comparison
        if (memberData.status === 'member') {
          return 'member';
        }
      }

      // If not a member, check for pending requests
      const requestsResponse = await fetch(`${API_BASE_URL}/api/daos/${daoAddress}/join-requests`, {
        headers: { 'Authorization': `Bearer ${idToken}` }
      });

      console.log('Join requests response:', requestsResponse.status);
      if (requestsResponse.ok) {
        const requestsData = await requestsResponse.json();
        console.log('Join requests data:', requestsData);
        
        // Check if user has a pending request
        const hasPendingRequest = requestsData.joinRequests?.some(
          (request: any) => request.memberAddress?.toLowerCase() === userWalletAddress?.toLowerCase()
        );
        
        if (hasPendingRequest) {
          return 'pending';
        }
      }

      return 'none';
    } catch (err) {
      console.warn('Failed to check membership status:', err);
      return 'none';
    }
  };

  const fetchUserDetails = async (memberAddress: string, daoAddress: string, idToken: string): Promise<{ firstName: string; lastName: string } | null> => {
    try {
      console.log(`Fetching user details for member ${memberAddress} in DAO ${daoAddress}`);
      
      // First get the member document to get the uid
      const memberUrl = `${API_BASE_URL}/api/daos/${daoAddress}/members/${memberAddress}`;
      console.log('Fetching member data from:', memberUrl);
      
      const memberResponse = await fetch(memberUrl, {
        headers: { 'Authorization': `Bearer ${idToken}` }
      });
      
      console.log('Member response status:', memberResponse.status);
      if (memberResponse.ok) {
        const memberData = await memberResponse.json();
        console.log('Member data:', memberData);
        
        if (memberData.uid) {
          // Then get user details using the uid
          const userUrl = `${API_BASE_URL}/api/auth/users/${memberData.uid}`;
          console.log('Fetching user data from:', userUrl);
          
          const userResponse = await fetch(userUrl, {
            headers: { 'Authorization': `Bearer ${idToken}` }
          });
          
          console.log('User response status:', userResponse.status);
          if (userResponse.ok) {
            const userData = await userResponse.json();
            console.log('User data:', userData);
            return {
              firstName: userData.firstName,
              lastName: userData.lastName
            };
          } else {
            console.log('Failed to fetch user data:', await userResponse.text());
          }
        } else {
          console.log('No uid found in member data');
        }
      } else {
        console.log('Failed to fetch member data:', await memberResponse.text());
      }
      return null;
    } catch (err) {
      console.error('Failed to fetch user details:', err);
      return null;
    }
  };

  // Update fetchPublicDaos to include membership status
  const fetchPublicDaos = async (reset: boolean = false) => {
    try {
      console.log('Fetching public DAOs...', { searchFilters, reset });
      const idToken = await AsyncStorage.getItem('idToken');
      if (!idToken) throw new Error('Not authenticated');

      // Get user's wallet address if we don't have it
      if (!userWalletAddress) {
        const userResponse = await fetch(`${API_BASE_URL}/api/auth/me`, {
          headers: { 'Authorization': `Bearer ${idToken}` }
        });
        if (userResponse.ok) {
          const userData = await userResponse.json();
          if (userData.wallet?.address) {
            setUserWalletAddress(userData.wallet.address);
          }
        }
      }

      const params = new URLSearchParams({
        page: String(reset ? 1 : page),
        limit: '10',
        ...(searchFilters.query && { search: searchFilters.query }),
        ...(searchFilters.sortBy !== 'all' && { sortBy: searchFilters.sortBy }),
        ...(searchFilters.memberCount !== 'any' && { memberCount: searchFilters.memberCount })
      });

      const url = `${API_BASE_URL}/api/daos?${params}`;
      console.log('Fetching from URL:', url);
      console.log('Search filters being sent:', searchFilters);

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

          // Get creator details
          const creatorDetails = await fetchUserDetails(dao.creator, dao.daoAddress, idToken);

          // Check membership status
          const membershipStatus = await checkMembershipStatus(dao.daoAddress, idToken);

          return {
            ...dao,
            memberCount,
            creatorDetails: creatorDetails || undefined,
            membershipStatus
          };
        } catch (err) {
          console.warn('Failed to fetch details for DAO:', dao.daoAddress, err);
          return {
            ...dao,
            memberCount: 1,
            membershipStatus: 'none' as const
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

  const handleFiltersChange = (newFilters: SearchFilters) => {
    console.log('Filters changed:', newFilters);
    setSearchFilters(newFilters);
    // Trigger search immediately when filters change
    setTimeout(() => {
      fetchPublicDaos(true);
    }, 100);
  };

  const handlePrivateKeySubmit = (privateKey: string) => {
    console.log('Private key submitted:', privateKey);
    // Handle private key submission - you can implement this later
    Alert.alert('Private Key', `Private key submitted: ${privateKey}`);
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

  // Update the handleJoinRequest function
  const handleJoinRequest = async (dao: PublicDAO) => {
    try {
      if (!userWalletAddress) {
        Alert.alert('Error', 'Please connect your wallet first');
        return;
      }

      // Create contract interface for MemberModule
      const iface = new Interface(MemberModuleAbi);
      const data = iface.encodeFunctionData('requestToJoin', []);
      console.log('Encoded function data:', data);

      // Prepare transaction
      const tx = {
        from: userWalletAddress,
        to: dao.daoAddress,
        data,
        chainId: 80002, // Polygon Amoy
      };

      console.log('Preparing transaction:', tx);

      // Open MetaMask
      try {
        await Linking.openURL('metamask://');
      } catch (e) {
        console.log('Could not open MetaMask:', e);
      }

      // Send transaction
      console.log('Sending transaction...');
      const txHash = await walletConnectService.sendTransaction(tx);
      console.log('Transaction sent! Hash:', txHash);

      // Show Polyscan link
      Alert.alert(
        'Transaction Sent',
        'Your join request has been submitted.',
        [
          {
            text: 'View on Polyscan',
            onPress: () => {
              Linking.openURL(`https://mumbai.polygonscan.com/tx/${txHash}`);
            },
          },
          { text: 'OK', style: 'default' },
        ]
      );

      // Update backend
      try {
        const idToken = await AsyncStorage.getItem('idToken');
        if (!idToken) throw new Error('Not authenticated');

        console.log('Updating backend with join request...');
        const response = await fetch(`${API_BASE_URL}/api/daos/${dao.daoAddress}/join-requests`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${idToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            txHash,
            memberAddress: userWalletAddress
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Backend update failed:', {
            status: response.status,
            statusText: response.statusText,
            body: errorText
          });
          throw new Error('Failed to update backend');
        }

        console.log('Backend updated successfully');

        // Update the DAO's membership status to pending
        const updatedDaos = daos.map(d => {
          if (d.daoAddress === dao.daoAddress) {
            return { ...d, membershipStatus: 'pending' as const };
          }
          return d;
        });
        setDaos(updatedDaos);

        // Refresh the DAO list to get updated status
        setTimeout(() => {
          fetchPublicDaos(true);
        }, 2000); // Wait 2 seconds then refresh

      } catch (err) {
        console.error('Failed to update backend:', err);
        Alert.alert(
          'Warning',
          'Transaction sent but failed to update backend. Status may not reflect correctly until refresh.',
          [{ text: 'OK' }]
        );
      }

    } catch (err: any) {
      console.error('Join request error:', err);
      if (err?.message?.includes('Internal JSON-RPC error') || err?.code === 5000) {
        Alert.alert('Transaction Error', 'An error occurred while sending the transaction. Please try again.');
      } else {
        Alert.alert('Error', 'Failed to submit join request. Please try again.');
      }
    }
  };

  const handleViewDao = (dao: PublicDAO) => {
    navigation.navigate('AniseDetails', {
      anise: {
        id: dao.daoAddress,
        name: dao.metadata.name,
        description: dao.metadata.description,
        members: dao.memberCount,
        role: 'None', // Since we're viewing from Explore, user isn't a member yet
        created: new Date(dao.createdAt).toLocaleDateString(),
        metadata: {
          name: dao.metadata.name,
          description: dao.metadata.description,
          intendedAudience: dao.metadata.intendedAudience,
          mandate: dao.metadata.mandate,
          isPublic: dao.metadata.isPublic,
          templateId: dao.metadata.templateId
        }
      }
    });
  };

  // Update the filter handler to reset the page
  const handleFilterChange = (newFilter: string) => {
    if (newFilter === filter) return; // Don't do anything if filter hasn't changed
    setFilter(newFilter);
    // Page reset and fetch will happen in the useEffect
  };

  // Update the button rendering in the card
  const renderJoinButton = (dao: PublicDAO) => {
    console.log('Rendering button for DAO:', dao.daoAddress, 'Status:', dao.membershipStatus);
    
    switch (dao.membershipStatus) {
      case 'member':
        return (
          <TouchableOpacity
            style={[styles.requestButton, { opacity: 0.8 }]}
            disabled={true}
          >
            <Text style={styles.requestButtonText}>Already a Member</Text>
          </TouchableOpacity>
        );
      case 'pending':
        return (
          <TouchableOpacity
            style={[styles.requestButton, { opacity: 0.6 }]}
            disabled={true}
          >
            <Text style={styles.requestButtonText}>Request Pending</Text>
          </TouchableOpacity>
        );
      default:
        return (
          <TouchableOpacity
            style={styles.requestButton}
            onPress={() => handleJoinRequest(dao)}
          >
            <Text style={styles.requestButtonText}>Request to Join</Text>
          </TouchableOpacity>
        );
    }
  };

  // Remove auto-refresh on focus to prevent multiple API calls
  // useEffect(() => {
  //   const unsubscribe = navigation.addListener('focus', () => {
  //     console.log('Screen focused, refreshing DAOs...');
  //     fetchPublicDaos(true);
  //   });

  //   return unsubscribe;
  // }, [navigation]);

  // Update the fetchPublicDaos function to check membership status on initial load
  useEffect(() => {
    if (userWalletAddress) {
      console.log('User wallet address available, fetching DAOs...');
      fetchPublicDaos(true);
    }
  }, [userWalletAddress]);

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

        {/* Advanced Search Component */}
        <AdvancedSearch
          filters={searchFilters}
          onFiltersChange={handleFiltersChange}
          onSearch={handleSearch}
          onPrivateKeySubmit={handlePrivateKeySubmit}
          placeholder="Search Anises..."
        />

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
                <View style={styles.creatorSection}>
                  <View style={styles.metadataRow}>
                    <View style={styles.creatorInfo}>
                      <Icon name="person" size={16} color="#6B7280" />
                      <Text style={styles.creatorText}>
                        Created by{' '}
                        {dao.creator ? (
                          dao.creatorDetails?.firstName ? (
                            <Text style={styles.creatorName}>
                              {dao.creatorDetails.firstName} {dao.creatorDetails.lastName}
                            </Text>
                          ) : (
                            <Text style={styles.creatorAddress}>
                              {dao.creator.slice(0, 6)}...{dao.creator.slice(-4)}
                            </Text>
                          )
                        ) : (
                          <ActivityIndicator size="small" color="#6B7280" />
                        )}
                      </Text>
                    </View>
                    <View style={styles.separator} />
                    <View style={styles.dateInfo}>
                      <Icon name="calendar" size={16} color="#6B7280" />
                      <Text style={styles.dateText}>
                        {dao.createdAt?._seconds 
                          ? new Date(dao.createdAt._seconds * 1000).toLocaleDateString()
                          : 'N/A'}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={styles.infoButton}
                    onPress={() => {
                      setSelectedDao(dao);
                      setModalVisible(true);
                    }}
                  >
                    <Icon name="information-circle-outline" size={18} color="#2563eb" />
                    <Text style={styles.infoButtonText}>More Info</Text>
                  </TouchableOpacity>

                  {renderJoinButton(dao)}
                </View>
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

        {/* DAO Details Modal */}
        <DaoDetailsModal
          visible={modalVisible}
          dao={selectedDao}
          onClose={() => {
            setModalVisible(false);
            setSelectedDao(null);
          }}
          onJoinRequest={handleJoinRequest}
        />
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
    flex: 1,
    marginRight: 12,
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
    marginBottom: 16,
  },
  daoFooter: {
    gap: 12,
  },
  creatorSection: {
    gap: 4,
  },
  metadataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  creatorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  separator: {
    width: 1,
    height: '80%',
    backgroundColor: '#E5E7EB',
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
    fontSize: 14,
  },
  dateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    fontSize: 14,
    color: '#6B7280',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    gap: 12,
  },
  infoButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  infoButtonText: {
    color: '#2563eb',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  requestButton: {
    flex: 1,
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
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
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end', // Makes modal slide up from bottom
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    maxHeight: '80%', // Takes up to 80% of screen height
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    paddingHorizontal: 20,
  },
  modalSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  sectionText: {
    fontSize: 16,
    color: '#4B5563',
    lineHeight: 24,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  detailLabel: {
    fontSize: 16,
    color: '#6B7280',
  },
  detailValue: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  modalJoinButton: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginVertical: 24,
  },
  modalJoinButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  memberButton: {
    backgroundColor: '#2563eb',
    opacity: 0.8,
  },
  memberButtonText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 14,
  },
  pendingButton: {
    backgroundColor: '#2563eb',
    opacity: 0.6,
  },
  pendingButtonText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 14,
  },
  modalMemberButton: {
    backgroundColor: '#2563eb',
    opacity: 0.8,
  },
  modalMemberButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  modalPendingButton: {
    backgroundColor: '#2563eb',
    opacity: 0.6,
  },
  modalPendingButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
}); 