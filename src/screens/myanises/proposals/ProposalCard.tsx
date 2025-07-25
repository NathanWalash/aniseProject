import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { doc, getDoc } from 'firebase/firestore';
import { StatusButton } from '../components/StatusButton';
import { db } from '../../../utils/firebase';

interface ProposalCardProps {
  proposal: {
    title: string;
    description: string;
    proposer: string;
    createdBy: string;
    status: string;
    voters?: Record<string, {
      vote: boolean;
      timestamp: { _seconds: number; _nanoseconds: number };
      txHash: string;
    }>;
  };
  onPress: () => void;
  userWallet: string;
}

export default function ProposalCard({ proposal, onPress, userWallet }: ProposalCardProps) {
  const [proposerName, setProposerName] = useState<string>('');

  useEffect(() => {
    const fetchProposerName = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', proposal.createdBy));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const firstName = userData.firstName || '';
          const lastName = userData.lastName || '';
          if (firstName || lastName) {
            setProposerName(`${firstName} ${lastName}`.trim());
          } else {
            // If no name, use shortened wallet address
            setProposerName(`${proposal.proposer.slice(0, 6)}...${proposal.proposer.slice(-4)}`);
          }
        } else {
          // If no user document, use shortened wallet address
          setProposerName(`${proposal.proposer.slice(0, 6)}...${proposal.proposer.slice(-4)}`);
        }
      } catch (error) {
        console.error('Error fetching proposer name:', error);
        // On error, use shortened wallet address
        setProposerName(`${proposal.proposer.slice(0, 6)}...${proposal.proposer.slice(-4)}`);
      }
    };
    fetchProposerName();
  }, [proposal.createdBy, proposal.proposer]);

  const isCreator = userWallet.toLowerCase() === proposal.proposer.toLowerCase();
  const hasVoted = proposal.voters?.[userWallet]?.vote !== undefined;

  const getButtonType = () => {
    if (proposal.status === 'approved') return 'approved';
    if (proposal.status === 'rejected') return 'rejected';
    if (isCreator) return 'creator';
    if (hasVoted) return 'already_voted';
    return 'vote_now';
  };

  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={onPress}
      disabled={isCreator || hasVoted || proposal.status !== 'pending'}
    >
      <View style={styles.content}>
        <Text style={styles.title}>{proposal.title}</Text>
        <Text style={styles.description} numberOfLines={2}>
          {proposal.description}
        </Text>
        <Text style={styles.proposer}>
          Submitted by: {proposerName}
        </Text>
      </View>
      <StatusButton 
        type={getButtonType()} 
        onPress={onPress}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    flex: 1,
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  proposer: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
}); 