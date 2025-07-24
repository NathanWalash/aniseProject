import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, StyleSheet, Modal, ActivityIndicator, Pressable } from 'react-native';
import { Anise } from './types/myAnise';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../../utils/api';
import { JoinRequestsModal } from './JoinRequestsModal';
import { CreateClaimModal } from './claims/CreateClaimModal';
import { CreateProposalModal } from './proposals/CreateProposalModal';
import { getTreasuryBalance } from '../../services/blockchainService';

interface AniseDetailsProps {
  route: { params: { anise: Anise } };
  navigation: any;
}

interface ActionButtonProps {
  icon: string;
  label: string;
  onPress: () => void;
  badge?: string | number;
}

const ActionButton: React.FC<ActionButtonProps> = ({ icon, label, onPress, badge }) => (
  <TouchableOpacity style={styles.actionButton} onPress={onPress}>
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Use the values we already have from the MyAnises page
  const memberCount = anise.members;
  const userRole = anise.role;
  const isAdmin = userRole === 'Admin';
  
  // Temporary hardcoded values for testing
  const pendingJoinRequests = 3;
  const pendingProposals = 2;
  const pendingClaims = 1;

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
          <View style={styles.statItem}>
            <Icon name="people" size={20} color="#2563eb" />
            <Text style={styles.statText}>{memberCount} Members</Text>
          </View>
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
            <View style={styles.buttonGrid}>
              <ActionButton 
                icon="people" 
                label="Join Requests" 
                onPress={() => setShowJoinRequests(true)}
                badge={pendingJoinRequests}
              />
              <ActionButton 
                icon="shield" 
                label="Manage Members" 
                onPress={() => console.log('Manage Members')}
              />
            </View>
          </View>
        )}

        {/* Main Toolbar */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Toolbar</Text>
          <View style={styles.buttonGrid}>
            <ActionButton 
              icon="document-text" 
              label="Proposals" 
              onPress={() => navigation.navigate('ProposalsList', { 
                daoAddress: anise.id,
                proposalThreshold: anise.modules?.ProposalVotingModule?.config?.approvalThreshold || 51
              })}
              badge={pendingProposals}
            />
            <ActionButton 
              icon="cash" 
              label="Claims" 
              onPress={() => navigation.navigate('ClaimsList', { 
                daoAddress: anise.id,
                claimThreshold: anise.modules?.ClaimVotingModule?.config?.approvalThreshold || 51
              })}
              badge={pendingClaims}
            />
            <ActionButton 
              icon="list" 
              label="Transactions" 
              onPress={() => console.log('Transactions')}
            />
            <ActionButton 
              icon="create" 
              label="New Proposal" 
              onPress={() => setShowCreateProposal(true)}
            />
            <ActionButton 
              icon="add-circle" 
              label="Submit Claim" 
              onPress={() => setShowCreateClaim(true)}
            />
            <ActionButton 
              icon="people" 
              label="View Members" 
              onPress={() => console.log('View Members')}
            />
          </View>
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
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between'
  },
  actionButton: {
    width: '30%',
    alignItems: 'center',
    padding: 12
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
});

export default AniseDetailsScreen; 