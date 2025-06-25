import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import type { Template } from './CreateWizard';

type Props = { onSelect: (template: Template) => void; step?: number };

const mockTemplates: Template[] = [
  {
    templateName: 'Claims DAO',
    templateDescription: 'A DAO with membership and claim voting',
    modules: ['MemberModule', 'ClaimVotingModule'],
    initParamsSchema: [
      { admin: 'address' },
      { quorum: 'uint256' },
    ],
    templateId: 'claims-voting-v1',
  },
  {
    templateName: 'P2P Insurance',
    templateDescription: 'Peer-to-peer insurance pool',
    modules: ['InsuranceModule'],
    initParamsSchema: [
      { admin: 'address' },
      { premium: 'uint256' },
    ],
    templateId: 'p2p-insurance-v1',
  },
];

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