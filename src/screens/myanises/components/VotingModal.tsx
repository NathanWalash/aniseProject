import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Linking } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { voteOnClaim } from '../../../services/claimApi';
import { voteOnProposal } from '../../../services/proposalApi';
import { walletConnectService } from '../../../../wallet/walletConnectInstance';

interface VotingModalProps {
  isVisible: boolean;
  onClose: () => void;
  daoAddress: string;
  type: 'claim' | 'proposal';
  item: {
    id: string;
    title: string;
    description: string;
    amount?: string;
    approvals: number;
    rejections: number;
    claimant?: string; // For claims
    proposer?: string; // For proposals
  };
  threshold: number;
}

export const VotingModal: React.FC<VotingModalProps> = ({
  isVisible,
  onClose,
  daoAddress,
  type,
  item,
  threshold
}) => {
  const [loading, setLoading] = useState(false);

  // Get current wallet address
  const currentAddress = walletConnectService.session?.namespaces?.eip155?.accounts[0].split(':').pop()?.toLowerCase();

  // Check if user is the creator
  const isCreator = type === 'claim' 
    ? item.claimant?.toLowerCase() === currentAddress
    : item.proposer?.toLowerCase() === currentAddress;

  const handleVote = async (approve: boolean) => {
    try {
      // Check if user is creator
      if (isCreator) {
        Alert.alert('Error', `You cannot vote on your own ${type}`);
        return;
      }

      setLoading(true);
      Linking.openURL('metamask://'); // Open MetaMask

      if (type === 'claim') {
        await voteOnClaim(daoAddress, item.id, approve);
      } else {
        await voteOnProposal(daoAddress, item.id, approve);
      }
      onClose();
    } catch (err: any) {
      console.error(`Error voting on ${type}:`, err);
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isVisible) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Vote on {type}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Icon name="close" size={24} color="#64748b" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>{item.title}</Text>
          {item.amount && (
            <Text style={styles.amount}>£{item.amount}</Text>
          )}
          <Text style={styles.description}>{item.description}</Text>
          
          <View style={styles.votingInfo}>
            <View style={styles.thresholdRow}>
              <Text style={styles.thresholdText}>{threshold}% approval threshold needed</Text>
              <TouchableOpacity style={styles.infoButton}>
                <Icon name="information-circle-outline" size={16} color="#6B7280" />
              </TouchableOpacity>
            </View>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color="#2563eb" style={styles.loader} />
          ) : (
            <View style={styles.buttonContainer}>
              {isCreator ? (
                <Text style={styles.creatorText}>You cannot vote on your own {type}</Text>
              ) : (
                <>
                  <TouchableOpacity
                    style={[styles.button, styles.approveButton]}
                    onPress={() => handleVote(true)}
                  >
                    <Icon name="checkmark-circle" size={20} color="#FFFFFF" style={styles.buttonIcon} />
                    <Text style={styles.buttonText}>Approve</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.button, styles.rejectButton]}
                    onPress={() => handleVote(false)}
                  >
                    <Icon name="close-circle" size={20} color="#FFFFFF" style={styles.buttonIcon} />
                    <Text style={styles.buttonText}>Reject</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  amount: {
    fontSize: 18,
    fontWeight: '500',
    color: '#059669',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#4B5563',
    marginBottom: 20,
    lineHeight: 24,
  },
  votingInfo: {
    backgroundColor: '#F3F4F6',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  thresholdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  thresholdText: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
  },
  infoButton: {
    padding: 4,
  },
  loader: {
    marginVertical: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  buttonIcon: {
    marginRight: 4,
  },
  approveButton: {
    backgroundColor: '#22C55E',
  },
  rejectButton: {
    backgroundColor: '#EF4444',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  creatorText: {
    textAlign: 'center',
    color: '#6B7280',
    fontSize: 16,
    fontStyle: 'italic',
  },
}); 