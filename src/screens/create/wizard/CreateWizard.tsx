import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Step1TemplateSelect from './Step1TemplateSelect';
import Step2Configure from './Step2Configure';
import Step3Review from './Step3Review';
import CreateSplashScreens from '../splash/CreateSplashScreens';

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

function WizardProgress({ step }: { step: number }) {
  const steps = [
    { label: 'Template' },
    { label: 'Configure' },
    { label: 'Deploy' },
  ];
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 24, marginTop: 8 }}>
      {steps.map((s, i) => (
        <View key={s.label} style={{ flexDirection: 'row', alignItems: 'center', marginRight: i < steps.length - 1 ? 8 : 0 }}>
          <View
            style={[
              {
                flexDirection: 'column',
                alignItems: 'center',
                paddingHorizontal: 12,
                paddingVertical: 8,
                minWidth: 70,
                borderRadius: i === 0 ? 8 : i === steps.length - 1 ? 8 : 0,
                borderTopLeftRadius: i === 0 ? 8 : 0,
                borderBottomLeftRadius: i === 0 ? 8 : 0,
                borderTopRightRadius: i === steps.length - 1 ? 8 : 0,
                borderBottomRightRadius: i === steps.length - 1 ? 8 : 0,
                borderWidth: 1,
                borderColor: step === i + 1 ? '#2563eb' : '#d1d5db',
                backgroundColor: step === i + 1 ? '#2563eb' : '#fff',
              },
            ]}
          >
            <Text style={{ color: step === i + 1 ? '#fff' : '#9ca3af', fontWeight: step === i + 1 ? 'bold' : 'normal', fontSize: 18 }}>{i + 1}</Text>
            <Text style={{ color: step === i + 1 ? '#fff' : '#9ca3af', fontSize: 12 }}>{s.label}</Text>
          </View>
          {i < steps.length - 1 && (
            <View style={{ width: 8, height: 2, backgroundColor: '#d1d5db' }} />
          )}
        </View>
      ))}
    </View>
  );
}

export default function CreateWizard() {
  const [step, setStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [config, setConfig] = useState<Record<string, any>>({});
  const [showInfo, setShowInfo] = useState(false);

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

  return (
    <View style={{ flex: 1, width: '100%', maxWidth: 400, alignSelf: 'center' }}>
      {/* Info Button */}
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', marginTop: 8, marginRight: 8 }}>
        <TouchableOpacity onPress={() => setShowInfo(true)}>
          <Icon name="information-circle-outline" size={28} color="#2563eb" />
        </TouchableOpacity>
      </View>
      <WizardProgress step={step} />
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
        />
      )}
      {/* Splash Modal */}
      <Modal visible={showInfo} animationType="slide" onRequestClose={() => setShowInfo(false)} presentationStyle="fullScreen">
        <CreateSplashScreens onDone={() => setShowInfo(false)} />
      </Modal>
    </View>
  );
} 