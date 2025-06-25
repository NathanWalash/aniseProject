// src/screens/SignupScreen.tsx
import React, { useState } from 'react';
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
import { auth, db } from '../firebase/config';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

type Props = { onLogin: () => void };

export default function SignupScreen({ onLogin }: Props) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName]   = useState('');
  const [dob, setDob]             = useState('');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [confirm, setConfirm]     = useState('');
  const [error, setError]         = useState<string | null>(null);
  const [loading, setLoading]     = useState(false);

  const handleSignup = async () => {
    setError(null);
    if (password !== confirm) {
      setError('Passwords must match.');
      return;
    }
    if (!firstName || !lastName || !dob) {
      setError('Fill out all fields.');
      return;
    }
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );
      await setDoc(doc(db, 'users', cred.user.uid), {
        firstName,
        lastName,
        dateOfBirth: dob,
        email: cred.user.email,
        createdAt: Date.now(),
      });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      style={{ flex: 1 }}
      colors={['#7B68EE', '#004ba0']}
      start={[0, 0]}
      end={[1, 1]}
    >
      <SafeAreaView className="flex-1 justify-center items-center bg-transparent px-4">
          <View className="bg-white rounded-2xl p-8 w-11/12 max-w-md self-center shadow-card">
            <Text className="text-2xl font-bold text-center text-brand-500 mb-6">
              Create Account
            </Text>

            <TextInput
              className="border-b border-gray-300 pb-2 mb-4 text-base"
              placeholder="First Name"
              placeholderTextColor="#999"
              value={firstName}
              onChangeText={setFirstName}
            />
            <TextInput
              className="border-b border-gray-300 pb-2 mb-4 text-base"
              placeholder="Last Name"
              placeholderTextColor="#999"
              value={lastName}
              onChangeText={setLastName}
            />
            <TextInput
              className="border-b border-gray-300 pb-2 mb-4 text-base"
              placeholder="Date of Birth (YYYY-MM-DD)"
              placeholderTextColor="#999"
              value={dob}
              onChangeText={setDob}
            />
            <TextInput
              className="border-b border-gray-300 pb-2 mb-4 text-base"
              placeholder="Email"
              placeholderTextColor="#999"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
            <TextInput
              className="border-b border-gray-300 pb-2 mb-4 text-base"
              placeholder="Password"
              placeholderTextColor="#999"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
            <TextInput
              className="border-b border-gray-300 pb-2 mb-6 text-base"
              placeholder="Confirm Password"
              placeholderTextColor="#999"
              secureTextEntry
              value={confirm}
              onChangeText={setConfirm}
            />

            {error && (
              <Text className="text-red-500 text-center mb-4">{error}</Text>
            )}

            <TouchableOpacity
              onPress={handleSignup}
              disabled={loading}
              className="bg-brand-500 rounded-full py-3 mb-6"
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white text-center font-semibold">
                  Sign Up
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={onLogin}>
              <Text className="text-sm text-brand-500 text-center">
                Already have an account? Log In
              </Text>
            </TouchableOpacity>
          </View>
      </SafeAreaView>
    </LinearGradient>
  );
}
