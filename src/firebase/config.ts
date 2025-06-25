// src/firebase/config.ts
import { initializeApp } from 'firebase/app';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { getFirestore } from 'firebase/firestore';

const {
  firebaseApiKey,
  firebaseAuthDomain,
  firebaseProjectId,
  firebaseStorageBucket,
  firebaseMessagingSenderId,
  firebaseAppId,
  walletConnectProjectId,  // if you’ve added this to extra
} = (Constants.expoConfig?.extra ?? {}) as Record<string, string>;

const firebaseConfig = {
  apiKey: firebaseApiKey,
  authDomain: firebaseAuthDomain,
  projectId: firebaseProjectId,
  storageBucket: firebaseStorageBucket,
  messagingSenderId: firebaseMessagingSenderId,
  appId: firebaseAppId,
};

const app = initializeApp(firebaseConfig);

// -- Auth setup with conditional persistence ----------------
let auth;
if (Platform.OS === 'web') {
  // On web, use the default getAuth
  // (no React Native AsyncStorage persistence)
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { getAuth } = require('firebase/auth');
  auth = getAuth(app);
} else {
  // On native, use initializeAuth + AsyncStorage persistence
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { initializeAuth, getReactNativePersistence } = require('firebase/auth');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const AsyncStorage = require('@react-native-async-storage/async-storage').default;
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
}

// -- Firestore setup -----------------------------------------
export const db = getFirestore(app);

// -- Export auth ----------------------------------------------
export { auth };
