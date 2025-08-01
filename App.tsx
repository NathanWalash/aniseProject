// App.tsx
import React, { useEffect, useState } from 'react';
import "./global.css";
import { SafeAreaView, Text, StyleSheet, View, ActivityIndicator, TouchableOpacity } from 'react-native';
import LoginScreen from './src/screens/auth/LoginScreen';
import SignupScreen from './src/screens/auth/SignupScreen';
import ResetPasswordScreen from './src/screens/auth/ResetPasswordScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LandingScreen from './src/screens/landing/LandingScreen';
import Navigation from './src/Navigation';
import WelcomeSplashScreens from './src/screens/landing/WelcomeSplashScreens';
import { jwtDecode } from 'jwt-decode';
import { API_BASE_URL } from './src/utils/api';
import { FIREBASE_API_KEY } from './src/utils/firebase';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { walletConnectService } from './wallet/walletConnectInstance';

// One-time helpful log for API_BASE_URL
console.log('[INFO] API_BASE_URL is set to:', API_BASE_URL);
console.log('[INFO] If you have network issues, make sure API_BASE_URL in src/utils/api.ts matches your backend/ngrok URL.');

// Utility to check if a JWT is expired
function isTokenExpired(token: string): boolean {
  try {
    const decoded: any = jwtDecode(token);
    if (!decoded.exp) return true;
    return Date.now() >= decoded.exp * 1000;
  } catch {
    return true;
  }
}

// Utility to refresh idToken using Firebase REST API
async function refreshIdToken(refreshToken: string): Promise<string | null> {
  try {
    const apiKey = FIREBASE_API_KEY;
    if (!apiKey) return null;
    const res = await fetch(`https://securetoken.googleapis.com/v1/token?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `grant_type=refresh_token&refresh_token=${refreshToken}`,
    });
    const data = await res.json();
    if (!res.ok) return null;
    await AsyncStorage.setItem('idToken', data.id_token);
    await AsyncStorage.setItem('refreshToken', data.refresh_token);
    return data.id_token;
  } catch {
    return null;
  }
}

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [screen, setScreen] = useState<'login' | 'signup' | 'reset' | undefined>(undefined);
  const [showWelcome, setShowWelcome] = useState(true); // Always true for debugging
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);

  // Initialize WalletConnect globally on app load
  useEffect(() => {
    walletConnectService.init();
  }, []);

  // Fetch the full Firestore user profile
  const fetchUserProfile = async () => {
    const idToken = await AsyncStorage.getItem('idToken');
    if (!idToken) return null;
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  };

  useEffect(() => {
    setShowWelcome(true); // Force show welcome splash screens on every mount
    const checkToken = async () => {
      let token = await AsyncStorage.getItem('idToken');
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      if (token && isTokenExpired(token) && refreshToken) {
        token = await refreshIdToken(refreshToken);
      }
      if (token) {
        const profile = await fetchUserProfile();
        setUser(profile);
      } else {
        setUser(null);
      }
      setLoading(false);
    };
    checkToken();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('idToken');
    await AsyncStorage.removeItem('refreshToken');
    setUser(null);
    setScreen('login');
  };

  const handleLoginSuccess = async () => {
    const profile = await fetchUserProfile();
    setUser(profile);
  };

  const handleSignupSuccess = async () => {
    const profile = await fetchUserProfile();
    setUser(profile);
  };

  const handleResetSuccess = (msg: string) => {
    setResetSuccess(msg);
    setScreen('login');
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!user) {
    if (showWelcome) {
      return <WelcomeSplashScreens onDone={() => { setShowWelcome(false); setScreen(undefined); }} />;
    }
    if (screen === undefined) {
    return (
      <LandingScreen
          onLogin={() => setScreen('login')}
          onCreateAccount={() => setScreen('signup')}
      />
    );
  }
    if (screen === 'signup') {
      return <SignupScreen onLogin={() => setScreen('login')} onSignupSuccess={() => setScreen('login')} />;
    }
    if (screen === 'reset') {
      return <ResetPasswordScreen onBack={() => setScreen('login')} onResetSuccess={handleResetSuccess} />;
    }
    if (screen === 'login') {
    return (
        <>
          <LoginScreen onCreateAccount={() => setScreen('signup')} onForgotPassword={() => setScreen('reset')} onLoginSuccess={handleLoginSuccess} />
          {resetSuccess && <Text style={{ color: 'green', textAlign: 'center', marginTop: 16 }}>{resetSuccess}</Text>}
        </>
      );
    }
  }

  // After login/signup, show the main app navigation
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Navigation user={user} onLogout={handleLogout} />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
