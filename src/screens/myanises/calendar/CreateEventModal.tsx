import React, { useState, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  TouchableWithoutFeedback
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { calendarApi } from '../../../services/calendarApi';

interface CreateEventModalProps {
  visible: boolean;
  onClose: () => void;
  daoAddress: string;
}

export const CreateEventModal: React.FC<CreateEventModalProps> = ({
  visible,
  onClose,
  daoAddress
}) => {
  const [step, setStep] = useState<'form' | 'confirming' | 'success'>('form');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refs for inputs to handle focus
  const descriptionInputRef = useRef<TextInput>(null);
  const locationInputRef = useRef<TextInput>(null);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setLocation('');
    setStartTime(null);
    setEndTime(null);
    setError(null);
    setStep('form');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    // Validation
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    if (!description.trim()) {
      setError('Description is required');
      return;
    }
    if (!location.trim()) {
      setError('Location is required');
      return;
    }
    if (!startTime) {
      setError('Start time is required');
      return;
    }
    if (!endTime) {
      setError('End time is required');
      return;
    }
    if (startTime >= endTime) {
      setError('End time must be after start time');
      return;
    }

    setError(null);
    setStep('confirming');

    try {
      await calendarApi.createEvent(
        daoAddress,
        title.trim(),
        description.trim(),
        location.trim(),
        startTime,
        endTime
      );
      setStep('success');
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (error) {
      console.error('Error creating event:', error);
      setError(error instanceof Error ? error.message : 'Failed to create event');
      setStep('form');
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior="padding"
      >
        <TouchableWithoutFeedback onPress={handleClose}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Create Event</Text>
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
                        placeholder="Enter event title"
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
                        placeholder="Enter event description"
                        placeholderTextColor="#9CA3AF"
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                        returnKeyType="next"
                        onSubmitEditing={() => locationInputRef.current?.focus()}
                      />
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Location *</Text>
                      <TextInput
                        ref={locationInputRef}
                        style={styles.input}
                        value={location}
                        onChangeText={setLocation}
                        placeholder="Enter event location"
                        placeholderTextColor="#9CA3AF"
                        returnKeyType="done"
                        onSubmitEditing={() => {
                          // Close keyboard
                        }}
                      />
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Start Time *</Text>
                      <TouchableOpacity
                        style={styles.datePickerButton}
                        onPress={() => setShowStartDatePicker(true)}
                      >
                        <Icon name="time" size={20} color="#6B7280" />
                        <Text style={styles.datePickerText}>
                          {startTime
                            ? startTime.toLocaleString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })
                            : 'Select start time'
                          }
                        </Text>
                        <Icon name="chevron-down" size={20} color="#6B7280" />
                      </TouchableOpacity>
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>End Time *</Text>
                      <TouchableOpacity
                        style={styles.datePickerButton}
                        onPress={() => setShowEndDatePicker(true)}
                      >
                        <Icon name="time" size={20} color="#6B7280" />
                        <Text style={styles.datePickerText}>
                          {endTime
                            ? endTime.toLocaleString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })
                            : 'Select end time'
                          }
                        </Text>
                        <Icon name="chevron-down" size={20} color="#6B7280" />
                      </TouchableOpacity>
                    </View>

                    {error && (
                      <Text style={styles.errorText}>{error}</Text>
                    )}
                  </ScrollView>

                  <TouchableOpacity
                    style={styles.submitButton}
                    onPress={handleSubmit}
                  >
                    <Text style={styles.submitText}>Create Event</Text>
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
                    Event Created Successfully!
                  </Text>
                </View>
              )}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      {/* Start Time Picker Modal */}
      <DateTimePickerModal
        isVisible={showStartDatePicker}
        mode="datetime"
        onConfirm={(date) => {
          setStartTime(date);
          setShowStartDatePicker(false);
        }}
        onCancel={() => setShowStartDatePicker(false)}
        minimumDate={new Date()}
      />

      {/* End Time Picker Modal */}
      <DateTimePickerModal
        isVisible={showEndDatePicker}
        mode="datetime"
        onConfirm={(date) => {
          setEndTime(date);
          setShowEndDatePicker(false);
        }}
        onCancel={() => setShowEndDatePicker(false)}
        minimumDate={startTime || new Date()}
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
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
    fontWeight: '600',
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
    fontWeight: '500',
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
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff'
  },
  datePickerText: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    marginLeft: 8
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    marginTop: 8
  },
  submitButton: {
    backgroundColor: '#2563EB',
    borderRadius: 8,
    padding: 16,
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