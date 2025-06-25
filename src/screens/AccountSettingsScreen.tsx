// src/screens/AccountSettingsScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  TextInput,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  updateEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  User,
} from 'firebase/auth';
import { auth, db } from '../firebase/config';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

type Props = { user: User; onDone: () => void };

export default function AccountSettingsScreen({ user, onDone }: Props) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName]   = useState('');
  const [dob, setDob]             = useState('');
  const [newEmail, setNewEmail]         = useState(user.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword]   = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading]         = useState(true);
  const [status, setStatus]           = useState<{ error?: string; message?: string }>({});
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingEmail, setSavingEmail]     = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    getDoc(doc(db, 'users', user.uid))
      .then((snap) => {
        if (snap.exists()) {
          const d = snap.data() as any;
          setFirstName(d.firstName || '');
          setLastName(d.lastName || '');
          setDob(d.dateOfBirth || '');
        }
      })
      .finally(() => setLoading(false));
  }, [user.uid]);

  const reauth = () => {
    const cred = EmailAuthProvider.credential(user.email || '', currentPassword);
    return reauthenticateWithCredential(user, cred);
  };

  const saveProfile = async () => {
    setStatus({});
    if (!firstName || !lastName || !dob) {
      setStatus({ error: 'All fields required.' });
      return;
    }
    setSavingProfile(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), { firstName, lastName, dateOfBirth: dob });
      setStatus({ message: 'Profile updated.' });
    } catch (err) {
      setStatus({ error: (err as Error).message });
    } finally {
      setSavingProfile(false);
    }
  };

  const saveEmail = async () => {
    setStatus({});
    if (!newEmail.trim() || !currentPassword) {
      setStatus({ error: 'Email + current password required.' });
      return;
    }
    setSavingEmail(true);
    try {
      await reauth();
      await updateEmail(user, newEmail.trim());
      setStatus({ message: 'Email updated. Log back in.' });
      onDone();
    } catch (err) {
      setStatus({ error: (err as Error).message });
    } finally {
      setSavingEmail(false);
    }
  };

  const savePassword = async () => {
    setStatus({});
    if (newPassword !== confirmPassword || !currentPassword) {
      setStatus({ error: 'Passwords must match + current password.' });
      return;
    }
    setSavingPassword(true);
    try {
      await reauth();
      await updatePassword(user, newPassword);
      setStatus({ message: 'Password updated.' });
    } catch (err) {
      setStatus({ error: (err as Error).message });
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return (
      <LinearGradient style={{ flex: 1 }} colors={['#7B68EE', '#004ba0']}>
        <SafeAreaView className="flex-1 justify-center items-center bg-transparent px-4">
          <ActivityIndicator color="#fff" size="large" />
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient style={{ flex: 1 }} colors={['#7B68EE', '#004ba0']}>
      <SafeAreaView className="flex-1 justify-center items-center bg-transparent px-4">
          <View className="bg-white rounded-2xl p-6 w-11/12 max-w-md self-center shadow-card">
            <Text className="text-2xl font-bold text-center text-brand-500 mb-4">
              Account Settings
            </Text>
            {status.message && (
              <Text className="text-green-600 text-center mb-2">{status.message}</Text>
            )}
            {status.error && (
              <Text className="text-red-500 text-center mb-2">{status.error}</Text>
            )}

            {/* Profile */}
            <Text className="font-semibold mt-4 mb-2">Edit Profile</Text>
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
              className="bg-brand-500 rounded-full py-2 mb-5"
            >
              {savingProfile ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white text-center">Save Profile</Text>
              )}
            </TouchableOpacity>

            {/* Change Email */}
            <Text className="font-semibold mt-4 mb-2">Change Email</Text>
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
              className="bg-brand-500 rounded-full py-2 mb-5"
            >
              {savingEmail ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white text-center">Update Email</Text>
              )}
            </TouchableOpacity>

            {/* Change Password */}
            <Text className="font-semibold mt-4 mb-2">Change Password</Text>
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
              className="bg-brand-500 rounded-full py-2 mb-6"
            >
              {savingPassword ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white text-center">Update Password</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={onDone} className="mb-2">
              <Text className="text-sm text-gray-600 text-center">Done</Text>
            </TouchableOpacity>
          </View>
      </SafeAreaView>
    </LinearGradient>
  );
}
