import React, { useState, useRef } from 'react';
import { 
  View, Text, Modal, TextInput, 
  TouchableOpacity, ActivityIndicator, StyleSheet,
  KeyboardAvoidingView, Platform, TouchableWithoutFeedback,
  Keyboard, ScrollView, Alert
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { createAnnouncement } from '../../../services/announcementApi';

interface CreateAnnouncementModalProps {
  visible: boolean;
  onClose: () => void;
  daoAddress: string;
}

type AnnouncementType = 'GENERAL' | 'URGENT' | 'INFO';

export const CreateAnnouncementModal: React.FC<CreateAnnouncementModalProps> = ({ 
  visible, 
  onClose, 
  daoAddress 
}) => {
  const [step, setStep] = useState<'form' | 'confirming' | 'success'>('form');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [announcementType, setAnnouncementType] = useState<AnnouncementType>('GENERAL');
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refs for inputs to handle focus
  const contentInputRef = useRef<TextInput>(null);

  const resetForm = () => {
    setTitle('');
    setContent('');
    setAnnouncementType('GENERAL');
    setExpiresAt(null);
    setError(null);
    setStep('form');
  };

  const handleClose = () => {
    Keyboard.dismiss();
    resetForm();
    onClose();
  };

  const getTypeValue = (type: AnnouncementType): number => {
    switch (type) {
      case 'GENERAL': return 0;
      case 'URGENT': return 1;
      case 'INFO': return 2;
      default: return 0;
    }
  };

  const handleSubmit = async () => {
    try {
      // Basic validation
      if (!title.trim()) {
        setError('Title is required');
        return;
      }
      if (!content.trim()) {
        setError('Content is required');
        return;
      }
      if (!expiresAt) {
        setError('Expiry date is required');
        return;
      }

      // Validate expiry date
      if (expiresAt <= new Date()) {
        setError('Expiry date must be in the future');
        return;
      }

      setError(null);
      setStep('confirming');
      
      // Create announcement using our service
      const result = await createAnnouncement(daoAddress, {
        title: title.trim(),
        content: content.trim(),
        announcementType: getTypeValue(announcementType),
        expiresAt: Math.floor(expiresAt.getTime() / 1000) // Convert to Unix timestamp
      });

      console.log('Announcement created:', result);
      setStep('success');
      
      // Auto close after success
      setTimeout(() => {
        handleClose();
      }, 2000);

    } catch (error: any) {
      console.error('Error creating announcement:', error);
      setError(error.message || 'Failed to create announcement');
      setStep('form');
    }
  };

  const getTypeColor = (type: AnnouncementType): string => {
    switch (type) {
      case 'GENERAL': return '#6B7280';
      case 'URGENT': return '#EF4444';
      case 'INFO': return '#3B82F6';
      default: return '#6B7280';
    }
  };

  const getTypeIcon = (type: AnnouncementType): string => {
    switch (type) {
      case 'GENERAL': return 'megaphone';
      case 'URGENT': return 'warning';
      case 'INFO': return 'information-circle';
      default: return 'megaphone';
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
                <Text style={styles.modalTitle}>Create Announcement</Text>
                <TouchableOpacity onPress={handleClose}>
                  <Icon name="close" size={24} color="#64748b" />
                </TouchableOpacity>
              </View>

              {step === 'form' && (
                <>
                  <ScrollView style={styles.formContainer}>
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Title *</Text>
                      <TextInput
                        style={styles.input}
                        value={title}
                        onChangeText={setTitle}
                        placeholder="Enter announcement title"
                        placeholderTextColor="#9CA3AF"
                                                 returnKeyType="done"
                         onSubmitEditing={() => {
                           // Submit or close keyboard
                         }}
                       />
                     </View>

                     <View style={styles.inputGroup}>
                      <Text style={styles.label}>Content *</Text>
                      <TextInput
                        ref={contentInputRef}
                        style={[styles.input, styles.textArea]}
                        value={content}
                        onChangeText={setContent}
                        placeholder="Enter announcement content"
                        placeholderTextColor="#9CA3AF"
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                        returnKeyType="done"
                        onSubmitEditing={() => {
                          // Close keyboard
                        }}
                      />
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Type</Text>
                      <View style={styles.typeContainer}>
                        {(['GENERAL', 'URGENT', 'INFO'] as AnnouncementType[]).map((type) => (
                          <TouchableOpacity
                            key={type}
                            style={[
                              styles.typeButton,
                              announcementType === type && { 
                                backgroundColor: getTypeColor(type),
                                borderColor: getTypeColor(type)
                              }
                            ]}
                            onPress={() => setAnnouncementType(type)}
                          >
                            <Icon 
                              name={getTypeIcon(type)} 
                              size={16} 
                              color={announcementType === type ? '#fff' : getTypeColor(type)} 
                            />
                            <Text style={[
                              styles.typeText,
                              announcementType === type && { color: '#fff' }
                            ]}>
                              {type}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>

                                         <View style={styles.inputGroup}>
                       <Text style={styles.label}>Expires At *</Text>
                       <TouchableOpacity
                         style={styles.datePickerButton}
                         onPress={() => setShowDatePicker(true)}
                       >
                         <Icon name="calendar" size={20} color="#6B7280" />
                         <Text style={styles.datePickerText}>
                           {expiresAt 
                             ? expiresAt.toLocaleString('en-US', {
                                 year: 'numeric',
                                 month: 'short',
                                 day: 'numeric',
                                 hour: '2-digit',
                                 minute: '2-digit'
                               })
                             : 'Select date and time'
                           }
                         </Text>
                         <Icon name="chevron-down" size={20} color="#6B7280" />
                       </TouchableOpacity>
                       <Text style={styles.helpText}>
                         Select when this announcement should expire
                       </Text>
                     </View>

                    {error && (
                      <Text style={styles.errorText}>{error}</Text>
                    )}
                  </ScrollView>

                  <TouchableOpacity 
                    style={styles.submitButton}
                    onPress={handleSubmit}
                  >
                    <Text style={styles.submitText}>Create Announcement</Text>
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
                    Announcement Created Successfully!
                  </Text>
                </View>
              )}
                           </View>
             </View>
           </TouchableWithoutFeedback>
         </KeyboardAvoidingView>

         {/* Date Time Picker Modal */}
         <DateTimePickerModal
           isVisible={showDatePicker}
           mode="datetime"
           onConfirm={(date) => {
             setExpiresAt(date);
             setShowDatePicker(false);
           }}
           onCancel={() => setShowDatePicker(false)}
           minimumDate={new Date()}
         />
       </Modal>
     );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end'
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%'
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827'
  },
  formContainer: {
    maxHeight: '80%'
  },
  inputGroup: {
    marginBottom: 20
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#fff'
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top'
  },
  typeContainer: {
    flexDirection: 'row',
    gap: 12
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    backgroundColor: '#fff',
    gap: 6
  },
  typeText: {
    fontSize: 14,
    fontWeight: '500'
  },
  helpText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    marginBottom: 16
  },
  submitButton: {
    backgroundColor: '#2563eb',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 40
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center'
  },
  successContainer: {
    alignItems: 'center',
    padding: 40
  },
  successText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#059669',
    marginTop: 16,
    textAlign: 'center'
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
    gap: 8
  },
  datePickerText: {
    flex: 1,
    fontSize: 16,
    color: '#111827'
  }
}); 