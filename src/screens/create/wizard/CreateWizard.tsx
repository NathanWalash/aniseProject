import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, SafeAreaView, Platform, ScrollView, Dimensions, StyleSheet, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Step1TemplateSelect from './Step1TemplateSelect';
import Step2Configure from './Step2Configure';
import Step3Review from './Step3Review';
import CreateSplashScreens from '../splash/CreateSplashScreens';
import { ProgressSteps, ProgressStep } from 'react-native-progress-steps';
import { baseParams } from './Step2Configure';
import { deployAnise } from './deployAnise';

export type Template = {
  templateId: string;
  name?: string;
  description?: string;
  templateName?: string;
  templateDescription?: string;
  modules: any[];
  initParamsSchema?: { [key: string]: string }[];
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

export default function CreateWizard({ user }: { user: any }) {
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
    setAgreed(false);
  };

  // Navigation buttons for each step
  let navButtons = null;
  if (step === 1) {
    navButtons = (
      <TouchableOpacity
        style={[styles.navButton, styles.navButtonPrimary, { flex: 1 }]}
        disabled={!selectedTemplate}
        onPress={() => selectedTemplate && handleSelectTemplate(selectedTemplate)}
      >
        <Text style={styles.navButtonTextPrimary}>Next Step</Text>
      </TouchableOpacity>
    );
  } else if (step === 2 && selectedTemplate) {
    // Only allow next if all required base fields are filled
    const requiredBaseFields = ['daoName', 'daoBrief', 'intendedAudience', 'daoMandate'];
    const allBaseFilled = requiredBaseFields.every((field) => config[field] && config[field].toString().trim() !== '');
    navButtons = (
      <>
        <TouchableOpacity
          style={[styles.navButton, styles.navButtonSecondary, { flex: 1, marginRight: 8 }]}
          onPress={() => goToStep(1)}
        >
          <Text style={styles.navButtonTextSecondary}>Previous Step</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.navButton, styles.navButtonPrimary, { flex: 1, marginLeft: 8, opacity: allBaseFilled ? 1 : 0.5 }]}
          onPress={() => allBaseFilled && handleConfigNext(config)}
          disabled={!allBaseFilled}
        >
          <Text style={styles.navButtonTextPrimary}>Next Step</Text>
        </TouchableOpacity>
      </>
    );
  } else if (step === 3 && selectedTemplate) {
    navButtons = (
      <>
        <TouchableOpacity
          style={[styles.navButton, styles.navButtonSecondary, { flex: 1, marginRight: 8 }]}
          onPress={() => goToStep(2)}
        >
          <Text style={styles.navButtonTextSecondary}>Previous Step</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.navButton,
            styles.navButtonPrimary,
            { flex: 1, marginLeft: 8, opacity: agreed ? 1 : 0.5 },
          ]}
          onPress={async () => {
            if (!agreed) return;
            if (!user || !user.uid) {
              Alert.alert('Authentication Error', 'Could not find user information.');
              return;
            }
            const linkedAddress = user.walletAddress;
            await deployAnise(selectedTemplate, config, linkedAddress, user.uid);
          }}
          disabled={!agreed}
        >
          <Text style={styles.navButtonTextPrimary}>Deploy</Text>
        </TouchableOpacity>
      </>
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
      <ScrollView
        ref={scrollViewRef}
        style={{ flex: 1, marginTop: progressBarHeight, marginBottom: 78 }}
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 8, paddingBottom: 16}}
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
            user={user}
          />
        )}
        {/* Subtle info link directly after last form component */}
        <TouchableOpacity
          onPress={() => setShowInfo(true)}
          style={{ flexDirection: 'row', alignItems: 'center', opacity: 0.7 }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Icon name="information-circle-outline" size={20} color="#2563eb" style={{ marginRight: 6 }} />
          <Text style={{ color: '#2563eb', fontSize: 15, textDecorationLine: 'underline' }}>How this works</Text>
        </TouchableOpacity>
      </ScrollView>
      {/* Sticky Navigation Buttons at the bottom */}
      <View style={styles.stickyNavRow}>{navButtons}</View>
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
    paddingTop: 12,
    paddingBottom: 12,
    justifyContent: 'center',
    paddingHorizontal: 0,
  },
  stickyNavRow: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    padding: 12,
    zIndex: 10,
  },
  navButton: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  navButtonPrimary: {
    backgroundColor: '#2563eb',
  },
  navButtonSecondary: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#2563eb',
  },
  navButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
  navButtonTextPrimary: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  navButtonTextSecondary: {
    color: '#2563eb',
    fontWeight: 'bold',
    fontSize: 16,
  },
}); 