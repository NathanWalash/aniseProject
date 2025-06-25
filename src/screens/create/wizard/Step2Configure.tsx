import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import type { Template } from './CreateWizard';

type Props = {
  template: Template;
  onNext: (config: Record<string, any>) => void;
  onBack: () => void;
  step?: number;
};

export default function Step2Configure({ template, onNext, onBack }: Props) {
  const [config, setConfig] = useState<Record<string, any>>({});

  const handleChange = (key: string, value: string) => {
    setConfig(c => ({ ...c, [key]: value }));
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text className="text-2xl font-bold mb-4">Configure Your Anise</Text>
        {template.initParamsSchema.map((param, idx) => {
          const key = Object.keys(param)[0];
          return (
            <View key={key} className="mb-4">
              <Text className="font-semibold mb-1">{key}</Text>
              <TextInput
                className="border border-gray-300 rounded px-3 py-2"
                placeholder={`Enter ${key}`}
                value={config[key] || ''}
                onChangeText={v => handleChange(key, v)}
              />
            </View>
          );
        })}
        <View className="flex-row justify-between mt-8">
          <TouchableOpacity onPress={onBack} className="bg-gray-300 rounded px-4 py-2">
            <Text>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onNext(config)} className="bg-brand-500 rounded px-4 py-2">
            <Text className="text-white">Next Step</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
} 