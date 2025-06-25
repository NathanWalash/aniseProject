import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import type { Template } from './CreateWizard';

const allTemplates: Template[] = require('../../../templates/aniseTemplates.json');

type Props = { onSelect: (template: Template) => void; step?: number };

export default function Step1TemplateSelect({ onSelect }: Props) {
  const [query, setQuery] = useState('');
  const filtered = allTemplates.filter(t =>
    t.templateName.toLowerCase().includes(query.toLowerCase()) ||
    t.templateDescription.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <TextInput
          placeholder="Search for template"
          value={query}
          onChangeText={setQuery}
          className="border border-gray-300 rounded px-3 py-2 mb-4"
        />
        <Text className="text-2xl font-bold mb-4">Choose Your Anise Template</Text>
        {filtered.map(t => (
          <TouchableOpacity
            key={t.templateId}
            className="bg-gray-100 rounded-xl p-4 mb-4"
            onPress={() => onSelect(t)}
          >
            <Text className="text-lg font-semibold mb-1">{t.templateName}</Text>
            <Text className="text-gray-600">{t.templateDescription}</Text>
          </TouchableOpacity>
        ))}
        {filtered.length === 0 && (
          <Text className="text-gray-400 text-center mt-8">No templates found.</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
} 