import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { ethers } from 'ethers';

interface TokenBalanceCardProps {
  balance: string | null;
  isLoading: boolean;
  error: string | null;
  onWithdraw: () => void;
}

export const TokenBalanceCard: React.FC<TokenBalanceCardProps> = ({
  balance,
  isLoading,
  error,
  onWithdraw
}) => {
  const formattedBalance = balance ? ethers.formatEther(balance) : '0';

  return (
    <View style={styles.container}>
      <View style={styles.balanceContainer}>
        <Text style={styles.label}>Your Token Balance</Text>
        {isLoading ? (
          <ActivityIndicator size="small" color="#2563eb" />
        ) : error ? (
          <Text style={styles.error}>{error}</Text>
        ) : (
          <Text style={styles.balance}>{formattedBalance} ANISE</Text>
        )}
      </View>
      <TouchableOpacity 
        style={[styles.withdrawButton, { opacity: balance === '0' ? 0.5 : 1 }]}
        onPress={onWithdraw}
        disabled={balance === '0' || isLoading}
      >
        <Text style={styles.withdrawText}>Withdraw</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  balanceContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  balance: {
    fontSize: 24,
    fontWeight: '600',
    color: '#059669',
  },
  error: {
    fontSize: 14,
    color: '#DC2626',
  },
  withdrawButton: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  withdrawText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
}); 