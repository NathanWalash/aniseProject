import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import type { Template } from './CreateWizard';
import { deployAnise } from './deployAnise';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../../../utils/api';

const baseParams = [
  { name: 'daoName', label: 'DAO Name' },
  { name: 'daoBrief', label: 'Brief Description' },
  { name: 'daoMandate', label: 'Mandate' },
  { name: 'isPublic', label: 'Public DAO?' },
];

type Props = {
  template: Template;
  config: Record<string, any>;
  onBack: () => void;
  onReset: () => void;
  step?: number;
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

export default function Step3Review({ template, config, onBack, onReset, step = 3 }: Props) {
  const [agreed, setAgreed] = useState(false);
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

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
          <Text className="text-2xl font-bold mb-4">Review Your Anise</Text>
          {/* Base parameters */}
          <View className="mb-4">
            <Text className="font-semibold mb-2">DAO Details:</Text>
            {baseParams.map(param => (
              <Text key={param.name} className="mb-1">
                {param.label}: {param.name === 'isPublic' ? (finalConfig[param.name] ? 'Public' : 'Private') : finalConfig[param.name]}
              </Text>
            ))}
            <Text className="mb-1">Created By: {profileLoading ? 'Loading...' : finalConfig.createdBy}</Text>
            <Text className="mb-1">Date Created: {finalConfig.dateCreated}</Text>
          </View>
          {/* Module parameters */}
          <View className="mb-4">
            <Text className="font-semibold mb-2">Module Configuration:</Text>
            {Object.entries(config).filter(([key]) => !baseParams.some(p => p.name === key)).map(([key, value]) => (
              <Text key={key} className="mb-1">{key}: {String(value)}</Text>
            ))}
          </View>
          <View className="flex-row items-center mb-4">
            <TouchableOpacity
              onPress={() => setAgreed(a => !a)}
              className={`w-5 h-5 border rounded mr-2 ${agreed ? 'bg-brand-500' : 'bg-white'}`}
            />
            <Text>I agree to the Anise platform Terms of Service and Privacy Policy</Text>
          </View>
        </ScrollView>
        {/* Progress and Buttons */}
        <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, paddingBottom: 24, paddingHorizontal: 16, backgroundColor: '#fff' }}>
          <View style={{ alignItems: 'center', marginBottom: 8 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 4 }}>
              {[0, 1, 2].map(i => (
                <View key={i} style={{ width: 8, height: 8, borderRadius: 4, marginHorizontal: 4, backgroundColor: i === 2 ? '#2563eb' : '#d1d5db' }} />
              ))}
            </View>
            <Text style={{ color: '#6b7280', fontSize: 12 }}>Step 3 of 3</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <TouchableOpacity
              style={{ flex: 1, marginRight: 8, backgroundColor: '#d1d5db', borderRadius: 8, paddingVertical: 14 }}
              onPress={onBack}
            >
              <Text style={{ textAlign: 'center', fontWeight: 'bold', fontSize: 16 }}>Previous Step</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ flex: 1, marginLeft: 8, backgroundColor: agreed ? '#2563eb' : '#d1d5db', borderRadius: 8, paddingVertical: 14 }}
              onPress={() => {
                deployAnise(template, finalConfig);
                onReset();
              }}
              disabled={!agreed}
            >
              <Text style={{ textAlign: 'center', fontWeight: 'bold', fontSize: 16, color: '#fff' }}>Deploy</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
} 