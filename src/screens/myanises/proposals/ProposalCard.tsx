import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { StatusButton } from '../components/StatusButton';
import { Proposal } from '../../../services/proposalApi';
import { API_BASE_URL } from '../../../utils/api';

interface ProposalCardProps {
  proposal: Proposal;
  onPress: () => void;
  userWallet: string;
}

export default function ProposalCard({ proposal, onPress, userWallet }: ProposalCardProps) {
  const [creatorName, setCreatorName] = useState<string>('');

  useEffect(() => {
    const fetchCreatorName = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/users/${proposal.createdBy}`);
        const data = await res.json();
        if (res.ok) {
          setCreatorName(`${data.firstName} ${data.lastName}`);
        } else {
          // If no user data, use shortened wallet address
          setCreatorName(`${proposal.proposer.slice(0, 6)}...${proposal.proposer.slice(-4)}`);
        }
      } catch (error) {
        console.error('Error fetching creator name:', error);
        // On error, use shortened wallet address
        setCreatorName(`${proposal.proposer.slice(0, 6)}...${proposal.proposer.slice(-4)}`);
      }
    };
    fetchCreatorName();
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
      disabled={proposal.status !== 'pending' || hasVoted || isCreator}
    >
      <Text style={styles.title}>{proposal.title}</Text>
      <Text style={styles.creatorName}>Created by {creatorName}</Text>
      <Text style={styles.description} numberOfLines={2}>
        {proposal.description}
      </Text>
      <StatusButton 
        type={getButtonType()}
        onPress={onPress}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  creatorName: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
    fontStyle: 'italic',
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
}); 