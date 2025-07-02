import React from 'react';
import { View, Text, TextInput, TouchableOpacity, Switch } from 'react-native';
import Slider from '@react-native-community/slider';
import modules from '../../../templates/modules';
import type { Template } from './CreateWizard';

export const baseParams = [
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

export default function Step2Configure({ template, config, setConfig }: Props) {
  const paramSchemas = template.modules.flatMap((moduleName) => {
    const mod = modules[moduleName];
    return mod ? mod.initParamsSchema : [];
  });

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
          <View key={param.name} style={{ marginBottom: 16 }}>
            <Text style={{ marginBottom: 8 }}>{param.label}</Text>
            <View style={{ flexDirection: 'row' }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: config[param.name] === true ? '#2563eb' : '#d1d5db',
                  paddingVertical: 12,
                  borderTopLeftRadius: 8,
                  borderBottomLeftRadius: 8,
                  alignItems: 'center',
                }}
                onPress={() => setConfig({ ...config, [param.name]: true })}
              >
                <Text style={{ color: config[param.name] === true ? '#fff' : '#333', fontWeight: 'bold' }}>Public</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: config[param.name] === false ? '#2563eb' : '#d1d5db',
                  paddingVertical: 12,
                  borderTopRightRadius: 8,
                  borderBottomRightRadius: 8,
                  alignItems: 'center',
                }}
                onPress={() => setConfig({ ...config, [param.name]: false })}
              >
                <Text style={{ color: config[param.name] === false ? '#fff' : '#333', fontWeight: 'bold' }}>Private</Text>
              </TouchableOpacity>
            </View>
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

  return (
    <>
      {baseParams.map(renderBaseField)}
      {paramSchemas.length > 0 && <Text style={{ fontWeight: 'bold', marginTop: 16, marginBottom: 8 }}>Module Parameters</Text>}
      {paramSchemas.map(renderField)}
    </>
  );
} 