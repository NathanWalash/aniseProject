// src/screens/HomeScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  View,
  TextInput,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../../utils/api';

interface Profile {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  email: string;
}

type ProfileScreenProps = { onLogout: () => void };

export default function ProfileScreen({ onLogout }: ProfileScreenProps) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<{ message: string; error?: boolean } | null>(null);
  // Profile edit
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dob, setDob] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  // Email
  const [newEmail, setNewEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [savingEmail, setSavingEmail] = useState(false);
  // Password
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      const idToken = await AsyncStorage.getItem('idToken');
      if (!idToken) return;
      try {
        const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${idToken}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to fetch profile');
        setProfile(data);
        setFirstName(data.firstName || '');
        setLastName(data.lastName || '');
        setDob(data.dateOfBirth || '');
      } catch (err: any) {
        setStatus({ message: err.message, error: true });
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const saveProfile = async () => {
    setSavingProfile(true);
    setStatus(null);
    const idToken = await AsyncStorage.getItem('idToken');
    if (!idToken) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ firstName, lastName, dateOfBirth: dob }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update profile');
      setStatus({ message: 'Profile updated.' });
      setProfile({ ...profile, firstName, lastName, dateOfBirth: dob, email: profile?.email } as Profile);
    } catch (err: any) {
      setStatus({ message: err.message, error: true });
    } finally {
      setSavingProfile(false);
    }
  };

  const saveEmail = async () => {
    setStatus(null);
    if (!newEmail.trim() || !currentPassword) {
      setStatus({ message: 'Email + current password required.', error: true });
      return;
    }
    setSavingEmail(true);
    try {
      // TODO: Update user email by calling backend endpoint
      setStatus({ message: 'Email updated. Log back in.' });
    } catch (err) {
      setStatus({ message: (err as Error).message, error: true });
    } finally {
      setSavingEmail(false);
    }
  };

  const savePassword = async () => {
    setStatus(null);
    if (newPassword !== confirmPassword || !currentPassword) {
      setStatus({ message: 'Passwords must match + current password.', error: true });
      return;
    }
    setSavingPassword(true);
    try {
      // TODO: Update user password by calling backend endpoint
      setStatus({ message: 'Password updated.' });
    } catch (err) {
      setStatus({ message: (err as Error).message, error: true });
    } finally {
      setSavingPassword(false);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('idToken');
    await AsyncStorage.removeItem('refreshToken');
    if (onLogout) onLogout();
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-gray-100">
        <ActivityIndicator size="large" color="#7B68EE" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <ScrollView contentContainerStyle={{ alignItems: 'center', padding: 16 }}>
        {/* Profile Card */}
        <View className="bg-white rounded-2xl p-6 w-full max-w-md shadow-card mb-6 items-center">
          <View className="w-20 h-20 rounded-full bg-brand-100 mb-4 items-center justify-center">
            {/* Placeholder for avatar */}
            <Text className="text-4xl text-brand-500 font-bold">{profile?.firstName?.[0] || ''}{profile?.lastName?.[0] || ''}</Text>
          </View>
          <Text className="text-2xl font-bold text-center mb-1">
            {profile?.firstName} {profile?.lastName}
          </Text>
          <Text className="text-base text-gray-600 text-center mb-1">
            {profile?.email}
          </Text>
          <Text className="text-base text-gray-400 text-center mb-1">
            DOB: {profile?.dateOfBirth}
          </Text>
        </View>

        {/* Status Message */}
        {status && (
          <Text className="text-green-600 text-center mb-2">{status.message}</Text>
        )}
        {status && status.error && (
          <Text className="text-red-500 text-center mb-2">{status.message}</Text>
        )}

        {/* Edit Profile Section */}
        <View className="bg-white rounded-2xl p-6 w-full max-w-md shadow-card mb-6">
          <Text className="text-lg font-semibold mb-2">Edit Profile</Text>
          <TextInput
            className="border-b border-gray-300 pb-2 mb-3"
            placeholder="First Name"
            value={firstName}
            onChangeText={setFirstName}
          />
          <TextInput
            className="border-b border-gray-300 pb-2 mb-3"
            placeholder="Last Name"
            value={lastName}
            onChangeText={setLastName}
          />
          <TextInput
            className="border-b border-gray-300 pb-2 mb-4"
            placeholder="DOB (YYYY-MM-DD)"
            value={dob}
            onChangeText={setDob}
          />
          <TouchableOpacity
            onPress={saveProfile}
            disabled={savingProfile}
            className="bg-brand-500 rounded-full py-2"
          >
            {savingProfile ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white text-center">Save Profile</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Change Email Section */}
        <View className="bg-white rounded-2xl p-6 w-full max-w-md shadow-card mb-6">
          <Text className="text-lg font-semibold mb-2">Change Email</Text>
          <TextInput
            className="border-b border-gray-300 pb-2 mb-3"
            placeholder="New Email"
            value={newEmail}
            onChangeText={setNewEmail}
            autoCapitalize="none"
          />
          <TextInput
            className="border-b border-gray-300 pb-2 mb-4"
            placeholder="Current Password"
            secureTextEntry
            value={currentPassword}
            onChangeText={setCurrentPassword}
          />
          <TouchableOpacity
            onPress={saveEmail}
            disabled={savingEmail}
            className="bg-brand-500 rounded-full py-2"
          >
            {savingEmail ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white text-center">Update Email</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Change Password Section */}
        <View className="bg-white rounded-2xl p-6 w-full max-w-md shadow-card mb-6">
          <Text className="text-lg font-semibold mb-2">Change Password</Text>
          <TextInput
            className="border-b border-gray-300 pb-2 mb-3"
            placeholder="Current Password"
            secureTextEntry
            value={currentPassword}
            onChangeText={setCurrentPassword}
          />
          <TextInput
            className="border-b border-gray-300 pb-2 mb-3"
            placeholder="New Password"
            secureTextEntry
            value={newPassword}
            onChangeText={setNewPassword}
          />
          <TextInput
            className="border-b border-gray-300 pb-2 mb-4"
            placeholder="Confirm Password"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
          <TouchableOpacity
            onPress={savePassword}
            disabled={savingPassword}
            className="bg-brand-500 rounded-full py-2"
          >
            {savingPassword ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white text-center">Update Password</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Log Out Button */}
        <TouchableOpacity
          onPress={handleLogout}
          className="bg-red-500 rounded-full py-3 w-full max-w-md mt-8"
        >
          <Text className="text-white text-center font-semibold">Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
