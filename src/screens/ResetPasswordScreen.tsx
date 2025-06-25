// src/screens/ResetPasswordScreen.tsx
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
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase/config';

type Props = { onBack: () => void };

export default function ResetPasswordScreen({ onBack }: Props) {
  const [email, setEmail]     = useState('');
  const [error, setError]     = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    setError(null);
    setMessage(null);
    if (!email.trim()) {
      setError('Enter your email.');
      return;
    }
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setMessage('Reset email sent. Check your inbox.');
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
              Reset Password
            </Text>

            {message && (
              <Text className="text-green-600 text-center mb-4">
                {message}
              </Text>
            )}
            {error && (
              <Text className="text-red-500 text-center mb-4">{error}</Text>
            )}

            <TextInput
              className="border-b border-gray-300 pb-2 mb-6 text-base"
              placeholder="Email"
              placeholderTextColor="#999"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />

            <TouchableOpacity
              onPress={handleReset}
              disabled={loading}
              className="bg-brand-500 rounded-full py-3 mb-4"
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white text-center font-semibold">
                  Send Reset Email
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={onBack}>
              <Text className="text-sm text-brand-500 text-center">
                Back to Login
              </Text>
            </TouchableOpacity>
          </View>
      </SafeAreaView>
    </LinearGradient>
  );
}
