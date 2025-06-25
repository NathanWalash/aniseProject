import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';

type Props = { onDone: () => void };

const splashData = [
  { title: 'Welcome to Create!', desc: 'This is the first splash screen.' },
  { title: 'Templates', desc: 'Browse and select a template to start.' },
  { title: 'Configure', desc: 'Customize your anise before deploying.' },
];

export default function CreateSplashScreens({ onDone }: Props) {
  const [idx, setIdx] = useState(0);
  const isLast = idx === splashData.length - 1;

  return (
    <SafeAreaView className="flex-1 bg-white justify-center items-center px-6">
      <View className="flex-1 justify-center items-center w-full">
        <Text className="text-3xl font-bold mb-4">{splashData[idx].title}</Text>
        <Text className="text-lg text-gray-600 mb-8 text-center">{splashData[idx].desc}</Text>
      </View>
      <View className="flex-row justify-between w-full mb-8">
        <TouchableOpacity onPress={onDone} className="px-4 py-2 rounded bg-gray-300">
          <Text>Skip</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => (isLast ? onDone() : setIdx(i => i + 1))}
          className="px-4 py-2 rounded bg-brand-500"
        >
          <Text className="text-white">{isLast ? 'Start' : 'Next'}</Text>
        </TouchableOpacity>
      </View>
      <View className="flex-row justify-center mb-4">
        {splashData.map((_, i) => (
          <View key={i} className={`w-2 h-2 rounded-full mx-1 ${i === idx ? 'bg-brand-500' : 'bg-gray-300'}`} />
        ))}
      </View>
    </SafeAreaView>
  );
} 