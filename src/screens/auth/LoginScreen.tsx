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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../../utils/api';

type Props = {
  onCreateAccount: () => void;
  onForgotPassword: () => void;
  onLoginSuccess?: () => void;
};

export default function LoginScreen({
  onCreateAccount,
  onForgotPassword,
  onLoginSuccess,
}: Props) {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);

  const handleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      await AsyncStorage.setItem('idToken', data.idToken);
      await AsyncStorage.setItem('refreshToken', data.refreshToken);
      if (onLoginSuccess) onLoginSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      style={{ flex: 1 }}
      colors={['#1A0C27', '#1A0C77']}
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
            style={{ backgroundColor: '#7B68EE', borderRadius: 24, paddingVertical: 12, marginBottom: 24 }}
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
            <Text style={{ fontSize: 14, color: '#7B68EE', textAlign: 'center' }}>
              Don't have an account? Sign Up
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}
