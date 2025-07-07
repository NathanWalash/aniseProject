import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';

export default function SumsubKYC({ userId }: { userId: string }) {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Fetch token from your backend (mock for now)
    fetch('http://localhost:3001/api/sumsub/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    })
      .then(res => res.json())
      .then(data => setToken(data.token));
  }, [userId]);

  if (!token) return <ActivityIndicator style={{ flex: 1 }} />;

  // Placeholder for the Sumsub WebSDK URL
  const sumsubUrl = `https://websdk.sumsub.com/?accessToken=${token}`;

  return (
    <WebView
      source={{ uri: sumsubUrl }}
      style={{ flex: 1 }}
      javaScriptEnabled
      domStorageEnabled
      originWhitelist={['*']}
    />
  );
} 