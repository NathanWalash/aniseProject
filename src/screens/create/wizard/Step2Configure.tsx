import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Switch, StyleSheet, ScrollView } from 'react-native';
import Slider from '@react-native-community/slider';
import modules from '../../../templates/modules';
import type { Template } from './CreateWizard';
import Icon from 'react-native-vector-icons/Ionicons';

export const baseParams = [
  { name: 'daoName', label: 'Anise Name', widget: 'text', help: 'The name for your group. This will be visible to members.' },
  { name: 'daoBrief', label: 'Brief Description', widget: 'text', help: 'A short summary of your group\'s purpose.' },
  { name: 'intendedAudience', label: 'Intended Audience', widget: 'text', help: 'Who is this group for? (e.g. community, donors, etc.)' },
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

// Helper to generate unique config keys for module params
function getModuleParamKey(moduleName: string, paramName: string) {
  return `${moduleName}_${paramName}`;
}

export default function Step2Configure({ template, config, setConfig, onNext, onBack }: Props) {
  const [localConfig, setLocalConfig] = useState(config);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // This effect synchronizes the local state with the parent state
  useEffect(() => {
    setConfig(localConfig);
  }, [localConfig, setConfig]);

  // In paramSchemasByModule, filter out admin, token, and owner fields from params
  const paramSchemasByModule = template.modules.map((moduleName) => {
    const mod = modules[moduleName];
    let params = mod ? mod.initParamsSchema : [];
    // Remove admin, token, and owner from user input (explicitly for MemberModule)
    if (moduleName === 'MemberModule') {
      params = params.filter((p: any) => p.name !== 'admin');
    } else {
      params = params.filter((p: any) => !['admin', 'token', 'owner'].includes(p.name));
    }
    return {
      moduleName,
      category: getModuleCategory(moduleName),
      params,
      description: mod && mod.description ? mod.description : '',
    };
  });

  // Validation: required if not a switch
  const isFieldInvalid = (param: any) => {
    if (param.widget === 'switch') return false;
    return touched[param.name] && (!localConfig[param.name] || localConfig[param.name].toString().trim() === '');
  };

  
  // Segmented control for visibility
  const VisibilitySegment = ({ value, onChange }: { value: boolean, onChange: (v: boolean) => void }) => (
    <View style={styles.segmentContainer}>
      <TouchableOpacity
        style={[styles.segmentButton, value && styles.segmentButtonActive]}
        onPress={() => onChange(true)}
        accessibilityRole="button"
        accessibilityState={{ selected: value }}
      >
        <Icon name="globe-outline" size={18} color={value ? '#fff' : '#2563eb'} style={{ marginRight: 6 }} />
        <Text style={[styles.segmentText, value && styles.segmentTextActive]}>Public</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.segmentButton, !value && styles.segmentButtonActive]}
        onPress={() => onChange(false)}
        accessibilityRole="button"
        accessibilityState={{ selected: !value }}
      >
        <Icon name="lock-closed-outline" size={18} color={!value ? '#fff' : '#2563eb'} style={{ marginRight: 6 }} />
        <Text style={[styles.segmentText, !value && styles.segmentTextActive]}>Private</Text>
      </TouchableOpacity>
    </View>
  );

  const renderBaseField = (param: any) => {
    const invalid = isFieldInvalid(param);
    if (param.widget === 'switch') {
      return (
        <View key={param.name} style={{ marginBottom: 20 }}>
          <Text style={styles.fieldLabel}>{param.label}</Text>
          <VisibilitySegment value={!!localConfig[param.name]} onChange={v => setLocalConfig({ ...localConfig, [param.name]: v })} />
          {param.help && <Text style={styles.fieldHelp}>{param.help}</Text>}
        </View>
      );
    }
    // Use standard TextInput
    return (
      <View key={param.name} style={{ marginBottom: 20 }}>
        <Text style={styles.fieldLabel}>{param.label}</Text>
        <TextInput
          value={localConfig[param.name] ?? ''}
          onChangeText={text => setLocalConfig({ ...localConfig, [param.name]: text })}
          multiline={param.widget === 'textarea'}
          numberOfLines={param.widget === 'textarea' ? 4 : 1}
          style={[styles.floatingInput, invalid && styles.inputInvalid, param.widget === 'textarea' && { minHeight: 80 }]}
          placeholder={param.label}
          placeholderTextColor="#888"
        />
        {param.help && <Text style={styles.fieldHelp}>{param.help}</Text>}
        {invalid && <Text style={styles.inputInvalidText}>This field is required.</Text>}
      </View>
    );
  };

  const renderField = (param: any, moduleName: string) => {
    const invalid = isFieldInvalid(param);
    const configKey = getModuleParamKey(moduleName, param.name);
    if (param.widget === 'slider') {
      return (
        <View key={param.name} style={{ marginBottom: 20 }}>
          <Text style={styles.fieldLabel}>{param.label}</Text>
          <Slider
            minimumValue={param.min}
            maximumValue={param.max}
            value={localConfig[configKey] ?? param.default}
            onValueChange={(value: number) => setLocalConfig({ ...localConfig, [configKey]: value })}
            step={1}
          />
          <Text>{localConfig[configKey] ?? param.default}</Text>
          {param.help && <Text style={styles.fieldHelp}>{param.help}</Text>}
        </View>
      );
    }
    if (param.widget === 'number') {
      return (
        <View key={param.name} style={{ marginBottom: 20 }}>
          <Text style={styles.fieldLabel}>{param.label}</Text>
          <TextInput
            value={String(localConfig[configKey] ?? param.default)}
            onChangeText={text => setLocalConfig({ ...localConfig, [configKey]: Number(text) })}
            keyboardType="numeric"
            style={[styles.floatingInput, invalid && styles.inputInvalid]}
            placeholder={param.label}
            placeholderTextColor="#888"
          />
          {param.help && <Text style={styles.fieldHelp}>{param.help}</Text>}
          {invalid && <Text style={styles.inputInvalidText}>This field is required.</Text>}
        </View>
      );
    }
    // Use standard TextInput for all other types
    return (
      <View key={param.name} style={{ marginBottom: 20 }}>
        <Text style={styles.fieldLabel}>{param.label}</Text>
        <TextInput
          value={localConfig[configKey] ?? ''}
          onChangeText={text => setLocalConfig({ ...localConfig, [configKey]: text })}
          multiline={param.widget === 'textarea'}
          numberOfLines={param.widget === 'textarea' ? 4 : 1}
          style={[
            styles.textInputBox,
            invalid && styles.inputInvalid,
            param.widget === 'textarea' && { minHeight: 80 }
          ]}
          placeholder={param.label}
          placeholderTextColor="#bbb"
        />
        {param.help && <Text style={styles.fieldHelp}>{param.help}</Text>}
        {invalid && <Text style={styles.inputInvalidText}>This field is required.</Text>}
        {param.description && (
          <TouchableOpacity onPress={() => {}} activeOpacity={0.7} style={{ marginTop: 4 }}>
            <Text style={{ color: '#2563eb', fontSize: 13, textDecorationLine: 'underline' }}>Learn more</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  // Check if all required fields are filled
  const allBaseFilled = baseParams.every((param) => {
    if (param.widget === 'switch') return true;
    return localConfig[param.name] && localConfig[param.name].toString().trim() !== '';
  });
  const paramSchemas = template.modules.flatMap((moduleName) => {
    const mod = modules[moduleName];
    return mod ? mod.initParamsSchema : [];
  });
  // When checking if all module fields are filled, use the unique config keys
  const allModuleFilled = paramSchemas.every((param: any) => {
    const key = param.moduleName ? getModuleParamKey(param.moduleName, param.name) : param.name;
    return localConfig[key] !== undefined && localConfig[key] !== '';
  });
  const allFilled = allBaseFilled && allModuleFilled;

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Basic Info Card */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>Basic Info</Text>
          {baseParams.filter(p => p.name !== 'isPublic').map(renderBaseField)}
          {renderBaseField(baseParams.find(p => p.name === 'isPublic'))}
        </View>
        {/* Module Configuration Cards */}
        {paramSchemasByModule.length > 0 && (
          <>
            <Text style={styles.sectionHeader}>Module Configuration</Text>
            {paramSchemasByModule.map(({ moduleName, params, description, category }) => (
              <View key={moduleName} style={styles.card}>
                <View style={styles.moduleHeader}>
                  <Icon name="cube-outline" size={20} color="#2563eb" style={{ marginRight: 8 }} />
                  <Text style={styles.moduleTitle}>{moduleName.replace('MemberModule', 'Membership').replace(/Module$/, '')}</Text>
                </View>
                {description ? <Text style={styles.moduleDescription}>{description}</Text> : null}
                {params.length === 0 && <Text style={styles.moduleNoParams}>No parameters required.</Text>}
                {params.map(param => renderField(param, moduleName))}
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

// Improved text input box style
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    paddingHorizontal: 2,
    paddingTop: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 22,
    marginHorizontal: 2,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 14,
    color: '#222',
  },
  sectionHeader: {
    fontSize: 17,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 10,
    color: '#2563eb',
  },
  fieldLabel: {
    fontWeight: 'bold',
    marginBottom: 2,
    fontSize: 15,
    color: '#222',
  },
  fieldHelp: {
    color: '#6b7280',
    fontSize: 13,
    marginBottom: 4,
  },
  floatingInputContainer: {
    position: 'relative',
    marginBottom: 0,
  },
  floatingLabel: {
    position: 'absolute',
    left: 12,
    top: 12,
    fontSize: 15,
    color: '#888',
    zIndex: 2,
    backgroundColor: 'transparent',
  },
  floatingLabelActive: {
    top: -10,
    left: 8,
    fontSize: 12,
    color: '#2563eb',
    backgroundColor: '#fff',
    paddingHorizontal: 2,
  },
  floatingInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    paddingTop: 22,
    fontSize: 15,
    backgroundColor: '#fff',
    color: '#222',
  },
  inputInvalid: {
    borderColor: '#ef4444',
  },
  inputInvalidText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 2,
    marginBottom: 2,
  },
  segmentContainer: {
    flexDirection: 'row',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 4,
  },
  segmentButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: '#f3f4f6',
    minWidth: 0,
  },
  segmentButtonActive: {
    backgroundColor: '#2563eb',
  },
  segmentText: {
    color: '#333',
    fontWeight: 'bold',
    fontSize: 15,
    marginLeft: 0,
  },
  segmentTextActive: {
    color: '#fff',
  },
  moduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  moduleTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#222',
    marginRight: 8,
  },
  moduleDescription: {
    color: '#6b7280',
    fontSize: 13,
    marginBottom: 6,
  },
  moduleNoParams: {
    color: '#888',
    fontSize: 13,
    marginBottom: 8,
  },
  textInputBox: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    backgroundColor: '#f6f8fa',
    color: '#222',
    marginTop: 6,
    marginBottom: 2,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
  },
}); 