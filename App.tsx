// App.tsx
import React, { useEffect, useState } from 'react';
import "./global.css";
import { SafeAreaView, Text, StyleSheet } from 'react-native';
import { auth } from './src/firebase/config';
import { onAuthStateChanged, User } from 'firebase/auth';
import LandingScreen from './src/screens/landing/LandingScreen';
import LoginScreen from './src/screens/auth/LoginScreen';
import SignupScreen from './src/screens/auth/SignupScreen';
import ResetPasswordScreen from './src/screens/auth/ResetPasswordScreen';
import Navigation from './src/Navigation';
import WelcomeSplashScreens from './src/screens/landing/WelcomeSplashScreens';

export default function App() {
  const [user, setUser]         = useState<User | null>(null);
  const [initializing, setInit] = useState(true);
  const [mode, setMode]         = useState<
    'landing' | 'login' | 'signup' | 'reset'
  >('landing');
  const [showWelcome, setShowWelcome] = useState(true);

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

  if (!user && showWelcome) {
    return <WelcomeSplashScreens onDone={() => setShowWelcome(false)} />;
  }

  if (user) {
    return <Navigation user={user} />;
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
