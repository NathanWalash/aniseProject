import { Alert } from 'react-native';
import type { Template } from './CreateWizard';

export function deployAnise(template: Template, config: Record<string, any>) {
  const configStr = Object.entries(config)
    .map(([k, v]) => `${k}: ${v}`)
    .join('\n');
  Alert.alert(
    'DAO CREATED',
    `Template: ${template.templateName}\n\nConfig:\n${configStr}`,
    [{ text: 'OK' }]
  );
} 