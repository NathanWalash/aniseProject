import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { StatusButton } from '../components/StatusButton';
import { Claim } from '../../../services/claimApi';
import { API_BASE_URL } from '../../../utils/api';

interface ClaimCardProps {
  claim: Claim;
  onPress: () => void;
  userWallet: string;
}

export default function ClaimCard({ claim, onPress, userWallet }: ClaimCardProps) {
  const [claimantName, setClaimantName] = useState<string>('');

  useEffect(() => {
    const fetchClaimantName = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/users/${claim.createdBy}`);
        const data = await res.json();
        if (res.ok) {
          setClaimantName(`${data.firstName} ${data.lastName}`);
        } else {
          // If no user data, use shortened wallet address
          setClaimantName(`${claim.claimant.slice(0, 6)}...${claim.claimant.slice(-4)}`);
        }
      } catch (error) {
        console.error('Error fetching claimant name:', error);
        // On error, use shortened wallet address
        setClaimantName(`${claim.claimant.slice(0, 6)}...${claim.claimant.slice(-4)}`);
      }
    };
    fetchClaimantName();
  }, [claim.createdBy, claim.claimant]);

  const isCreator = userWallet.toLowerCase() === claim.claimant.toLowerCase();
  const hasVoted = claim.voters?.[userWallet]?.vote !== undefined;

  const getButtonType = () => {
    if (claim.status === 'approved') return 'approved';
    if (claim.status === 'rejected') return 'rejected';
    if (isCreator) return 'creator';
    if (hasVoted) return 'already_voted';
    return 'vote_now';
  };

  return (
    <TouchableOpacity 
      style={styles.card}
      onPress={onPress}
      disabled={claim.status !== 'pending' || hasVoted || isCreator}
    >
      <Text style={styles.title}>{claim.title}</Text>
      <Text style={styles.creatorName}>Created by {claimantName}</Text>
      <Text style={styles.amount}>£{claim.amount}</Text>
      <Text style={styles.description} numberOfLines={2}>
        {claim.description}
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
  amount: {
    fontSize: 16,
    fontWeight: '500',
    color: '#059669',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
}); 