import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

type ButtonType = 'vote_now' | 'already_voted' | 'approved' | 'rejected' | 'creator' | 'payout' | 'paid';

interface StatusButtonProps {
  type: ButtonType;
  onPress: () => void;
}

export const StatusButton: React.FC<StatusButtonProps> = ({ type, onPress }) => {
  const getButtonStyle = () => {
    switch (type) {
      case 'vote_now':
        return styles.voteNow;
      case 'already_voted':
        return styles.alreadyVoted;
      case 'approved':
        return styles.approved;
      case 'rejected':
        return styles.rejected;
      case 'creator':
        return styles.creator;
      case 'payout':
        return styles.payout;
      case 'paid':
        return styles.paid;
    }
  };

  const getButtonText = () => {
    switch (type) {
      case 'vote_now':
        return 'Vote Now';
      case 'already_voted':
        return 'Already Voted';
      case 'approved':
        return 'Approved ✓';
      case 'rejected':
        return 'Rejected ✗';
      case 'creator':
        return 'Your Submission';
      case 'payout':
        return 'Payout';
      case 'paid':
        return 'Paid ✓';
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.button, getButtonStyle()]} 
      onPress={onPress}
      disabled={type !== 'vote_now' && type !== 'payout'}
    >
      <Text style={[
        styles.text,
        (type === 'already_voted' || type === 'creator') && styles.grayText
      ]}>
        {getButtonText()}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  grayText: {
    color: '#6B7280',
  },
  voteNow: {
    backgroundColor: '#2563EB', // Blue
  },
  alreadyVoted: {
    backgroundColor: '#F3F4F6', // Light gray
  },
  approved: {
    backgroundColor: '#22C55E', // Green
  },
  rejected: {
    backgroundColor: '#EF4444', // Red
  },
  creator: {
    backgroundColor: '#F3F4F6', // Light gray
  },
  payout: {
    backgroundColor: '#22C55E', // Green
  },
  paid: {
    backgroundColor: '#059669', // Dark green
  },
}); 