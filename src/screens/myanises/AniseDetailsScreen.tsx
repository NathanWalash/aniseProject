import React, { useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Anise } from './types/myAnise';

interface AniseDetailsProps {
  route: { params: { anise: Anise } };
  navigation: any;
}

const ActionButton: React.FC<{
  label: string;
  onPress: () => void;
  variant?: 'default' | 'admin';
}> = ({ label, onPress, variant = 'default' }) => (
  <TouchableOpacity 
    style={[
      styles.actionButton,
      variant === 'admin' ? styles.adminButton : styles.defaultButton
    ]}
    onPress={onPress}
  >
    <Text style={[
      styles.actionButtonText,
      variant === 'admin' ? styles.adminButtonText : styles.defaultButtonText
    ]}>
      {label}
    </Text>
  </TouchableOpacity>
);

const AniseDetailsScreen: React.FC<AniseDetailsProps> = ({ route, navigation }) => {
  const { anise } = route.params;
  // Temporary hardcoded role for testing - we'll integrate this with context later
  const [userRole] = useState<'Admin' | 'Member'>('Admin');
  const isAdmin = userRole === 'Admin';

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>← Back to My Anises</Text>
        </TouchableOpacity>
        
        <Text style={styles.title}>{anise.name}</Text>
        <Text style={styles.subtitle}>{anise.description}</Text>
        <Text style={styles.role}>Your Role: {userRole}</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Treasury Balance Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Treasury Balance</Text>
          <Text style={styles.balanceText}>Loading...</Text>
        </View>

        {/* Member Actions Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Member Actions</Text>
          <View style={styles.buttonGrid}>
            <ActionButton 
              label="Create Proposal" 
              onPress={() => console.log('Create Proposal')}
            />
            <ActionButton 
              label="Submit Claim" 
              onPress={() => console.log('Submit Claim')}
            />
            <ActionButton 
              label="View Members" 
              onPress={() => console.log('View Members')}
            />
          </View>
        </View>

        {/* Admin Controls - Only visible to admins */}
        {isAdmin && (
          <View style={[styles.card, styles.adminCard]}>
            <Text style={[styles.cardTitle, styles.adminTitle]}>Admin Controls</Text>
            <View style={styles.buttonGrid}>
              <ActionButton 
                label="Join Requests" 
                onPress={() => console.log('Join Requests')}
                variant="admin"
              />
              <ActionButton 
                label="Manage Roles" 
                onPress={() => console.log('Manage Roles')}
                variant="admin"
              />
              <ActionButton 
                label="Remove Members" 
                onPress={() => console.log('Remove Members')}
                variant="admin"
              />
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F7'
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5'
  },
  backButton: {
    marginBottom: 16
  },
  backButtonText: {
    fontSize: 16,
    color: '#2563eb'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#111827'
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 8
  },
  role: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500'
  },
  content: {
    flex: 1,
    padding: 16
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2
  },
  adminCard: {
    backgroundColor: '#FDF2F8',
    borderWidth: 1,
    borderColor: '#FB7185'
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#111827'
  },
  adminTitle: {
    color: '#BE123C'
  },
  balanceText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#059669'
  },
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12
  },
  actionButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    minWidth: '45%',
    alignItems: 'center'
  },
  defaultButton: {
    backgroundColor: '#EEF2FF',
  },
  adminButton: {
    backgroundColor: '#FDF2F8',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600'
  },
  defaultButtonText: {
    color: '#2563eb'
  },
  adminButtonText: {
    color: '#BE123C'
  }
});

export default AniseDetailsScreen; 