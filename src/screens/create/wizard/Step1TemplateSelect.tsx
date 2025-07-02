import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, LayoutAnimation } from 'react-native';
import type { Template } from './CreateWizard';
import allTemplates from '../../../templates/anise';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

type Props = {
  onSelect: (template: Template) => void;
  step?: number;
  selectedTemplate: Template | null;
  setSelectedTemplate: (t: Template | null) => void;
};

export default function Step1TemplateSelect({ onSelect, selectedTemplate, setSelectedTemplate }: Props) {
  const [query, setQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const navigation = useNavigation() as any;
  const filtered = allTemplates.filter(t =>
    t.templateName.toLowerCase().includes(query.toLowerCase()) ||
    t.templateDescription.toLowerCase().includes(query.toLowerCase())
  );

  const handleExpand = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <>
      <TextInput
        placeholder="Search for template"
        value={query}
        onChangeText={setQuery}
        className="border border-gray-300 rounded px-3 py-2 mb-4"
        placeholderTextColor="#444"
      />
      {filtered.map(t => {
        const template: Template = {
          ...t,
          initParamsSchema: [], // fallback since JSONs do not include this
        };
        const isExpanded = expandedId === template.templateId;
        return (
          <View
            key={template.templateId}
            style={{ marginBottom: 16, borderRadius: 16, backgroundColor: '#f3f4f6', borderWidth: selectedTemplate?.templateId === template.templateId ? 2 : 0, borderColor: selectedTemplate?.templateId === template.templateId ? '#2563eb' : undefined }}
          >
            <TouchableOpacity
              style={{ padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
              onPress={() => setSelectedTemplate(template)}
              activeOpacity={0.85}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 2 }}>{template.templateName}</Text>
                <Text style={{ color: '#555', marginBottom: 2 }} numberOfLines={isExpanded ? undefined : 2}>{template.templateDescription}</Text>
              </View>
              <TouchableOpacity
                onPress={() => handleExpand(template.templateId)}
                style={{ marginLeft: 12, padding: 4 }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Icon name={isExpanded ? 'chevron-up-outline' : 'chevron-down-outline'} size={24} color="#2563eb" />
              </TouchableOpacity>
            </TouchableOpacity>
            {isExpanded && (
              <View style={{ paddingHorizontal: 16, paddingBottom: 12 }}>
                <Text style={{ fontWeight: 'bold', marginTop: 8, marginBottom: 4 }}>Modules:</Text>
                {template.modules.map(m => (
                  <Text key={m} style={{ color: '#444', marginLeft: 8 }}>• {m}</Text>
                ))}
                <TouchableOpacity
                  style={{ marginTop: 12, alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', opacity: 0.8 }}
                  onPress={() => navigation.navigate('Explore')}
                >
                  <Icon name="search-outline" size={18} color="#2563eb" style={{ marginRight: 4 }} />
                  <Text style={{ color: '#2563eb', fontSize: 15, textDecorationLine: 'underline' }}>See Example Groups</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        );
      })}
      {filtered.length === 0 && (
        <Text className="text-gray-400 text-center mt-8">No templates found.</Text>
      )}
    </>
  );
} 