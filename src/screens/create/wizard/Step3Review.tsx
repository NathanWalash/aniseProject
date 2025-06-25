import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import type { Template } from './CreateWizard';

type Props = {
  template: Template;
  config: Record<string, any>;
  onBack: () => void;
  onReset: () => void;
  step?: number;
};

export default function Step3Review({ template, config, onBack, onReset }: Props) {
  const [agreed, setAgreed] = useState(false);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text className="text-2xl font-bold mb-4">Review Your Anise</Text>
        <View className="mb-4">
          <Text className="font-semibold">Template:</Text>
          <Text>{template.templateName}</Text>
          <Text className="text-gray-600 mb-2">{template.templateDescription}</Text>
        </View>
        <View className="mb-4">
          <Text className="font-semibold mb-2">Configuration:</Text>
          {Object.entries(config).map(([key, value]) => (
            <Text key={key} className="mb-1">{key}: {value}</Text>
          ))}
        </View>
        <View className="flex-row items-center mb-4">
          <TouchableOpacity
            onPress={() => setAgreed(a => !a)}
            className={`w-5 h-5 border rounded mr-2 ${agreed ? 'bg-brand-500' : 'bg-white'}`}
          />
          <Text>I agree to the Anise platform Terms of Service and Privacy Policy</Text>
        </View>
        <View className="flex-row justify-between">
          <TouchableOpacity onPress={onBack} className="bg-gray-300 rounded px-4 py-2">
            <Text>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onReset}
            className={`rounded px-4 py-2 ${agreed ? 'bg-brand-500' : 'bg-gray-300'}`}
            disabled={!agreed}
          >
            <Text className="text-white">Deploy</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
} 