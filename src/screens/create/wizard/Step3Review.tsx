import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking, ActivityIndicator, Alert } from 'react-native';
import type { Template } from './CreateWizard';
import { deployAnise } from './deployAnise';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../../../utils/api';
import Icon from 'react-native-vector-icons/Ionicons';
import modules from '../../../templates/modules';

// Helper to generate unique config keys for module params (same as Step2Configure)
function getModuleParamKey(moduleName: string, paramName: string) {
  return `${moduleName}_${paramName}`;
}

const baseParams = [
  { name: 'daoName', label: 'DAO Name' },
  { name: 'daoBrief', label: 'Brief Description' },
  { name: 'intendedAudience', label: 'Intended Audience' },
  { name: 'daoMandate', label: 'Mandate' },
  { name: 'isPublic', label: 'Visibility' },
];

type Props = {
  template: Template;
  config: Record<string, any>;
  onBack: () => void;
  onReset: () => void;
  step?: number;
  agreed: boolean;
  setAgreed: (v: boolean) => void;
  user: any; // Add user to props
  navigation?: any; // Add navigation prop
};

async function fetchUserProfile(uid: string) { // Pass uid to fetch
  try {
    const idToken = await AsyncStorage.getItem('idToken');
    if (!idToken) throw new Error('No auth token found');
    const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
      headers: {
        'Authorization': `Bearer ${idToken}`,
        'Content-Type': 'application/json',
      },
    });
    if (!res.ok) throw new Error('Failed to fetch profile');
    return await res.json();
  } catch (err) {
    console.error('Failed to fetch user profile:', err);
    return null;
  }
}

export default function Step3Review({ template, config, onBack, onReset, agreed, setAgreed, user, navigation }: Props) {
  const [creatorName, setCreatorName] = useState<string>('');
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    if (user && user.uid) {
      fetchUserProfile(user.uid).then(profile => {
        if (profile) {
          setCreatorName(
            (profile.firstName && profile.lastName)
              ? `${profile.firstName} ${profile.lastName}`
              : profile.email || 'Unknown'
          );
        } else {
          setCreatorName(user.email || 'Unknown'); // Fallback to token email
        }
        setProfileLoading(false);
      });
    } else {
      setCreatorName('Unknown');
      setProfileLoading(false);
    }
  }, [user]);

  const finalConfig: Record<string, any> = {
    ...config,
    createdBy: creatorName,
    dateCreated: new Date().toISOString(),
  };

  // Helper to format date as YYYY-MM-DD
  function formatDate(dateString: string) {
    const d = new Date(dateString);
    return d.toISOString().split('T')[0];
  }

  // Helper for key-value row
  const KeyValueRow = ({ icon, label, value }: { icon?: string; label: string; value: string | React.ReactNode }) => (
    <View style={styles.kvRow}>
      <View style={styles.kvLabelWrap}>
        {icon && <Icon name={icon} size={16} color="#2563eb" style={{ marginRight: 6 }} />}
        <Text style={styles.kvLabel}>{label}</Text>
      </View>
      <Text style={styles.kvValue}>{value}</Text>
    </View>
  );

  // Group module config by module
  const moduleConfigSections = template.modules.map((moduleName: string) => {
    const mod = modules[moduleName];
    const params = mod && mod.initParamsSchema ? mod.initParamsSchema : [];
    // Only show user-configurable params (should match Step2Configure filtering)
    const userParams = params.filter((p: any) => !['admin', 'token', 'owner'].includes(p.name));
    const paramRows = userParams.map((param: any) => {
      const configKey = getModuleParamKey(moduleName, param.name);
      // Show default if not set
      const value = config[configKey] !== undefined
        ? String(config[configKey])
        : (param.default !== undefined ? String(param.default) : '-');
      return (
        <View key={param.name} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <Text style={{ color: '#444', fontWeight: '500', fontSize: 15 }}>{param.label || param.name}</Text>
          <Text style={{ color: '#2563eb', fontWeight: 'bold', fontSize: 15 }}>{value}</Text>
        </View>
      );
    });
    // Special note for TreasuryModule
    const treasuryNote = moduleName === 'TreasuryModule' ? (
      <Text style={{ color: '#888', fontSize: 13, marginTop: 4 }}>
        <Icon name="information-circle-outline" size={14} color="#2563eb" />
        {' '}Token address and treasury owner will be set automatically during deployment.
      </Text>
    ) : null;
    // Special note for MemberModule
    const memberNote = moduleName === 'MemberModule' ? (
      <Text style={{ color: '#888', fontSize: 13, marginTop: 4 }}>
        <Icon name="information-circle-outline" size={14} color="#2563eb" />
        {' '}The initial admin will be set to your wallet address upon deployment.
      </Text>
    ) : null;
    return (
      <View key={moduleName} style={{ marginBottom: 18, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' }}>
        <Text style={{ fontWeight: 'bold', fontSize: 16, color: '#2563eb', marginBottom: 8 }}>{moduleName.replace('Module', '')} Module</Text>
        {paramRows.length > 0 ? paramRows : <Text style={styles.kvValue}>No parameters configured.</Text>}
        {treasuryNote}
        {memberNote}
      </View>
    );
  });

  return (
    <View style={styles.root}>
      {/* DAO Details Card */}
      <View style={styles.card}>
        <Text style={styles.cardHeader}>DAO Details</Text>
        <KeyValueRow label="DAO Name" value={finalConfig.daoName || '-'} icon="pricetag-outline" />
        <KeyValueRow label="Brief Description" value={finalConfig.daoBrief || '-'} icon="document-text-outline" />
        <KeyValueRow label="Intended Audience" value={finalConfig.intendedAudience || '-'} icon="people-outline" />
        <KeyValueRow label="Mandate" value={finalConfig.daoMandate || '-'} icon="list-outline" />
        <KeyValueRow label="Visibility" value={<View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Icon name={finalConfig.isPublic ? 'globe-outline' : 'lock-closed-outline'} size={15} color={finalConfig.isPublic ? '#2563eb' : '#888'} style={{ marginRight: 4 }} />
          <Text style={{ color: finalConfig.isPublic ? '#2563eb' : '#888', fontWeight: 'bold' }}>{finalConfig.isPublic ? 'Public' : 'Private'}</Text>
        </View>} icon="eye-outline" />
        <KeyValueRow label="Created By" value={profileLoading ? <ActivityIndicator size="small" color="#2563eb" /> : finalConfig.createdBy} icon="person-outline" />
        <KeyValueRow label="Date Created" value={formatDate(finalConfig.dateCreated)} icon="calendar-outline" />
      </View>

      {/* Module Configuration Card */}
      <View style={styles.card}>
        <Text style={styles.cardHeader}>Module Configuration</Text>
        {moduleConfigSections}
      </View>

      {/* Agreement Checkbox */}
      <TouchableOpacity
        style={styles.agreeRow}
        onPress={() => setAgreed(!agreed)}
        activeOpacity={0.8}
      >
        <View style={[styles.checkbox, agreed && styles.checkboxChecked]}>
          {agreed && <Icon name="checkmark" size={16} color="#2563eb" />}
        </View>
        <Text style={styles.agreeText}>
          I agree to the Anise platform{' '}
          <Text
            style={styles.link}
            onPress={e => {
              e.stopPropagation?.();
              Linking.openURL('https://anise.com/terms');
            }}
          >Terms of Service and Privacy Policy</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingHorizontal: 2,
    paddingTop: 12,
    backgroundColor: '#f8fafc',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 22,
    marginHorizontal: 2,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 14,
    color: '#2563eb',
  },
  kvRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    justifyContent: 'space-between',
  },
  kvLabelWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
    minWidth: 90,
  },
  kvLabel: {
    color: '#222',
    fontWeight: '600',
    fontSize: 15,
    flexShrink: 1,
  },
  kvValue: {
    color: '#444',
    fontSize: 15,
    fontWeight: '400',
    flexShrink: 1,
    textAlign: 'right',
  },
  agreeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 16,
    paddingVertical: 10,
  },
  checkbox: {
    width: 26,
    height: 26,
    borderWidth: 2,
    borderColor: '#2563eb',
    borderRadius: 6,
    marginRight: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#e0e7ff',
    borderColor: '#2563eb',
  },
  agreeText: {
    color: '#222',
    fontSize: 15,
    flex: 1,
    flexWrap: 'wrap',
  },
  link: {
    color: '#2563eb',
    textDecorationLine: 'underline',
    fontWeight: 'bold',
  },
  deployButton: {
    marginTop: 18,
    backgroundColor: '#2563eb',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  deployButtonActive: {
    opacity: 1,
  },
  deployButtonDisabled: {
    backgroundColor: '#a5b4fc',
    opacity: 0.6,
  },
  deployButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  stickyNavRow: {
    flexDirection: 'row',
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    zIndex: 10,
  },
  navButton: {
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButtonPrimary: {
    backgroundColor: '#2563eb',
  },
  navButtonSecondary: {
    backgroundColor: '#e0e7ff',
  },
  navButtonTextPrimary: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  navButtonTextSecondary: {
    color: '#2563eb',
    fontWeight: 'bold',
    fontSize: 18,
  },
}); 