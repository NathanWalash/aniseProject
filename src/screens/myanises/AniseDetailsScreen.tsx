import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, StyleSheet, Modal, ActivityIndicator, Pressable } from 'react-native';
import { Anise } from './types/myAnise';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../../utils/api';
import { JoinRequestsModal } from './JoinRequestsModal';
import { CreateClaimModal } from './claims/CreateClaimModal';
import { CreateProposalModal } from './proposals/CreateProposalModal';
import { CreateAnnouncementModal } from './announcements/CreateAnnouncementModal';
import { getTreasuryBalance } from '../../services/blockchainService';
import { getJoinRequests } from '../../services/memberApi';
import { listClaims } from '../../services/claimApi';
import { listProposals } from '../../services/proposalApi';
import { walletConnectService } from '../../../wallet/walletConnectInstance';

interface AniseDetailsProps {
  route: { params: { anise: Anise } };
  navigation: any;
}

interface ActionButtonProps {
  icon: string;
  label: string;
  onPress: () => void;
  badge?: string | number;
  isAdmin?: boolean;
}

const ActionButton: React.FC<ActionButtonProps> = ({ icon, label, onPress, badge, isAdmin = false }) => (
  <TouchableOpacity 
    style={[styles.actionButton, isAdmin && styles.adminActionButton]} 
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={styles.iconContainer}>
      <Icon name={icon} size={24} color="#2563eb" />
      {badge && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      )}
    </View>
    <Text style={styles.actionLabel}>{label}</Text>
  </TouchableOpacity>
);

// Dynamic toolbar generation based on available modules
const generateToolbarButtons = (
  modules: any, 
  isAdmin: boolean, 
  context: {
    pendingProposals: number;
    pendingClaims: number;
    navigation: any;
    anise: Anise;
    setShowCreateProposal: (show: boolean) => void;
    setShowCreateClaim: (show: boolean) => void;
    setShowCreateAnnouncement: (show: boolean) => void;
  }
) => {
  const sections: React.ReactElement[] = [];
  
  // 1. Announcements Section (First)
  if (modules.AnnouncementModule) {
    sections.push(
      <View key="announcements-section" style={styles.moduleSection}>
        <Text style={styles.moduleTitle}>Announcements</Text>
        <View style={styles.moduleButtonGrid}>
          <ActionButton 
            key="announcements"
            icon="megaphone" 
            label="View Announcements" 
            onPress={() => context.navigation.navigate('AnnouncementsList', { 
              daoAddress: context.anise.id
            })}
          />
          <ActionButton 
            key="new-announcement"
            icon="add" 
            label="New Announcement" 
            onPress={() => context.setShowCreateAnnouncement(true)}
          />
        </View>
      </View>
    );
  }
  
  // 2. Proposals Section
  if (modules.ProposalVotingModule) {
    sections.push(
      <View key="proposals-section" style={styles.moduleSection}>
        <Text style={styles.moduleTitle}>Proposals</Text>
        <View style={styles.moduleButtonGrid}>
          <ActionButton 
            key="proposals"
            icon="document-text" 
            label="View Proposals" 
            onPress={() => context.navigation.navigate('ProposalsList', { 
              daoAddress: context.anise.id,
              proposalThreshold: modules.ProposalVotingModule?.config?.approvalThreshold || 51
            })}
            badge={context.pendingProposals > 0 ? context.pendingProposals : undefined}
          />
          <ActionButton 
            key="new-proposal"
            icon="create" 
            label="New Proposal" 
            onPress={() => context.setShowCreateProposal(true)}
          />
        </View>
      </View>
    );
  }
  
  // 3. Claims Section
  if (modules.ClaimVotingModule) {
    sections.push(
      <View key="claims-section" style={styles.moduleSection}>
        <Text style={styles.moduleTitle}>Claims</Text>
        <View style={styles.moduleButtonGrid}>
          <ActionButton 
            key="claims"
            icon="cash" 
            label="View Claims" 
            onPress={() => context.navigation.navigate('ClaimsList', { 
              daoAddress: context.anise.id,
              claimThreshold: modules.ClaimVotingModule?.config?.approvalThreshold || 51
            })}
            badge={context.pendingClaims > 0 ? context.pendingClaims : undefined}
          />
          <ActionButton 
            key="new-claim"
            icon="add-circle" 
            label="Submit Claim" 
            onPress={() => context.setShowCreateClaim(true)}
          />
        </View>
      </View>
    );
  }
  
  // 4. Tasks Section
  if (modules.TaskManagementModule) {
    sections.push(
      <View key="tasks-section" style={styles.moduleSection}>
        <Text style={styles.moduleTitle}>Tasks</Text>
        <View style={styles.moduleButtonGrid}>
          <ActionButton 
            key="tasks"
            icon="list" 
            label="View Tasks" 
            onPress={() => console.log('Tasks - Coming Soon')}
          />
          <ActionButton 
            key="new-task"
            icon="add" 
            label="New Task" 
            onPress={() => console.log('New Task - Coming Soon')}
          />
        </View>
      </View>
    );
  }
  
  // 5. Calendar Section
  if (modules.CalendarModule) {
    sections.push(
      <View key="calendar-section" style={styles.moduleSection}>
        <Text style={styles.moduleTitle}>Calendar</Text>
        <View style={styles.moduleButtonGrid}>
          <ActionButton 
            key="calendar"
            icon="calendar" 
            label="View Events" 
            onPress={() => console.log('Calendar - Coming Soon')}
          />
          <ActionButton 
            key="new-event"
            icon="add" 
            label="New Event" 
            onPress={() => console.log('New Event - Coming Soon')}
          />
        </View>
      </View>
    );
  }
  
  // 6. Documents Section
  if (modules.DocumentSigningModule) {
    sections.push(
      <View key="documents-section" style={styles.moduleSection}>
        <Text style={styles.moduleTitle}>Documents</Text>
        <View style={styles.moduleButtonGrid}>
          <ActionButton 
            key="documents"
            icon="document" 
            label="View Documents" 
            onPress={() => console.log('Documents - Coming Soon')}
          />
          <ActionButton 
            key="new-document"
            icon="add" 
            label="New Document" 
            onPress={() => console.log('New Document - Coming Soon')}
          />
        </View>
      </View>
    );
  }
  
  // No general section - members will be handled differently
  return sections;
  
  return sections;
};

const InfoModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  anise: Anise;
}> = ({ visible, onClose, anise }) => (
  <Modal
    visible={visible}
    transparent
    animationType="slide"
    onRequestClose={onClose}
  >
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>DAO Information</Text>
          <TouchableOpacity onPress={onClose}>
            <Icon name="close" size={24} color="#64748b" />
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.modalBody}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Template</Text>
            <Text style={styles.infoValue}>{anise.metadata?.templateId || 'N/A'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Intended Audience</Text>
            <Text style={styles.infoValue}>{anise.metadata?.intendedAudience || 'N/A'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Mandate</Text>
            <Text style={styles.infoValue}>{anise.metadata?.mandate || 'N/A'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Public</Text>
            <Text style={styles.infoValue}>{anise.metadata?.isPublic ? 'Yes' : 'No'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Created</Text>
            <Text style={styles.infoValue}>{anise.created}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Contract Address</Text>
            <Text style={styles.infoValue}>{anise.id}</Text>
          </View>
        </ScrollView>
      </View>
    </View>
  </Modal>
);

const TreasuryInfoModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  treasuryAddress: string;
}> = ({ visible, onClose, treasuryAddress }) => (
  <Modal
    visible={visible}
    transparent
    animationType="slide"
    onRequestClose={onClose}
  >
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Treasury Information</Text>
          <TouchableOpacity onPress={onClose}>
            <Icon name="close" size={24} color="#64748b" />
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.modalBody}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Token Type</Text>
            <Text style={styles.infoValue}>ERC20 (aniseGBP)</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Treasury Module</Text>
            <Text style={[styles.infoValue, styles.addressText]}>{treasuryAddress}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>About</Text>
            <Text style={styles.infoValue}>
              The treasury holds the DAO's tokens which can be used for paying out approved claims. The balance shown is in British Pounds (GBP).
            </Text>
          </View>
        </ScrollView>
      </View>
    </View>
  </Modal>
);

const TreasuryCard: React.FC<{ anise: Anise }> = ({ anise }) => {
  const [balance, setBalance] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState(false);

  // Debug log to see the structure
  console.log('Anise object:', JSON.stringify(anise, null, 2));
  console.log('Modules:', JSON.stringify(anise.modules, null, 2));
  
  // Get treasury address - try both possible paths
  const treasuryAddress = anise.modules?.TreasuryModule?.address || 
                         (anise as any).modules?.treasury?.address ||
                         (anise as any).modules?.treasuryModule?.address;
  
  console.log('Found treasury address:', treasuryAddress);

  const fetchBalance = async () => {
    try {
      setLoading(true);
      console.log('Fetching balance for DAO:', anise.id);
      const balanceWei = await getTreasuryBalance(anise.id);
      console.log('Received balance:', balanceWei.toString());
      // Convert from wei to pounds (18 decimals)
      const balancePounds = Number(balanceWei) / 1e18;
      setBalance(balancePounds.toLocaleString('en-GB', {
        style: 'currency',
        currency: 'GBP',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }));
      setError(null);
    } catch (err) {
      console.error('Error fetching treasury balance:', err);
      setError('Failed to load balance');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, [anise.id]);

  if (!treasuryAddress) {
    console.error('Treasury module not found in:', anise);
    return (
      <View style={styles.treasuryCard}>
        <View style={styles.treasuryHeader}>
          <Icon name="wallet" size={24} color="#2563eb" />
          <Text style={styles.treasuryTitle}>Treasury Balance</Text>
        </View>
        <Text style={styles.errorText}>Treasury module configuration not found</Text>
      </View>
    );
  }

  return (
    <>
      <View style={styles.treasuryCard}>
        <View style={styles.treasuryHeader}>
          <Icon name="wallet" size={24} color="#2563eb" />
          <Text style={styles.treasuryTitle}>Treasury Balance</Text>
          <TouchableOpacity onPress={() => setShowInfo(true)} style={styles.infoButton}>
            <Icon name="information-circle" size={20} color="#2563eb" />
          </TouchableOpacity>
          <TouchableOpacity onPress={fetchBalance} style={styles.refreshButton}>
            <Icon name="refresh" size={20} color="#2563eb" />
          </TouchableOpacity>
        </View>
        
        {loading ? (
          <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 12 }} />
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : (
          <View style={styles.balanceContainer}>
            <Text style={styles.treasuryBalance}>{balance || '£0.00'}</Text>
            <Text style={styles.balanceLabel}>Available Balance</Text>
          </View>
        )}
      </View>

      <TreasuryInfoModal 
        visible={showInfo}
        onClose={() => setShowInfo(false)}
        treasuryAddress={treasuryAddress}
      />
    </>
  );
};

const AniseDetailsScreen: React.FC<AniseDetailsProps> = ({ route, navigation }) => {
  const { anise } = route.params;
  const [showInfo, setShowInfo] = useState(false);
  const [showJoinRequests, setShowJoinRequests] = useState(false);
  const [showCreateClaim, setShowCreateClaim] = useState(false);
  const [showCreateProposal, setShowCreateProposal] = useState(false);
  const [showCreateAnnouncement, setShowCreateAnnouncement] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingJoinRequests, setPendingJoinRequests] = useState<number>(0);
  const [pendingProposals, setPendingProposals] = useState<number>(0);
  const [pendingClaims, setPendingClaims] = useState<number>(0);
  
  // Use the values we already have from the MyAnises page
  const memberCount = anise.members;
  const userRole = anise.role;
  const isAdmin = userRole === 'Admin';

  // Fetch actual counts for join requests, claims, and proposals
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        // Get user's wallet address
        const userAddress = walletConnectService.session?.namespaces?.eip155?.accounts[0].split(':').pop();
        console.log('User address:', userAddress);
        
        // Fetch join request count (admin only)
        if (isAdmin) {
          try {
            const joinRequests = await getJoinRequests(anise.id);
            setPendingJoinRequests(joinRequests.length);
          } catch (err) {
            console.error('Failed to fetch join request count:', err);
            setPendingJoinRequests(0);
          }
        }
        
        // Fetch claims and filter for ones needing user's vote (exclude user's own claims)
        try {
          const claims = await listClaims(anise.id);
          console.log('All claims:', claims.claims);
          console.log('Claims with claimant addresses:', claims.claims.map(c => ({ 
            claimId: c.claimId, 
            claimant: c.claimant, 
            status: c.status,
            votes: c.votes 
          })));
          
          const pendingClaimsNeedingVote = claims.claims.filter(c => {
            const isPending = c.status === 'pending';
            const userHasntVoted = !c.votes[userAddress];
            const isNotUserClaim = c.claimant.toLowerCase() !== userAddress.toLowerCase();
            
            console.log(`Claim ${c.claimId}:`, {
              isPending,
              userHasntVoted,
              isNotUserClaim,
              claimant: c.claimant,
              userAddress: userAddress
            });
            
            return isPending && userHasntVoted && isNotUserClaim;
          });
          
          console.log('Pending claims needing vote:', pendingClaimsNeedingVote);
          setPendingClaims(pendingClaimsNeedingVote.length);
        } catch (err) {
          console.error('Failed to fetch claims count:', err);
          setPendingClaims(0);
        }
        
        // Fetch proposals and filter for ones needing user's vote (exclude user's own proposals)
        try {
          const proposals = await listProposals(anise.id);
          console.log('All proposals:', proposals.proposals);
          
          const pendingProposalsNeedingVote = proposals.proposals.filter(p => 
            p.status === 'pending' && 
            !p.votes[userAddress] && 
            p.proposer.toLowerCase() !== userAddress.toLowerCase()
          );
          setPendingProposals(pendingProposalsNeedingVote.length);
        } catch (err) {
          console.error('Failed to fetch proposals count:', err);
          setPendingProposals(0);
        }
      } catch (err) {
        console.error('Failed to fetch counts:', err);
      }
    };

    fetchCounts();
  }, [anise.id, isAdmin]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Icon name="arrow-back" size={24} color="#2563eb" />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setShowInfo(true)}
            style={styles.infoButton}
          >
            <Icon name="information-circle" size={24} color="#2563eb" />
          </TouchableOpacity>
        </View>
        
        <Text style={styles.title}>{anise.name}</Text>
        <Text style={styles.subtitle}>{anise.description}</Text>
        
        <View style={styles.statsRow}>
          <TouchableOpacity 
            style={styles.memberButton}
            onPress={() => console.log('View Members - Coming Soon')}
            activeOpacity={0.7}
          >
            <Icon name="people" size={20} color="#2563eb" />
            <Text style={styles.statText}>{memberCount} Members</Text>
          </TouchableOpacity>
          <View style={styles.statItem}>
            <Icon name="shield" size={20} color="#2563eb" />
            <Text style={styles.statText}>{userRole}</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {/* Treasury Card */}
        <TreasuryCard anise={anise} />

        {/* Admin Controls - Only visible to admins */}
        {isAdmin && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Admin Controls</Text>
            <View style={styles.adminButtonGrid}>
              <ActionButton 
                icon="people" 
                label="Join Requests" 
                onPress={() => setShowJoinRequests(true)}
                badge={pendingJoinRequests > 0 ? pendingJoinRequests : undefined}
                isAdmin={true}
              />
              <ActionButton 
                icon="shield" 
                label="Manage Members" 
                onPress={() => console.log('Manage Members')}
                isAdmin={true}
              />
            </View>
          </View>
        )}

        {/* Dynamic Toolbar */}
        <View style={styles.section}>
          {generateToolbarButtons(anise.modules || {}, isAdmin, {
            pendingProposals,
            pendingClaims,
            navigation,
            anise,
            setShowCreateProposal,
            setShowCreateClaim,
            setShowCreateAnnouncement
          })}

        </View>
      </ScrollView>

      {/* Info Modal */}
      <InfoModal 
        visible={showInfo} 
        onClose={() => setShowInfo(false)} 
        anise={anise}
      />

              {/* Join Requests Modal */}
        <JoinRequestsModal
          visible={showJoinRequests}
          onClose={() => setShowJoinRequests(false)}
          daoAddress={anise.id}
          onRequestProcessed={() => {
            // Refresh the count when a request is processed
            const fetchJoinRequestCount = async () => {
              try {
                const joinRequests = await getJoinRequests(anise.id);
                setPendingJoinRequests(joinRequests.length);
              } catch (err) {
                console.error('Failed to fetch join request count:', err);
                setPendingJoinRequests(0);
              }
            };
            fetchJoinRequestCount();
          }}
        />

      {/* Create Claim Modal */}
      <CreateClaimModal
        visible={showCreateClaim}
        onClose={() => setShowCreateClaim(false)}
        daoAddress={anise.id}
      />

      {/* Create Proposal Modal */}
      <CreateProposalModal
        visible={showCreateProposal}
        onClose={() => setShowCreateProposal(false)}
        daoAddress={anise.id}
      />

      {/* Create Announcement Modal */}
      <CreateAnnouncementModal
        visible={showCreateAnnouncement}
        onClose={() => setShowCreateAnnouncement(false)}
        daoAddress={anise.id}
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
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5'
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  backButton: {
    padding: 4
  },
  infoButton: {
    marginLeft: 'auto',
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#111827'
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 12
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  statText: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '500'
  },
  content: {
    flex: 1,
    padding: 16
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#111827'
  },

  actionButton: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bae6fd',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1
  },
  iconContainer: {
    position: 'relative',
    marginBottom: 8
  },
  actionLabel: {
    fontSize: 12,
    color: '#374151',
    textAlign: 'center'
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end'
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%'
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827'
  },
  modalBody: {
    maxHeight: '90%'
  },
  infoRow: {
    marginBottom: 16
  },
  infoLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4
  },
  infoValue: {
    fontSize: 16,
    color: '#111827'
  },
  treasuryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  treasuryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  treasuryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  balanceContainer: {
    alignItems: 'center',
    backgroundColor: '#f0f9ff', // Light blue background
    borderRadius: 8,
    padding: 16,
    marginTop: 8,
  },
  treasuryBalance: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#0f766e', // Teal color for money
    textAlign: 'center',
    marginBottom: 4,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
  errorText: {
    color: '#ef4444',
    textAlign: 'center',
    marginTop: 8,
  },
  refreshButton: {
    padding: 8,
  },
  addressText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#2563eb',
    padding: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 4,
  },

  moduleSection: {
    marginBottom: 20
  },
  moduleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
    paddingHorizontal: 4
  },
  memberButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 8
  },
  adminButtonGrid: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between'
  },
  adminActionButton: {
    flex: 1,
    padding: 16,
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#dbeafe',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1
  },
  moduleButtonGrid: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between'
  }
});

export default AniseDetailsScreen; 