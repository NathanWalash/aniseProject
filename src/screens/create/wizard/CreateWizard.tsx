import React, { useState } from 'react';
import { View, Text } from 'react-native';
import Step1TemplateSelect from './Step1TemplateSelect';
import Step2Configure from './Step2Configure';
import Step3Review from './Step3Review';

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
  const [state, setState] = useState<CreateWizardState>({
    step: 1,
    selectedTemplate: null,
    config: {},
  });

  const goToStep = (step: number) => setState(s => ({ ...s, step }));
  const setTemplate = (template: Template) => setState(s => ({ ...s, selectedTemplate: template, step: 2 }));
  const setConfig = (config: Record<string, any>) => setState(s => ({ ...s, config, step: 3 }));
  const reset = () => setState({ step: 1, selectedTemplate: null, config: {} });

  return (
    <View style={{ flex: 1, width: '100%', maxWidth: 400, alignSelf: 'center' }}>
      <WizardProgress step={state.step} />
      {state.step === 1 && <Step1TemplateSelect onSelect={setTemplate} step={state.step} />}
      {state.step === 2 && state.selectedTemplate && (
        <Step2Configure template={state.selectedTemplate} onNext={setConfig} onBack={() => goToStep(1)} step={state.step} />
      )}
      {state.step === 3 && state.selectedTemplate && (
        <Step3Review template={state.selectedTemplate} config={state.config} onBack={() => goToStep(2)} onReset={reset} step={state.step} />
      )}
    </View>
  );
} 