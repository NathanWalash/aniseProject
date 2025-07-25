import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { doc, getDoc } from 'firebase/firestore';
import { StatusButton } from '../components/StatusButton';
import { db } from '../../../utils/firebase';

interface ClaimCardProps {
  claim: {
    title: string;
    amount: string;
    description: string;
    claimant: string;
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

export default function ClaimCard({ claim, onPress, userWallet }: ClaimCardProps) {
  const [claimantName, setClaimantName] = useState<string>('');

  useEffect(() => {
    const fetchClaimantName = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', claim.createdBy));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const firstName = userData.firstName || '';
          const lastName = userData.lastName || '';
          if (firstName || lastName) {
            setClaimantName(`${firstName} ${lastName}`.trim());
          } else {
            // If no name, use shortened wallet address
            setClaimantName(`${claim.claimant.slice(0, 6)}...${claim.claimant.slice(-4)}`);
          }
        } else {
          // If no user document, use shortened wallet address
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
      disabled={isCreator || hasVoted || claim.status !== 'pending'}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{claim.title}</Text>
          <Text style={styles.amount}>£{claim.amount}</Text>
        </View>
        <Text style={styles.description} numberOfLines={2}>
          {claim.description}
        </Text>
        <Text style={styles.claimant}>
          Submitted by: {claimantName}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    marginRight: 12,
  },
  amount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#059669', // Green color for amount
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  claimant: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
}); 