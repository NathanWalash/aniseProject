import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { StatusButton } from './StatusButton';

interface ProposalCardProps {
  title: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  hasVoted: boolean;
  isCreator: boolean;
  onPress: () => void;
}

export const ProposalCard: React.FC<ProposalCardProps> = ({
  title,
  description,
  status,
  hasVoted,
  isCreator,
  onPress,
}) => {
  const getButtonType = () => {
    if (status === 'pending') {
      if (isCreator) return 'creator';
      return hasVoted ? 'already_voted' : 'vote_now';
    }
    return status;
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
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
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
}); 