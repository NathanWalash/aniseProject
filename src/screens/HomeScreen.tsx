// src/screens/HomeScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  View,
} from 'react-native';
import { signOut, User } from 'firebase/auth';
import { auth, db } from '../firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import AccountSettingsScreen from './AccountSettingsScreen';

interface Profile {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  email: string;
}

type Props = { user: User };

export default function HomeScreen({ user }: Props) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const snap = await getDoc(doc(db, 'users', user.uid));
      if (snap.exists()) setProfile(snap.data() as Profile);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user.uid]);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-gray-100">
        <ActivityIndicator size="large" color="#0066cc" />
      </SafeAreaView>
    );
  }

  if (editing) {
    return (
      <AccountSettingsScreen
        user={user}
        onDone={() => {
          setEditing(false);
          fetchProfile();
        }}
      />
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-100 px-4 pt-8">
      <View className="bg-white rounded-2xl p-6 w-11/12 max-w-md self-center shadow-card mb-6">
        <Text className="text-2xl font-bold text-center mb-2">
          Hello, {profile?.firstName} {profile?.lastName}!
        </Text>
        <Text className="text-base text-gray-600 text-center mb-1">
          Date of Birth: {profile?.dateOfBirth}
        </Text>
        <Text className="text-base text-gray-600 text-center">
          Email: {profile?.email}
        </Text>
      </View>

      <TouchableOpacity
        onPress={() => setEditing(true)}
        className="bg-brand-500 rounded-full py-3 mb-4 w-11/12 max-w-md self-center"
      >
        <Text className="text-white text-center font-semibold">
          Account Settings
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => signOut(auth)}
        className="bg-red-500 rounded-full py-3 w-11/12 max-w-md self-center"
      >
        <Text className="text-white text-center font-semibold">Log Out</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
