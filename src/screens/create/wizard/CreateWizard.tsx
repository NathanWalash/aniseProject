import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, SafeAreaView, Platform, ScrollView, Dimensions, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Step1TemplateSelect from './Step1TemplateSelect';
import Step2Configure from './Step2Configure';
import Step3Review from './Step3Review';
import CreateSplashScreens from '../splash/CreateSplashScreens';
import { ProgressSteps, ProgressStep } from 'react-native-progress-steps';
import { baseParams } from './Step2Configure';

export type Template = {
  templateName: string;
  templateDescription: string;
  modules: string[];
  initParamsSchema: { [key: string]: string }[];
  templateId: string;
};

export type CreateWizardState = {
  step: number;
  selectedTemplate: Template | null;
  config: Record<string, any>;
};

const stepTitles = [
  'Choose Your Anise Template',
  'Configure Your Anise',
  'Review Your Anise',
];

export default function CreateWizard() {
  const [step, setStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [config, setConfig] = useState<Record<string, any>>({});
  const [showInfo, setShowInfo] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [progressBarHeight, setProgressBarHeight] = useState(0);
  const scrollViewRef = useRef(null);

  // Scroll to top when step changes
  useEffect(() => {
    if (scrollViewRef.current) {
      (scrollViewRef.current as any).scrollTo({ y: 0, animated: true });
    }
  }, [step]);

  const goToStep = (s: number) => setStep(s);
  const handleSelectTemplate = (template: Template) => {
    setSelectedTemplate(template);
    setStep(2);
  };
  const handleConfigNext = (cfg: Record<string, any>) => {
    setConfig(cfg);
    setStep(3);
  };
  const reset = () => {
    setStep(1);
    setSelectedTemplate(null);
    setConfig({});
  };

  // Navigation buttons for each step
  let navButtons = null;
  if (step === 1) {
    navButtons = (
      <View style={{ width: '100%', padding: 16, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#e5e7eb' }}>
        <TouchableOpacity
          style={{ width: '100%', paddingVertical: 14, borderRadius: 8, backgroundColor: selectedTemplate ? '#2563eb' : '#d1d5db' }}
          disabled={!selectedTemplate}
          onPress={() => selectedTemplate && handleSelectTemplate(selectedTemplate)}
        >
          <Text style={{ color: '#fff', textAlign: 'center', fontWeight: 'bold', fontSize: 16 }}>Next Step</Text>
        </TouchableOpacity>
      </View>
    );
  } else if (step === 2 && selectedTemplate) {
    // Check if all required fields are filled
    const allBaseFilled = baseParams.every((param: { name: string; widget: string }) => {
      if (param.widget === 'switch') return true;
      return config[param.name] && config[param.name].trim() !== '';
    });
    const paramSchemas = selectedTemplate.modules.flatMap((moduleName) => {
      const mod = require('../../../templates/modules')[moduleName];
      return mod ? mod.initParamsSchema : [];
    });
    const allModuleFilled = paramSchemas.every((param: { name: string }) => {
      const key = param.name;
      return config[key] !== undefined && config[key] !== '';
    });
    const allFilled = allBaseFilled && allModuleFilled;
    navButtons = (
      <View style={{ width: '100%', padding: 16, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#e5e7eb', flexDirection: 'row', justifyContent: 'space-between' }}>
        <TouchableOpacity
          style={{ flex: 1, marginRight: 8, backgroundColor: '#d1d5db', borderRadius: 8, paddingVertical: 14 }}
          onPress={() => goToStep(1)}
        >
          <Text style={{ textAlign: 'center', fontWeight: 'bold', fontSize: 16 }}>Previous Step</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ flex: 1, marginLeft: 8, backgroundColor: allFilled ? '#2563eb' : '#d1d5db', borderRadius: 8, paddingVertical: 14 }}
          onPress={() => handleConfigNext(config)}
          disabled={!allFilled}
        >
          <Text style={{ textAlign: 'center', fontWeight: 'bold', fontSize: 16, color: '#fff' }}>Next Step</Text>
        </TouchableOpacity>
      </View>
    );
  } else if (step === 3 && selectedTemplate) {
    navButtons = (
      <View style={{ width: '100%', padding: 16, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#e5e7eb', flexDirection: 'row', justifyContent: 'space-between' }}>
        <TouchableOpacity
          style={{ flex: 1, marginRight: 8, backgroundColor: '#d1d5db', borderRadius: 8, paddingVertical: 14 }}
          onPress={() => goToStep(2)}
        >
          <Text style={{ textAlign: 'center', fontWeight: 'bold', fontSize: 16 }}>Previous Step</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ flex: 1, marginLeft: 8, backgroundColor: agreed ? '#2563eb' : '#d1d5db', borderRadius: 8, paddingVertical: 14 }}
          onPress={() => {
            // Deploy logic should be handled in Step3Review, but for now just reset
            reset();
          }}
          disabled={!agreed}
        >
          <Text style={{ textAlign: 'center', fontWeight: 'bold', fontSize: 16, color: '#fff' }}>Deploy</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      {/* Fixed Progress Bar at the very top */}
      <View
        style={styles.progressBarContainer}
        onLayout={e => setProgressBarHeight(e.nativeEvent.layout.height)}
      >
        <ProgressSteps
          activeStep={step - 1}
          completedStepIconColor="#2563eb"
          activeStepIconBorderColor="#2563eb"
          labelColor="#6b7280"
          activeLabelColor="#2563eb"
          completedLabelColor="#2563eb"
          labelFontSize={12}
          borderWidth={2}
          topOffset={0}
          marginBottom={0}
        >
          <ProgressStep label="Template" removeBtnRow />
          <ProgressStep label="Configure" removeBtnRow />
          <ProgressStep label="Review" removeBtnRow />
        </ProgressSteps>
      </View>
      <View style={{ flex: 1 }}>
        <ScrollView
          ref={scrollViewRef}
          style={{ flex: 1, marginTop: progressBarHeight, marginBottom: 88 }}
          contentContainerStyle={{ minHeight: Dimensions.get('window').height - 160, paddingHorizontal: 24, paddingTop: 8 }}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 18, textAlign: 'center', color: '#222' }}>{stepTitles[step - 1]}</Text>
          {step === 1 && (
            <Step1TemplateSelect
              onSelect={handleSelectTemplate}
              step={step}
              selectedTemplate={selectedTemplate}
              setSelectedTemplate={setSelectedTemplate}
            />
          )}
          {step === 2 && selectedTemplate && (
            <Step2Configure
              template={selectedTemplate}
              config={config}
              setConfig={setConfig}
              onNext={handleConfigNext}
              onBack={() => goToStep(1)}
              step={step}
            />
          )}
          {step === 3 && selectedTemplate && (
            <Step3Review
              template={selectedTemplate}
              config={config}
              onBack={() => goToStep(2)}
              onReset={reset}
              step={step}
              agreed={agreed}
              setAgreed={setAgreed}
            />
          )}
          {/* Subtle info link at the bottom of the scroll window */}
          <View style={{ alignItems: 'center', marginTop: 0, marginBottom: 12 }}>
            <TouchableOpacity
              onPress={() => setShowInfo(true)}
              style={{ flexDirection: 'row', alignItems: 'center', opacity: 0.7 }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Icon name="information-circle-outline" size={20} color="#2563eb" style={{ marginRight: 6 }} />
              <Text style={{ color: '#2563eb', fontSize: 15, textDecorationLine: 'underline' }}>How this works</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
      {/* Navigation Buttons fixed at the bottom */}
      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 3 }}>{navButtons}</View>
      {/* Splash Modal */}
      <Modal visible={showInfo} animationType="slide" onRequestClose={() => setShowInfo(false)} presentationStyle="fullScreen">
        <CreateSplashScreens onDone={() => setShowInfo(false)} />
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  progressBarContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingTop: 12,
    paddingBottom: 12,
    justifyContent: 'center',
    paddingHorizontal: 0,
  },
}); 