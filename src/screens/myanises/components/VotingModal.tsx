import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

interface VotingModalProps {
  visible: boolean;
  onClose: () => void;
  onVote: (approve: boolean) => void;
  title: string;
  description: string;
  amount?: string;  // Optional for proposals
  approvals: number;
  threshold: number;  // Now a percentage
  rejections: number;
}

export const VotingModal: React.FC<VotingModalProps> = ({
  visible,
  onClose,
  onVote,
  title,
  description,
  amount,
  approvals,
  threshold,
  rejections,
}) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Icon name="close" size={24} color="#64748b" />
            </TouchableOpacity>
          </View>

          {/* Details */}
          <View style={styles.details}>
            {amount && (
              <Text style={styles.amount}>£{amount}</Text>
            )}
            <Text style={styles.description}>{description}</Text>
          </View>

          {/* Voting Progress */}
          <View style={styles.votingProgress}>
            <Text style={styles.progressTitle}>Voting Progress</Text>
            <View style={styles.progressRow}>
              <Text style={styles.progressLabel}>Approvals:</Text>
              <Text style={styles.progressValue}>{approvals} ({threshold}% needed)</Text>
            </View>
            <View style={styles.progressRow}>
              <Text style={styles.progressLabel}>Rejections:</Text>
              <Text style={styles.progressValue}>{rejections}</Text>
            </View>
          </View>

          {/* Voting Buttons */}
          <View style={styles.votingButtons}>
            <TouchableOpacity 
              style={[styles.voteButton, styles.approveButton]}
              onPress={() => onVote(true)}
            >
              <Icon name="checkmark-circle" size={20} color="#FFFFFF" />
              <Text style={styles.voteButtonText}>Approve</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.voteButton, styles.rejectButton]}
              onPress={() => onVote(false)}
            >
              <Icon name="close-circle" size={20} color="#FFFFFF" />
              <Text style={styles.voteButtonText}>Reject</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  details: {
    marginBottom: 24,
  },
  amount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#059669',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#4B5563',
    lineHeight: 24,
  },
  votingProgress: {
    backgroundColor: '#F3F4F6',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  progressValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  votingButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  voteButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  approveButton: {
    backgroundColor: '#22C55E',
  },
  rejectButton: {
    backgroundColor: '#EF4444',
  },
  voteButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
}); 