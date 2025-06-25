import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import type { Template } from './CreateWizard';

const allTemplates: Template[] = require('../../../templates/aniseTemplates.json');

type Props = { onSelect: (template: Template) => void; step?: number };

export default function Step1TemplateSelect({ onSelect, step = 1 }: Props) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Template | null>(null);
  const filtered = allTemplates.filter(t =>
    t.templateName.toLowerCase().includes(query.toLowerCase()) ||
    t.templateDescription.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
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
              className={`bg-gray-100 rounded-xl p-4 mb-4 ${selected?.templateId === t.templateId ? 'border-2 border-blue-500' : ''}`}
              onPress={() => setSelected(t)}
            >
              <Text className="text-lg font-semibold mb-1">{t.templateName}</Text>
              <Text className="text-gray-600">{t.templateDescription}</Text>
            </TouchableOpacity>
          ))}
          {filtered.length === 0 && (
            <Text className="text-gray-400 text-center mt-8">No templates found.</Text>
          )}
        </ScrollView>
        {/* Progress and Next Button */}
        <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, paddingBottom: 24, paddingHorizontal: 16, backgroundColor: '#fff' }}>
          <View style={{ alignItems: 'center', marginBottom: 8 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 4 }}>
              {[0, 1, 2].map(i => (
                <View key={i} style={{ width: 8, height: 8, borderRadius: 4, marginHorizontal: 4, backgroundColor: i === 0 ? '#2563eb' : '#d1d5db' }} />
              ))}
            </View>
            <Text style={{ color: '#6b7280', fontSize: 12 }}>Step 1 of 3</Text>
          </View>
          <TouchableOpacity
            style={{ width: '100%', paddingVertical: 14, borderRadius: 8, backgroundColor: selected ? '#2563eb' : '#d1d5db' }}
            disabled={!selected}
            onPress={() => selected && onSelect(selected)}
          >
            <Text style={{ color: '#fff', textAlign: 'center', fontWeight: 'bold', fontSize: 16 }}>Next Step</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
} 