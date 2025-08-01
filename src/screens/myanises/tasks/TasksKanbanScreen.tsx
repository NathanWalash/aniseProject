import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  RefreshControl, Alert, ActivityIndicator
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import { listTasks, updateTaskStatus, Task } from '../../../services/taskApi';
import { TaskCard } from './TaskCard';
import { API_BASE_URL, getAuthHeaders } from '../../../utils/api';
import { walletConnectService } from '../../../../wallet/walletConnectInstance';

interface TasksKanbanScreenProps {
  route: {
    params: {
      daoAddress: string;
    };
  };
  navigation: any;
}

type TaskStatus = 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

interface KanbanColumn {
  status: TaskStatus;
  title: string;
  color: string;
  icon: string;
}

const KANBAN_COLUMNS: KanbanColumn[] = [
  { status: 'BACKLOG', title: 'Backlog', color: '#6B7280', icon: 'list' },
  { status: 'TODO', title: 'To Do', color: '#3B82F6', icon: 'checkbox-outline' },
  { status: 'IN_PROGRESS', title: 'In Progress', color: '#F59E0B', icon: 'play' },
  { status: 'COMPLETED', title: 'Completed', color: '#059669', icon: 'checkmark-circle' },
  { status: 'CANCELLED', title: 'Cancelled', color: '#EF4444', icon: 'close-circle' }
];

export const TasksKanbanScreen: React.FC<TasksKanbanScreenProps> = ({ route, navigation }) => {
  const { daoAddress } = route.params;
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [creatorNames, setCreatorNames] = useState<Record<string, string>>({});
  const [currentUserAddress, setCurrentUserAddress] = useState<string | null>(null);

  const loadTasks = useCallback(async () => {
    try {
      setLoading(true);
      const result = await listTasks(daoAddress);
      setTasks(result.tasks || []);
    } catch (error: any) {
      console.error('Error loading tasks:', error);
      Alert.alert('Error', error.message || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [daoAddress]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadTasks();
    setRefreshing(false);
  }, [loadTasks]);

  useFocusEffect(
    useCallback(() => {
      loadTasks();
    }, [loadTasks])
  );

  // Fetch creator names when tasks change
  useEffect(() => {
    const fetchCreatorNames = async () => {
      console.log('Fetching creator names for tasks:', tasks);
      const newCreatorNames: Record<string, string> = {};
      const uniqueCreators = new Set(tasks.map(task => task.createdBy).filter(Boolean));
      console.log('Unique creators:', Array.from(uniqueCreators));
      
      try {
        const headers = await getAuthHeaders();
        
        for (const uid of uniqueCreators) {
          try {
            console.log('Fetching name for creator:', uid);
            const res = await fetch(`${API_BASE_URL}/api/auth/users/${uid}`, { headers });
            const data = await res.json();
            console.log('Creator data response:', data);
            if (res.ok) {
              newCreatorNames[uid] = `${data.firstName} ${data.lastName}`;
            }
          } catch (err) {
            console.error('Error fetching creator name:', err);
          }
        }
        console.log('Final creator names:', newCreatorNames);
        setCreatorNames(newCreatorNames);
      } catch (err) {
        console.error('Error getting auth headers:', err);
      }
    };

    if (tasks.length > 0) {
      fetchCreatorNames();
    }
  }, [tasks]);

  // Get current wallet address for checking if user is creator
  useEffect(() => {
    if (walletConnectService.isConnected() && walletConnectService.session?.namespaces?.eip155?.accounts[0]) {
      const address = walletConnectService.session.namespaces.eip155.accounts[0].split(':').pop();
      if (address) setCurrentUserAddress(address.toLowerCase());
    }
  }, []);

  const handleStatusChange = async (taskId: string, newStatus: number) => {
    try {
      setUpdatingStatus(taskId);
      
      await updateTaskStatus(daoAddress, taskId, newStatus);
      
      // Refresh tasks after status update
      await loadTasks();
      
    } catch (error: any) {
      console.error('Error updating task status:', error);
      Alert.alert('Error', error.message || 'Failed to update task status');
      // Reset the updating status on error so modal can be closed
      setUpdatingStatus(null);
    }
  };

  const handleStatusChangeSuccess = () => {
    // This will be called when the modal shows success
    console.log('Task status updated successfully');
  };

  const getTasksByStatus = (status: TaskStatus): Task[] => {
    return tasks.filter(task => task.status === status);
  };



  const isTaskCreator = (task: Task): boolean => {
    if (!currentUserAddress) return false;
    return task.creator.toLowerCase() === currentUserAddress.toLowerCase();
  };



  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Loading tasks...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Task Management</Text>
      </View>

      {/* Kanban Board */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.kanbanContainer}
        contentContainerStyle={styles.kanbanContent}
      >
        {KANBAN_COLUMNS.map((column) => {
          const columnTasks = getTasksByStatus(column.status);
          
          return (
            <View key={column.status} style={styles.column}>
              {/* Column Header */}
              <View style={styles.columnHeader}>
                <View style={styles.columnTitleContainer}>
                  <Icon name={column.icon} size={16} color={column.color} />
                  <Text style={[styles.columnTitle, { color: column.color }]}>
                    {column.title}
                  </Text>
                </View>
                <View style={styles.taskCount}>
                  <Text style={styles.taskCountText}>{columnTasks.length}</Text>
                </View>
              </View>

              {/* Column Content */}
              <ScrollView
                style={styles.columnContent}
                showsVerticalScrollIndicator={false}
                nestedScrollEnabled={true}
              >
                                 {columnTasks.map((task) => (
                   <TaskCard
                     key={task.taskId}
                     task={task}
                     onStatusChange={handleStatusChange}
                     isCreator={isTaskCreator(task)}
                     creatorName={task.createdBy ? creatorNames[task.createdBy] : undefined}
                     isUpdating={updatingStatus === task.taskId}
                     onSuccess={handleStatusChangeSuccess}
                   />
                 ))}
                
                {columnTasks.length === 0 && (
                  <View style={styles.emptyColumn}>
                    <Icon name="document-outline" size={24} color="#9CA3AF" />
                    <Text style={styles.emptyText}>No tasks</Text>
                  </View>
                )}
              </ScrollView>
            </View>
          );
        })}
      </ScrollView>

      {/* Pull to refresh */}
      <RefreshControl
        refreshing={refreshing}
        onRefresh={onRefresh}
        colors={['#2563eb']}
        tintColor="#2563eb"
      />


    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB'
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB'
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827'
  },
  kanbanContainer: {
    flex: 1
  },
  kanbanContent: {
    padding: 16
  },
  column: {
    width: 280,
    marginRight: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2
  },
  columnHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6'
  },
  columnTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  columnTitle: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase'
  },
  taskCount: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4
  },
  taskCountText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280'
  },
  columnContent: {
    flex: 1,
    padding: 12
  },
  emptyColumn: {
    alignItems: 'center',
    padding: 32,
    opacity: 0.5
  },
  emptyText: {
    marginTop: 8,
    fontSize: 14,
    color: '#9CA3AF'
  }
}); 