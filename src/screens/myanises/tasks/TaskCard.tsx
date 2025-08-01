import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Task } from '../../../services/taskApi';
import { StatusSelectionModal } from './StatusSelectionModal';

interface TaskCardProps {
  task: Task;
  onStatusChange: (taskId: string, newStatus: number) => void;
  isCreator: boolean;
  creatorName?: string;
  isUpdating?: boolean;
  onSuccess?: () => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onStatusChange, isCreator, creatorName, isUpdating = false, onSuccess }) => {
  const [showStatusModal, setShowStatusModal] = useState(false);

  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'LOW': return '#6B7280';
      case 'MEDIUM': return '#3B82F6';
      case 'HIGH': return '#F59E0B';
      case 'URGENT': return '#EF4444';
      default: return '#3B82F6';
    }
  };

  const getPriorityIcon = (priority: string): string => {
    switch (priority) {
      case 'LOW': return 'arrow-down';
      case 'MEDIUM': return 'remove';
      case 'HIGH': return 'arrow-up';
      case 'URGENT': return 'warning';
      default: return 'remove';
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'BACKLOG': return '#6B7280';
      case 'TODO': return '#3B82F6';
      case 'IN_PROGRESS': return '#F59E0B';
      case 'COMPLETED': return '#059669';
      case 'CANCELLED': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getStatusIcon = (status: string): string => {
    switch (status) {
      case 'BACKLOG': return 'list';
      case 'TODO': return 'checkbox-outline';
      case 'IN_PROGRESS': return 'play';
      case 'COMPLETED': return 'checkmark-circle';
      case 'CANCELLED': return 'close-circle';
      default: return 'list';
    }
  };

  const handleStatusChange = (newStatus: number) => {
    if (!isCreator) {
      Alert.alert('Permission Denied', 'Only the task creator can change the status.');
      return;
    }

    onStatusChange(task.taskId, newStatus);
  };

  const formatDate = (timestamp: { _seconds: number; _nanoseconds: number }) => {
    const date = new Date(timestamp._seconds * 1000);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isOverdue = () => {
    const dueDate = new Date(task.dueDate._seconds * 1000);
    const now = new Date();
    return dueDate < now && task.status !== 'COMPLETED' && task.status !== 'CANCELLED';
  };

  return (
    <View style={styles.card}>
      {/* Header with priority */}
      <View style={styles.header}>
        <View style={styles.priorityContainer}>
          <Icon 
            name={getPriorityIcon(task.priority)} 
            size={12} 
            color={getPriorityColor(task.priority)} 
          />
          <Text style={[styles.priorityText, { color: getPriorityColor(task.priority) }]}>
            {task.priority}
          </Text>
        </View>
        <View style={styles.statusContainer}>
          <Icon 
            name={getStatusIcon(task.status)} 
            size={12} 
            color={getStatusColor(task.status)} 
          />
          <Text style={[styles.statusText, { color: getStatusColor(task.status) }]}>
            {task.status.replace('_', ' ')}
          </Text>
        </View>
      </View>

      {/* Title */}
      <Text style={styles.title} numberOfLines={2}>
        {task.title}
      </Text>

      {/* Description */}
      <Text style={styles.description} numberOfLines={3}>
        {task.description}
      </Text>

      {/* Due date */}
      <View style={styles.dueDateContainer}>
        <Icon name="time-outline" size={14} color="#6B7280" />
        <Text style={[
          styles.dueDateText,
          isOverdue() && styles.overdueText
        ]}>
          Due: {formatDate(task.dueDate)}
          {isOverdue() && ' (OVERDUE)'}
        </Text>
      </View>

      {/* Creator */}
      <View style={styles.creatorContainer}>
        <Icon name="person-outline" size={14} color="#6B7280" />
        <Text style={styles.creatorText}>
          {creatorName || `${task.creator.slice(0, 6)}...${task.creator.slice(-4)}`}
        </Text>
      </View>

      {/* Status change button */}
      {isCreator && (
        <TouchableOpacity
          style={styles.changeStatusButton}
          onPress={() => setShowStatusModal(true)}
        >
          <Icon name="settings-outline" size={16} color="#2563EB" />
          <Text style={styles.changeStatusText}>Change Status</Text>
        </TouchableOpacity>
      )}

      {/* Status Selection Modal */}
      <StatusSelectionModal
        visible={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        currentStatus={task.status}
        onStatusSelect={handleStatusChange}
        isUpdating={isUpdating}
        onSuccess={onSuccess}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  priorityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase'
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase'
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
    lineHeight: 20
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
    lineHeight: 18
  },
  dueDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8
  },
  dueDateText: {
    fontSize: 12,
    color: '#6B7280'
  },
  overdueText: {
    color: '#EF4444',
    fontWeight: '600'
  },
  creatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12
  },
  creatorText: {
    fontSize: 12,
    color: '#6B7280'
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderRadius: 6,
    gap: 4
  },
  previousButton: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB'
  },
  nextButton: {
    backgroundColor: '#2563EB'
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '500'
  },
  changeStatusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    gap: 8,
    marginTop: 8
  },
  changeStatusText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2563EB'
  }
}); 