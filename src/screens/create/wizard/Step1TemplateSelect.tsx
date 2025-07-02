import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import type { Template } from './CreateWizard';
import allTemplates from '../../../templates/anise';

type Props = {
  onSelect: (template: Template) => void;
  step?: number;
  selectedTemplate: Template | null;
  setSelectedTemplate: (t: Template | null) => void;
};

export default function Step1TemplateSelect({ onSelect, selectedTemplate, setSelectedTemplate }: Props) {
  const [query, setQuery] = useState('');
  const filtered = allTemplates.filter(t =>
    t.templateName.toLowerCase().includes(query.toLowerCase()) ||
    t.templateDescription.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <>
      <TextInput
        placeholder="Search for template"
        value={query}
        onChangeText={setQuery}
        className="border border-gray-300 rounded px-3 py-2 mb-4"
      />
      {filtered.map(t => (
        <TouchableOpacity
          key={t.templateId}
          className={`bg-gray-100 rounded-xl p-4 mb-4 ${selectedTemplate?.templateId === t.templateId ? 'border-2 border-blue-500' : ''}`}
          onPress={() => setSelectedTemplate(t)}
        >
          <Text className="text-lg font-semibold mb-1">{t.templateName}</Text>
          <Text className="text-gray-600">{t.templateDescription}</Text>
        </TouchableOpacity>
      ))}
      {filtered.length === 0 && (
        <Text className="text-gray-400 text-center mt-8">No templates found.</Text>
      )}
    </>
  );
} 