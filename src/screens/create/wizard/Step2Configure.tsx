import React from 'react';
import { View, Text, TextInput, TouchableOpacity, Switch } from 'react-native';
import Slider from '@react-native-community/slider';
import modules from '../../../templates/modules';
import type { Template } from './CreateWizard';

export const baseParams = [
  { name: 'daoName', label: 'Anise Name', widget: 'text', help: 'The name for your group. This will be visible to members.' },
  { name: 'daoBrief', label: 'Brief Description', widget: 'text', help: 'A short summary of your group\'s purpose.' },
  { name: 'daoMandate', label: 'Mandate', widget: 'textarea', help: 'Describe the mission or rules for your group.' },
  { name: 'isPublic', label: 'Visibility', widget: 'switch', help: 'Public groups are visible in Explore. Private groups are only accessible by invite or code.' },
];

type Props = {
  template: Template;
  config: Record<string, any>;
  setConfig: (cfg: Record<string, any>) => void;
  onNext: (cfg: Record<string, any>) => void;
  onBack: () => void;
  step: number;
};

function getModuleCategory(moduleName: string) {
  // Simple mapping for demo; expand as needed
  if (moduleName.toLowerCase().includes('vote')) return 'Voting';
  if (moduleName.toLowerCase().includes('fund') || moduleName.toLowerCase().includes('treasury')) return 'Treasury';
  if (moduleName.toLowerCase().includes('member')) return 'Membership';
  if (moduleName.toLowerCase().includes('insurance')) return 'Insurance';
  return 'Other';
}

export default function Step2Configure({ template, config, setConfig }: Props) {
  const [touched, setTouched] = React.useState<Record<string, boolean>>({});
  const paramSchemasByModule = template.modules.map((moduleName) => {
    const mod = modules[moduleName];
    return {
      moduleName,
      category: getModuleCategory(moduleName),
      params: mod ? mod.initParamsSchema : [],
      description: mod && mod.description ? mod.description : '',
    };
  });

  // Validation: required if not a switch
  const isFieldInvalid = (param: any) => {
    if (param.widget === 'switch') return false;
    return touched[param.name] && (!config[param.name] || config[param.name].toString().trim() === '');
  };

  const renderBaseField = (param: any) => {
    const invalid = isFieldInvalid(param);
    return (
      <View key={param.name} style={{ marginBottom: 20 }}>
        <Text style={{ fontWeight: 'bold', marginBottom: 2 }}>{param.label}</Text>
        {/* Only show help text above for non-switch fields */}
        {param.widget !== 'switch' && param.help && (
          <Text style={{ color: '#6b7280', fontSize: 13, marginBottom: 4 }}>{param.help}</Text>
        )}
        {param.widget === 'textarea' ? (
          <TextInput
            multiline
            numberOfLines={4}
            value={config[param.name] ?? ''}
            onChangeText={text => setConfig({ ...config, [param.name]: text })}
            onBlur={() => setTouched({ ...touched, [param.name]: true })}
            style={{ borderWidth: 1, borderColor: invalid ? '#ef4444' : '#ccc', borderRadius: 4, padding: 8, minHeight: 80, backgroundColor: '#fff' }}
          />
        ) : param.widget === 'switch' ? (
          <>
            <View style={{ flexDirection: 'row', marginBottom: 4 }}>
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
            {/* Only show help text below for switch */}
            {param.help && <Text style={{ color: '#6b7280', fontSize: 13, marginBottom: 2 }}>{param.help}</Text>}
          </>
        ) : (
          <TextInput
            value={config[param.name] ?? ''}
            onChangeText={text => setConfig({ ...config, [param.name]: text })}
            onBlur={() => setTouched({ ...touched, [param.name]: true })}
            style={{ borderWidth: 1, borderColor: invalid ? '#ef4444' : '#ccc', borderRadius: 4, padding: 8, backgroundColor: '#fff' }}
          />
        )}
        {invalid && <Text style={{ color: '#ef4444', fontSize: 12, marginTop: 2 }}>This field is required.</Text>}
      </View>
    );
  };

  const renderField = (param: any) => {
    const invalid = isFieldInvalid(param);
    return (
      <View key={param.name} style={{ marginBottom: 20 }}>
        <Text style={{ fontWeight: 'bold', marginBottom: 2 }}>{param.label}</Text>
        {param.help && <Text style={{ color: '#6b7280', fontSize: 13, marginBottom: 4 }}>{param.help}</Text>}
        {param.widget === 'slider' ? (
          <>
            <Slider
              minimumValue={param.min}
              maximumValue={param.max}
              value={config[param.name] ?? param.default}
              onValueChange={(value: number) => setConfig({ ...config, [param.name]: value })}
              step={1}
            />
            <Text>{config[param.name] ?? param.default}</Text>
          </>
        ) : param.widget === 'number' ? (
          <TextInput
            keyboardType="numeric"
            value={String(config[param.name] ?? param.default)}
            onChangeText={text => setConfig({ ...config, [param.name]: Number(text) })}
            onBlur={() => setTouched({ ...touched, [param.name]: true })}
            style={{ borderWidth: 1, borderColor: invalid ? '#ef4444' : '#ccc', borderRadius: 4, padding: 8, backgroundColor: '#fff' }}
          />
        ) : (
          <TextInput
            value={config[param.name] ?? ''}
            onChangeText={text => setConfig({ ...config, [param.name]: text })}
            onBlur={() => setTouched({ ...touched, [param.name]: true })}
            style={{ borderWidth: 1, borderColor: invalid ? '#ef4444' : '#ccc', borderRadius: 4, padding: 8, backgroundColor: '#fff' }}
          />
        )}
        {invalid && <Text style={{ color: '#ef4444', fontSize: 12, marginTop: 2 }}>This field is required.</Text>}
        {param.description && (
          <TouchableOpacity onPress={() => {}} activeOpacity={0.7} style={{ marginTop: 4 }}>
            <Text style={{ color: '#2563eb', fontSize: 13, textDecorationLine: 'underline' }}>Learn more</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <>
      {/* Base fields (no card, no Basic Info title) */}
      {baseParams.filter(p => p.name !== 'isPublic').map(renderBaseField)}
      {/* Visibility switch (no duplicate help text) */}
      {renderBaseField(baseParams.find(p => p.name === 'isPublic'))}
      {/* Module Configuration fields, integrated below base fields */}
      {paramSchemasByModule.length > 0 && (
        <>
          <Text style={{ fontSize: 17, fontWeight: 'bold', marginTop: 24, marginBottom: 12 }}>Module Configuration</Text>
          {paramSchemasByModule.map(({ moduleName, params, description }) => (
            <View key={moduleName} style={{ marginBottom: 18 }}>
              <Text style={{ fontWeight: 'bold', fontSize: 15, marginBottom: 2 }}>{moduleName.replace('MemberModule', 'Membership').replace(/Module$/, '')}</Text>
              {description ? <Text style={{ color: '#6b7280', fontSize: 13, marginBottom: 6 }}>{description}</Text> : null}
              {params.length === 0 && <Text style={{ color: '#888', fontSize: 13, marginBottom: 8 }}>No parameters required.</Text>}
              {params.map(renderField)}
            </View>
          ))}
        </>
      )}
    </>
  );
} 