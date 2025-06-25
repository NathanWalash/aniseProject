import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import type { Template } from './CreateWizard';

const mockTemplates: Template[] = require('../../../templates/aniseTemplates.json');

type Props = { onSelect: (template: Template) => void; step?: number };

export default function Step1TemplateSelect({ onSelect }: Props) {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text className="text-2xl font-bold mb-4">Choose Your Anise Template</Text>
        {mockTemplates.map(t => (
          <TouchableOpacity
            key={t.templateId}
            className="bg-gray-100 rounded-xl p-4 mb-4"
            onPress={() => onSelect(t)}
          >
            <Text className="text-lg font-semibold mb-1">{t.templateName}</Text>
            <Text className="text-gray-600">{t.templateDescription}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
} 