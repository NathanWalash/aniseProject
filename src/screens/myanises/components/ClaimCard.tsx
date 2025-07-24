import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { StatusButton } from './StatusButton';

interface ClaimCardProps {
  title: string;
  amount: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  hasVoted: boolean;
  onPress: () => void;
}

export const ClaimCard: React.FC<ClaimCardProps> = ({
  title,
  amount,
  description,
  status,
  hasVoted,
  onPress,
}) => {
  const getButtonType = () => {
    if (status === 'pending') {
      return hasVoted ? 'already_voted' : 'vote_now';
    }
    return status;
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.amount}>£{amount}</Text>
      <Text 
        style={styles.description}
        numberOfLines={2}
      >
        {description}
      </Text>
      <StatusButton 
        type={getButtonType()}
        onPress={onPress}
      />
    </View>
  );
};

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