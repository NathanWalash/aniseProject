import React, { useState, useRef } from 'react';
import { 
  View, Text, Modal, TextInput, 
  TouchableOpacity, ActivityIndicator, StyleSheet,
  KeyboardAvoidingView, Platform, TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { createClaim } from '../../../services/claimApi';

interface CreateClaimModalProps {
  visible: boolean;
  onClose: () => void;
  daoAddress: string;
}

export const CreateClaimModal: React.FC<CreateClaimModalProps> = ({ 
  visible, 
  onClose, 
  daoAddress 
}) => {
  const [step, setStep] = useState<'form' | 'confirming' | 'success'>('form');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Refs for inputs to handle focus
  const amountInputRef = useRef<TextInput>(null);
  const descriptionInputRef = useRef<TextInput>(null);

  const resetForm = () => {
    setTitle('');
    setAmount('');
    setDescription('');
    setError(null);
    setStep('form');
  };

  const handleClose = () => {
    Keyboard.dismiss();
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    try {
      // Basic validation
      if (!title.trim()) {
        setError('Title is required');
        return;
      }
      if (!amount.trim() || isNaN(Number(amount))) {
        setError('Valid amount is required');
        return;
      }
      if (!description.trim()) {
        setError('Description is required');
        return;
      }

      setError(null);
      setStep('confirming');
      
      // Create claim using our service
      const result = await createClaim(daoAddress, {
        title: title.trim(),
        amount: amount.trim(),
        description: description.trim()
      });

      console.log('Claim created:', result);
      setStep('success');
      
      // Auto close after success
      setTimeout(() => {
        handleClose();
      }, 2000);

    } catch (error: any) {
      console.error('Error creating claim:', error);
      setError(error.message || 'Failed to create claim');
      setStep('form');
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalOverlay}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Submit New Claim</Text>
                <TouchableOpacity onPress={handleClose}>
                  <Icon name="close" size={24} color="#64748b" />
                </TouchableOpacity>
              </View>

              {step === 'form' && (
                <>
                  <TextInput
                    style={styles.input}
                    placeholder="Title"
                    placeholderTextColor="#9ca3af"
                    value={title}
                    onChangeText={setTitle}
                    maxLength={100}
                    returnKeyType="next"
                    onSubmitEditing={() => amountInputRef.current?.focus()}
                    blurOnSubmit={false}
                  />
                  
                  <TextInput
                    ref={amountInputRef}
                    style={styles.input}
                    placeholder="Amount (in GBP)"
                    placeholderTextColor="#9ca3af"
                    value={amount}
                    onChangeText={setAmount}
                    keyboardType="decimal-pad"
                    returnKeyType="next"
                    onSubmitEditing={() => descriptionInputRef.current?.focus()}
                    blurOnSubmit={false}
                  />
                  
                  <TextInput
                    ref={descriptionInputRef}
                    style={[styles.input, styles.textArea]}
                    placeholder="Description"
                    placeholderTextColor="#9ca3af"
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    numberOfLines={4}
                    maxLength={500}
                    textAlignVertical="top"
                    returnKeyType="done"
                    onSubmitEditing={Keyboard.dismiss}
                  />

                  {error && (
                    <Text style={styles.errorText}>{error}</Text>
                  )}

                  <TouchableOpacity 
                    style={styles.submitButton}
                    onPress={handleSubmit}
                  >
                    <Text style={styles.submitText}>Submit Claim</Text>
                  </TouchableOpacity>
                </>
              )}

              {step === 'confirming' && (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#2563eb" />
                  <Text style={styles.loadingText}>
                    Confirming Transaction...
                  </Text>
                  <Text style={styles.loadingSubtext}>
                    Please confirm in MetaMask
                  </Text>
                </View>
              )}

              {step === 'success' && (
                <View style={styles.successContainer}>
                  <Icon name="checkmark-circle" size={48} color="#059669" />
                  <Text style={styles.successText}>
                    Claim Submitted Successfully!
                  </Text>
                </View>
              )}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: '#f9fafb',
    color: '#111827', // Text color for input
  },
  textArea: {
    height: 100,
    paddingTop: 12,
  },
  submitButton: {
    backgroundColor: '#2563eb',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#ef4444',
    marginBottom: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },
  loadingSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#6b7280',
  },
  successContainer: {
    alignItems: 'center',
    padding: 24,
  },
  successText: {
    marginTop: 16,
    fontSize: 16,
    color: '#059669',
    fontWeight: '500',
  },
}); 