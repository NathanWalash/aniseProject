import React from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import type { Template } from './CreateWizard';

type Props = {
  template: Template;
  config: Record<string, any>;
  setConfig: (c: Record<string, any>) => void;
  onNext: (config: Record<string, any>) => void;
  onBack: () => void;
  step?: number;
};

export default function Step2Configure({ template, config, setConfig, onNext, onBack, step = 2 }: Props) {
  const handleChange = (key: string, value: string) => {
    setConfig({ ...config, [key]: value });
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
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
        </ScrollView>
        {/* Progress and Buttons */}
        <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, paddingBottom: 24, paddingHorizontal: 16, backgroundColor: '#fff' }}>
          <View style={{ alignItems: 'center', marginBottom: 8 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 4 }}>
              {[0, 1, 2].map(i => (
                <View key={i} style={{ width: 8, height: 8, borderRadius: 4, marginHorizontal: 4, backgroundColor: i === 1 ? '#2563eb' : '#d1d5db' }} />
              ))}
            </View>
            <Text style={{ color: '#6b7280', fontSize: 12 }}>Step 2 of 3</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <TouchableOpacity
              style={{ flex: 1, marginRight: 8, backgroundColor: '#d1d5db', borderRadius: 8, paddingVertical: 14 }}
              onPress={onBack}
            >
              <Text style={{ textAlign: 'center', fontWeight: 'bold', fontSize: 16 }}>Previous Step</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ flex: 1, marginLeft: 8, backgroundColor: '#2563eb', borderRadius: 8, paddingVertical: 14 }}
              onPress={() => onNext(config)}
            >
              <Text style={{ textAlign: 'center', fontWeight: 'bold', fontSize: 16, color: '#fff' }}>Next Step</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
} 