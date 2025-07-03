import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import type { Template } from './CreateWizard';
import { deployAnise } from './deployAnise';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../../../utils/api';

const baseParams = [
  { name: 'daoName', label: 'DAO Name' },
  { name: 'daoBrief', label: 'Brief Description' },
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
};

async function fetchUserProfile() {
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

export default function Step3Review({ template, config, onBack, onReset, agreed, setAgreed }: Props) {
  const [creatorName, setCreatorName] = useState<string>('');
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    fetchUserProfile().then(profile => {
      if (profile) {
        setCreatorName(
          (profile.firstName && profile.lastName)
            ? `${profile.firstName} ${profile.lastName}`
            : profile.email || 'Unknown'
        );
      } else {
        setCreatorName('Unknown');
      }
      setProfileLoading(false);
    });
  }, []);

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

  return (
    <>
      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>DAO Details:</Text>
        <Text style={{ marginBottom: 2 }}>DAO Name: {finalConfig.daoName}</Text>
        <Text style={{ marginBottom: 2 }}>Brief Description: {finalConfig.daoBrief}</Text>
        <Text style={{ marginBottom: 2 }}>Mandate: {finalConfig.daoMandate}</Text>
        <Text style={{ marginBottom: 2 }}>Visibility: {finalConfig.isPublic ? 'Public' : 'Private'}</Text>
        <Text style={{ marginBottom: 2 }}>Created By: {profileLoading ? 'Loading...' : finalConfig.createdBy}</Text>
        <Text style={{ marginBottom: 2 }}>Date Created: {formatDate(finalConfig.dateCreated)}</Text>
      </View>
      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>Module Configuration:</Text>
        {Object.entries(config).filter(([key]) => !baseParams.some(p => p.name === key)).map(([key, value]) => (
          <Text key={key} style={{ marginBottom: 2 }}>{key}: {String(value)}</Text>
        ))}
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
        <TouchableOpacity
          onPress={() => setAgreed(!agreed)}
          style={{ width: 24, height: 24, borderWidth: 1, borderColor: '#2563eb', borderRadius: 4, marginRight: 8, backgroundColor: agreed ? '#2563eb' : '#fff', alignItems: 'center', justifyContent: 'center' }}
        >
          {agreed && <View style={{ width: 14, height: 14, backgroundColor: '#fff', borderRadius: 2 }} />}
        </TouchableOpacity>
        <Text>I agree to the Anise platform Terms of Service and Privacy Policy</Text>
      </View>
    </>
  );
} 