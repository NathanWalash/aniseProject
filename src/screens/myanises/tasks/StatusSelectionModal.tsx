import React, { useState } from 'react';
import { 
  View, Text, Modal, TouchableOpacity, StyleSheet,
  TouchableWithoutFeedback, ActivityIndicator
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

interface StatusSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  currentStatus: string;
  onStatusSelect: (status: number) => void;
  isUpdating?: boolean;
  onSuccess?: () => void;
}

const STATUS_OPTIONS = [
  { value: 0, label: 'Backlog', color: '#6B7280', icon: 'list' },
  { value: 1, label: 'To Do', color: '#3B82F6', icon: 'checkbox-outline' },
  { value: 2, label: 'In Progress', color: '#F59E0B', icon: 'play' },
  { value: 3, label: 'Completed', color: '#059669', icon: 'checkmark-circle' },
  { value: 4, label: 'Cancelled', color: '#EF4444', icon: 'close-circle' }
];

export const StatusSelectionModal: React.FC<StatusSelectionModalProps> = ({
  visible,
  onClose,
  currentStatus,
  onStatusSelect,
  isUpdating = false,
  onSuccess
}) => {
  const [step, setStep] = useState<'select' | 'confirming' | 'success'>('select');
  const [selectedStatus, setSelectedStatus] = useState<number | null>(null);

  const getStatusNumber = (status: string): number => {
    switch (status) {
      case 'BACKLOG': return 0;
      case 'TODO': return 1;
      case 'IN_PROGRESS': return 2;
      case 'COMPLETED': return 3;
      case 'CANCELLED': return 4;
      default: return 0;
    }
  };

  const getStatusLabel = (statusNumber: number): string => {
    switch (statusNumber) {
      case 0: return 'Backlog';
      case 1: return 'To Do';
      case 2: return 'In Progress';
      case 3: return 'Completed';
      case 4: return 'Cancelled';
      default: return 'Unknown';
    }
  };

  const currentStatusNumber = getStatusNumber(currentStatus);

  const handleStatusSelect = (status: number) => {
    if (status === currentStatusNumber) return;
    setSelectedStatus(status);
    setStep('confirming');
    onStatusSelect(status);
  };

  // Watch for isUpdating changes to show success
  React.useEffect(() => {
    if (!isUpdating && step === 'confirming' && selectedStatus !== null) {
      // Only show success if we were actually updating (transaction succeeded)
      setStep('success');
      setTimeout(() => {
        if (onSuccess) onSuccess();
        handleClose();
      }, 2000);
    }
  }, [isUpdating, step, selectedStatus, onSuccess]);

  // Reset modal when it opens
  React.useEffect(() => {
    if (visible) {
      setStep('select');
      setSelectedStatus(null);
    }
  }, [visible]);

  const handleClose = () => {
    setStep('select');
    setSelectedStatus(null);
    onClose();
  };

  const resetModal = () => {
    setStep('select');
    setSelectedStatus(null);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={styles.modalContent}>
              {step === 'select' && (
                <>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Change Task Status</Text>
                    <TouchableOpacity onPress={handleClose}>
                      <Icon name="close" size={24} color="#64748b" />
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.currentStatus}>
                    Current Status: <Text style={styles.currentStatusBold}>{currentStatus.replace('_', ' ')}</Text>
                  </Text>

                  <View style={styles.statusOptions}>
                    {STATUS_OPTIONS.map((option) => (
                      <TouchableOpacity
                        key={option.value}
                        style={[
                          styles.statusOption,
                          currentStatusNumber === option.value && styles.selectedStatus
                        ]}
                        onPress={() => handleStatusSelect(option.value)}
                      >
                        <Icon 
                          name={option.icon} 
                          size={20} 
                          color={currentStatusNumber === option.value ? '#fff' : option.color} 
                        />
                        <Text style={[
                          styles.statusLabel,
                          { color: currentStatusNumber === option.value ? '#fff' : option.color }
                        ]}>
                          {option.label}
                        </Text>
                        {currentStatusNumber === option.value && (
                          <Icon name="checkmark" size={20} color="#fff" />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
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
                  {selectedStatus !== null && (
                    <Text style={styles.statusChangeText}>
                      Changing to: {getStatusLabel(selectedStatus)}
                    </Text>
                  )}
                </View>
              )}

              {step === 'success' && (
                <View style={styles.successContainer}>
                  <Icon name="checkmark-circle" size={48} color="#059669" />
                  <Text style={styles.successText}>
                    Status Updated Successfully!
                  </Text>
                  {selectedStatus !== null && (
                    <Text style={styles.successSubtext}>
                      Task is now: {getStatusLabel(selectedStatus)}
                    </Text>
                  )}
                </View>
              )}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '85%',
    maxWidth: 400
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827'
  },
  currentStatus: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
    textAlign: 'center'
  },
  currentStatusBold: {
    fontWeight: '600',
    color: '#111827'
  },
  statusOptions: {
    gap: 12
  },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#fff',
    gap: 12
  },
  selectedStatus: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB'
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1
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
    textAlign: 'center',
    marginBottom: 16
  },
  statusChangeText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2563EB',
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
  successSubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8
  }
}); 