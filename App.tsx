// App.tsx
import React, { useEffect, useState } from 'react';
import "./global.css";
import { SafeAreaView, Text, StyleSheet } from 'react-native';
import { auth } from './src/firebase/config';
import { onAuthStateChanged, User } from 'firebase/auth';
import LandingScreen from './src/screens/LandingScreen';
import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import ResetPasswordScreen from './src/screens/ResetPasswordScreen';
import HomeScreen from './src/screens/HomeScreen';

export default function App() {
  const [user, setUser]         = useState<User | null>(null);
  const [initializing, setInit] = useState(true);
  const [mode, setMode]         = useState<
    'landing' | 'login' | 'signup' | 'reset'
  >('landing');

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, usr => {
      setUser(usr);
      if (initializing) setInit(false);
    });
    return unsub;
  }, [initializing]);

  if (initializing) {
    return (
      <SafeAreaView style={styles.center}>
        <Text>Loading…</Text>
      </SafeAreaView>
    );
  }

  if (user) {
    return <HomeScreen user={user} />;
  }

  if (mode === 'landing') {
    return (
      <LandingScreen
        onLogin={() => setMode('login')}
        onCreateAccount={() => setMode('signup')}
      />
    );
  }

  if (mode === 'login') {
    return (
      <LoginScreen
        onCreateAccount={() => setMode('signup')}
        onForgotPassword={() => setMode('reset')}
      />
    );
  }

  if (mode === 'signup') {
    return <SignupScreen onLogin={() => setMode('login')} />;
  }

  // mode === 'reset'
  return <ResetPasswordScreen onBack={() => setMode('login')} />;
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
