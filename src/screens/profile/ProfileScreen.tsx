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
import { signOut, User, updateEmail, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { auth, db } from '../../firebase/config';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

interface Profile {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  email: string;
}

type Props = { user: User };

export default function ProfileScreen({ user }: Props) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<{ error?: string; message?: string }>({});
  // Profile edit
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dob, setDob] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  // Email
  const [newEmail, setNewEmail] = useState(user.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [savingEmail, setSavingEmail] = useState(false);
  // Password
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    getDoc(doc(db, 'users', user.uid))
      .then((snap) => {
        if (snap.exists()) {
          const d = snap.data() as any;
          setProfile(d);
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
      setProfile({ ...profile, firstName, lastName, dateOfBirth: dob, email: profile?.email } as Profile);
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
        {status.message && (
          <Text className="text-green-600 text-center mb-2">{status.message}</Text>
        )}
        {status.error && (
          <Text className="text-red-500 text-center mb-2">{status.error}</Text>
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
          onPress={() => signOut(auth)}
          className="bg-red-500 rounded-full py-3 w-full max-w-md self-center mb-8"
        >
          <Text className="text-white text-center font-semibold">Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
