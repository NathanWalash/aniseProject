import React from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, ScrollView, Switch } from 'react-native';
import Slider from '@react-native-community/slider';
import modules from '../../../templates/modules';
import type { Template } from './CreateWizard';

const baseParams = [
  { name: 'daoName', label: 'DAO Name', widget: 'text' },
  { name: 'daoBrief', label: 'Brief Description', widget: 'text' },
  { name: 'daoMandate', label: 'Mandate', widget: 'textarea' },
  { name: 'isPublic', label: 'Public DAO?', widget: 'switch' },
];

type Props = {
  template: Template;
  config: Record<string, any>;
  setConfig: (cfg: Record<string, any>) => void;
  onNext: (cfg: Record<string, any>) => void;
  onBack: () => void;
  step: number;
};

export default function Step2Configure({ template, config, setConfig, onNext, onBack, step }: Props) {
  // Aggregate all initParamsSchema from the template's modules
  const paramSchemas = template.modules.flatMap((moduleName) => {
    const mod = modules[moduleName];
    return mod ? mod.initParamsSchema : [];
  });

  // Render base fields
  const renderBaseField = (param: any) => {
    switch (param.widget) {
      case 'textarea':
        return (
          <View key={param.name} style={{ marginBottom: 16 }}>
            <Text>{param.label}</Text>
            <TextInput
              multiline
              numberOfLines={4}
              value={config[param.name] ?? ''}
              onChangeText={text => setConfig({ ...config, [param.name]: text })}
              style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 4, padding: 8, minHeight: 80 }}
            />
          </View>
        );
      case 'switch':
        return (
          <View key={param.name} style={{ marginBottom: 16, flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ marginRight: 12 }}>{param.label}</Text>
            <Switch
              value={!!config[param.name]}
              onValueChange={value => setConfig({ ...config, [param.name]: value })}
            />
            <Text style={{ marginLeft: 8 }}>{config[param.name] ? 'Public' : 'Private'}</Text>
          </View>
        );
      case 'text':
      default:
        return (
          <View key={param.name} style={{ marginBottom: 16 }}>
            <Text>{param.label}</Text>
            <TextInput
              value={config[param.name] ?? ''}
              onChangeText={text => setConfig({ ...config, [param.name]: text })}
              style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 4, padding: 8 }}
            />
          </View>
        );
    }
  };

  // Render module-driven fields
  const renderField = (param: any) => {
    switch (param.widget) {
      case 'slider':
        return (
          <View key={param.name} style={{ marginBottom: 16 }}>
            <Text>{param.label}</Text>
            <Slider
              minimumValue={param.min}
              maximumValue={param.max}
              value={config[param.name] ?? param.default}
              onValueChange={(value: number) => setConfig({ ...config, [param.name]: value })}
              step={1}
            />
            <Text>{config[param.name] ?? param.default}</Text>
          </View>
        );
      case 'number':
        return (
          <View key={param.name} style={{ marginBottom: 16 }}>
            <Text>{param.label}</Text>
            <TextInput
              keyboardType="numeric"
              value={String(config[param.name] ?? param.default)}
              onChangeText={text => setConfig({ ...config, [param.name]: Number(text) })}
              style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 4, padding: 8 }}
            />
          </View>
        );
      case 'text':
      default:
        return (
          <View key={param.name} style={{ marginBottom: 16 }}>
            <Text>{param.label}</Text>
            <TextInput
              value={config[param.name] ?? ''}
              onChangeText={text => setConfig({ ...config, [param.name]: text })}
              style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 4, padding: 8 }}
            />
          </View>
        );
    }
  };

  // All base fields must be filled
  const allBaseFilled = baseParams.every(param => {
    if (param.widget === 'switch') return true; // switch always has a value
    return config[param.name] && config[param.name].trim() !== '';
  });
  // All module fields must be filled
  const allModuleFilled = paramSchemas.every(param => {
    const key = param.name;
    return config[key] !== undefined && config[key] !== '';
  });
  const allFilled = allBaseFilled && allModuleFilled;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
          <Text className="text-2xl font-bold mb-4">Configure Your Anise</Text>
          {/* Render base parameters first */}
          {baseParams.map(renderBaseField)}
          {/* Then render module-driven parameters */}
          {paramSchemas.length > 0 && <Text style={{ fontWeight: 'bold', marginTop: 16, marginBottom: 8 }}>Module Parameters</Text>}
          {paramSchemas.map(renderField)}
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
              style={{ flex: 1, marginLeft: 8, backgroundColor: allFilled ? '#2563eb' : '#d1d5db', borderRadius: 8, paddingVertical: 14 }}
              onPress={() => onNext(config)}
              disabled={!allFilled}
            >
              <Text style={{ textAlign: 'center', fontWeight: 'bold', fontSize: 16, color: '#fff' }}>Next Step</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
} 