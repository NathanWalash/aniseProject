import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../../utils/api';
// TODO: Replace with your actual user fetching logic
async function getCurrentUser() {
  return { displayName: 'Test User', email: 'test@example.com' };
}
// TODO: Replace with your real API utility
const api = {
  post: async (endpoint: string, body: any) => {
    const idToken = await AsyncStorage.getItem('idToken');
    if (!idToken) throw new Error('No auth token found');
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`,
      },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return { data, status: res.status, ok: res.ok };
  },
};

export default function PaymentsLinkFlow() {
  const navigation = useNavigation();
  const route = useRoute();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'start' | 'redirected' | 'confirmed' | 'success'>('start');
  const [flowData, setFlowData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [mandateId, setMandateId] = useState<string | null>(null);
  const [debugResult, setDebugResult] = useState<string | null>(null);

  // Helper to call onLinked callback if provided
  const callOnLinked = () => {
    if (route.params && typeof (route.params as any).onLinked === 'function') {
      (route.params as any).onLinked();
    }
  };

  const startLinkFlow = async () => {
    setLoading(true);
    setError(null);
    try {
      const user = await getCurrentUser();
      const name = user.displayName || user.email || 'User';
      const email = user.email;
      const res = await api.post('/api/start-redirect-flow', { name, email });
      setFlowData(res.data);
      setStep('redirected');
      await Linking.openURL(res.data.redirect_url);
      Alert.alert('Complete the GoCardless form in your browser, then return here to confirm.');
    } catch (err: any) {
      setError(err?.response?.data?.error || err.message || 'Failed to start linking flow');
    } finally {
      setLoading(false);
    }
  };

  const confirmLinkFlow = async () => {
    if (!flowData) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/api/confirm-redirect-flow', {
        redirect_flow_id: flowData.redirect_flow_id,
        session_token: flowData.session_token,
      });
      setMandateId(res.data.mandate_id);
      setStep('success');
      Alert.alert('Success', 'GoCardless account linked!');
      callOnLinked();
    } catch (err: any) {
      setError(err?.response?.data?.error || err.message || 'Failed to confirm linking');
    } finally {
      setLoading(false);
    }
  };

  // Debug/test payment creation
  const createTestPayment = async () => {
    setLoading(true);
    setDebugResult(null);
    try {
      const res = await api.post('/api/create-payment', {
        amount: 1000,
        currency: 'GBP',
        mandate_id: mandateId,
      });
      setDebugResult(`Payment created: ID ${res.data.payment_id}, status ${res.data.status}`);
    } catch (err: any) {
      setDebugResult(err?.response?.data?.error || err.message || 'Failed to create payment');
    } finally {
      setLoading(false);
    }
  };

  const createTestSubscription = async () => {
    setLoading(true);
    setDebugResult(null);
    try {
      const res = await api.post('/api/create-subscription', {
        amount: 500,
        currency: 'GBP',
        mandate_id: mandateId,
        interval_unit: 'monthly',
        interval: 1,
        name: 'Test Subscription',
      });
      setDebugResult(`Subscription created: ID ${res.data.subscription_id}, status ${res.data.status}`);
    } catch (err: any) {
      setDebugResult(err?.response?.data?.error || err.message || 'Failed to create subscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-gray-100 px-4 pt-8">
      <Text className="text-2xl font-bold mb-6">Link GoCardless</Text>
      {error && <Text className="text-red-500 mb-4">{error}</Text>}
      {step === 'start' && (
        <TouchableOpacity
          onPress={startLinkFlow}
          className="bg-brand-500 rounded-full py-3 mb-4"
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="white" /> : <Text className="text-white text-center font-semibold">Start Linking</Text>}
        </TouchableOpacity>
      )}
      {step === 'redirected' && (
        <TouchableOpacity
          onPress={confirmLinkFlow}
          className="bg-green-500 rounded-full py-3 mb-4"
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="white" /> : <Text className="text-white text-center font-semibold">Confirm Linking</Text>}
        </TouchableOpacity>
      )}
      {step === 'success' && (
        <View>
          <Text className="text-green-600 mb-4">✅ GoCardless linked successfully!</Text>
          <Text className="mb-2">Mandate ID: {mandateId}</Text>
          <View className="bg-white rounded-xl p-4 mb-4 w-full max-w-md self-center shadow-card">
            <Text className="font-bold text-lg mb-2">Debug/Test Payments</Text>
            <TouchableOpacity
              onPress={createTestPayment}
              className="bg-brand-500 rounded-full py-3 mb-3"
              disabled={loading}
            >
              <Text className="text-white text-center font-semibold">Create Test Payment (£10)</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={createTestSubscription}
              className="bg-purple-500 rounded-full py-3 mb-3"
              disabled={loading}
            >
              <Text className="text-white text-center font-semibold">Create Test Subscription (£5/mo)</Text>
            </TouchableOpacity>
            {debugResult && <Text className="text-gray-700 mt-2">{debugResult}</Text>}
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate('ProfileMain')}
            className="bg-gray-500 rounded-full py-3"
          >
            <Text className="text-white text-center font-semibold">Return to Profile</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
} 