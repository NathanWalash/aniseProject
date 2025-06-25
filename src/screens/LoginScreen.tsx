// src/screens/LoginScreen.tsx
import React, { useState } from 'react';
import {
  SafeAreaView,
  TextInput,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase/config';

type Props = {
  onCreateAccount: () => void;
  onForgotPassword: () => void;
};

export default function LoginScreen({
  onCreateAccount,
  onForgotPassword,
}: Props) {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);

  const handleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
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
            Log In
          </Text>

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
            className="border-b border-gray-300 pb-2 mb-6 text-base"
            placeholder="Password"
            placeholderTextColor="#999"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          {error && (
            <Text className="text-red-500 text-center mb-4">{error}</Text>
          )}

          <TouchableOpacity
            onPress={handleLogin}
            disabled={loading}
            className="bg-brand-500 rounded-full py-3 mb-6"
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white text-center font-semibold">
                Log In
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={onForgotPassword}>
            <Text className="text-sm text-gray-600 text-center mb-2">
              Forgot your password?
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onCreateAccount}>
            <Text className="text-sm text-brand-500 text-center">
              Don’t have an account? Sign Up
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}
