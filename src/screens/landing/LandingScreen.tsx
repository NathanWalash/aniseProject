// src/screens/LandingScreen.tsx
import React from 'react';
import { SafeAreaView, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

type Props = {
  onLogin: () => void;
  onCreateAccount: () => void;
};

export default function LandingScreen({ onLogin, onCreateAccount }: Props) {
  return (
    <LinearGradient
      style={{ flex: 1 }}
      colors={['#7B68EE', '#004ba0']}
      start={[0, 0]}
      end={[1, 1]}
    >
      <SafeAreaView className="flex-1 justify-center items-center bg-transparent px-4">
        <View className="bg-white rounded-2xl p-8 w-11/12 max-w-md self-center shadow-card">
          <Text className="text-3xl font-bold text-center text-brand-500 mb-6">
            WELCOME
          </Text>

          <TouchableOpacity
            onPress={onLogin}
            className="bg-brand-500 rounded-full py-3 mb-4"
          >
            <Text className="text-white text-center font-semibold">Log In</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onCreateAccount}
            className="border border-brand-500 rounded-full py-3"
          >
            <Text className="text-brand-500 text-center font-semibold">
              Create Account
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}
