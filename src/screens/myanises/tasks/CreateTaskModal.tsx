import React, { useState, useRef } from 'react';
import { 
  View, Text, Modal, TextInput, 
  TouchableOpacity, ActivityIndicator, StyleSheet,
  KeyboardAvoidingView, Platform, TouchableWithoutFeedback,
  Keyboard, ScrollView, Alert
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { createTask } from '../../../services/taskApi';

interface CreateTaskModalProps {
  visible: boolean;
  onClose: () => void;
  daoAddress: string;
}

type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({ 
  visible, 
  onClose, 
  daoAddress 
}) => {
  const [step, setStep] = useState<'form' | 'confirming' | 'success'>('form');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('MEDIUM');
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refs for inputs to handle focus
  const descriptionInputRef = useRef<TextInput>(null);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPriority('MEDIUM');
    setDueDate(null);
    setError(null);
    setStep('form');
  };

  const handleClose = () => {
    Keyboard.dismiss();
    resetForm();
    onClose();
  };

  const getPriorityValue = (priority: TaskPriority): number => {
    switch (priority) {
      case 'LOW': return 0;
      case 'MEDIUM': return 1;
      case 'HIGH': return 2;
      case 'URGENT': return 3;
      default: return 1;
    }
  };

  const handleSubmit = async () => {
    try {
      // Basic validation
      if (!title.trim()) {
        setError('Title is required');
        return;
      }
      if (!description.trim()) {
        setError('Description is required');
        return;
      }
      if (!dueDate) {
        setError('Due date is required');
        return;
      }

      // Validate due date
      if (dueDate <= new Date()) {
        setError('Due date must be in the future');
        return;
      }

      setError(null);
      setStep('confirming');
      
      // Create task using our service
      const result = await createTask(daoAddress, {
        title: title.trim(),
        description: description.trim(),
        priority: getPriorityValue(priority),
        dueDate: Math.floor(dueDate.getTime() / 1000) // Convert to Unix timestamp
      });

      console.log('Task created:', result);
      setStep('success');
      
      // Auto close after success
      setTimeout(() => {
        handleClose();
      }, 2000);

    } catch (error: any) {
      console.error('Error creating task:', error);
      setError(error.message || 'Failed to create task');
      setStep('form');
    }
  };

  const getPriorityColor = (priority: TaskPriority): string => {
    switch (priority) {
      case 'LOW': return '#6B7280';
      case 'MEDIUM': return '#3B82F6';
      case 'HIGH': return '#F59E0B';
      case 'URGENT': return '#EF4444';
      default: return '#3B82F6';
    }
  };

  const getPriorityIcon = (priority: TaskPriority): string => {
    switch (priority) {
      case 'LOW': return 'arrow-down';
      case 'MEDIUM': return 'remove';
      case 'HIGH': return 'arrow-up';
      case 'URGENT': return 'warning';
      default: return 'remove';
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
                <Text style={styles.modalTitle}>Create Task</Text>
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
                        placeholder="Enter task title"
                        placeholderTextColor="#9CA3AF"
                        returnKeyType="next"
                        onSubmitEditing={() => descriptionInputRef.current?.focus()}
                      />
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Description *</Text>
                      <TextInput
                        ref={descriptionInputRef}
                        style={[styles.input, styles.textArea]}
                        value={description}
                        onChangeText={setDescription}
                        placeholder="Enter task description"
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
                      <Text style={styles.label}>Priority</Text>
                      <View style={styles.priorityContainer}>
                        {(['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as TaskPriority[]).map((p) => (
                          <TouchableOpacity
                            key={p}
                            style={[
                              styles.priorityButton,
                              priority === p && { 
                                backgroundColor: getPriorityColor(p),
                                borderColor: getPriorityColor(p)
                              }
                            ]}
                            onPress={() => setPriority(p)}
                          >
                            <Icon 
                              name={getPriorityIcon(p)} 
                              size={16} 
                              color={priority === p ? '#fff' : getPriorityColor(p)} 
                            />
                            <Text style={[
                              styles.priorityText,
                              priority === p && { color: '#fff' }
                            ]}>
                              {p}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Due Date *</Text>
                      <TouchableOpacity
                        style={styles.datePickerButton}
                        onPress={() => setShowDatePicker(true)}
                      >
                        <Icon name="calendar" size={20} color="#6B7280" />
                        <Text style={styles.datePickerText}>
                          {dueDate 
                            ? dueDate.toLocaleString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })
                            : 'Select due date and time'
                          }
                        </Text>
                        <Icon name="chevron-down" size={20} color="#6B7280" />
                      </TouchableOpacity>
                      <Text style={styles.helpText}>
                        Select when this task should be completed
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
                    <Text style={styles.submitText}>Create Task</Text>
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
                    Task Created Successfully!
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
          setDueDate(date);
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
  priorityContainer: {
    flexDirection: 'row',
    gap: 8
  },
  priorityButton: {
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
  priorityText: {
    fontSize: 12,
    fontWeight: '500'
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
  }
}); 