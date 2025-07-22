import React, { useEffect, useState } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getJoinRequests, getJoinRequest } from '../../services/memberApi';
import { API_BASE_URL } from '../../utils/api';

interface JoinRequest {
  memberAddress: string;
  requestedAt: { _seconds: number };
  uid?: string;  // Make uid optional since we might get it from members collection
  status: 'pending';
  txHash: string;
  userDetails?: {
    firstName: string;
    lastName: string;
  };
}

interface Props {
  visible: boolean;
  onClose: () => void;
  daoAddress: string;
}

export const JoinRequestsModal: React.FC<Props> = ({ visible, onClose, daoAddress }) => {
  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      fetchJoinRequests();
    }
  }, [visible]);

  const fetchUserDetails = async (memberAddress: string): Promise<{ firstName: string; lastName: string } | null> => {
    try {
      console.log(`Fetching user details for member ${memberAddress} in DAO ${daoAddress}`);
      
      // Get join request data which includes uid
      const joinRequestData = await getJoinRequest(daoAddress, memberAddress);
      console.log('Join request data:', joinRequestData);
      
      if (joinRequestData.uid) {
        // Then get user details using the uid
        const userUrl = `${API_BASE_URL}/api/auth/users/${joinRequestData.uid}`;
        console.log('Fetching user data from:', userUrl);
        
        const userResponse = await fetch(userUrl, {
          headers: { 'Authorization': `Bearer ${await AsyncStorage.getItem('idToken')}` }
        });
        
        console.log('User response status:', userResponse.status);
        if (userResponse.ok) {
          const userData = await userResponse.json();
          console.log('User data:', userData);
          return {
            firstName: userData.firstName,
            lastName: userData.lastName
          };
        } else {
          console.log('Failed to fetch user data:', await userResponse.text());
        }
      } else {
        console.log('No uid found in join request data');
      }
      return null;
    } catch (err) {
      console.error('Failed to fetch user details:', err);
      return null;
    }
  };

  const fetchJoinRequests = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch join requests using the API service
      const joinRequests = await getJoinRequests(daoAddress);

      // For each request, fetch user details
      const requestsWithDetails = await Promise.all(
        joinRequests.map(async (request: JoinRequest) => {
          const userDetails = await fetchUserDetails(request.memberAddress);
          return {
            ...request,
            userDetails: userDetails || undefined
          };
        })
      );

      setRequests(requestsWithDetails);
    } catch (err: any) {
      console.error('Error fetching join requests:', err);
      setError(err.message || 'Failed to load join requests');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = (request: JoinRequest) => {
    Alert.alert(
      'Not Implemented',
      'Accept functionality coming soon!',
      [{ text: 'OK' }]
    );
  };

  const handleReject = (request: JoinRequest) => {
    Alert.alert(
      'Not Implemented',
      'Reject functionality coming soon!',
      [{ text: 'OK' }]
    );
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Join Requests</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView style={styles.modalBody}>
            {loading ? (
              <ActivityIndicator size="large" color="#2563eb" style={styles.loader} />
            ) : error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={fetchJoinRequests}>
                  <Text style={styles.retryButtonText}>Try Again</Text>
                </TouchableOpacity>
              </View>
            ) : requests.length === 0 ? (
              <Text style={styles.emptyText}>No pending join requests</Text>
            ) : (
              requests.map((request, index) => (
                <View key={request.memberAddress} style={styles.requestCard}>
                  <View style={styles.requestHeader}>
                    <Text style={styles.userName}>
                      {request.userDetails ? 
                        `${request.userDetails.firstName} ${request.userDetails.lastName}` :
                        `${request.memberAddress.slice(0, 6)}...${request.memberAddress.slice(-4)}`
                      }
                    </Text>
                    <Text style={styles.requestDate}>
                      {new Date(request.requestedAt._seconds * 1000).toLocaleDateString()}
                    </Text>
                  </View>
                  
                  <View style={styles.addressRow}>
                    <Text style={styles.addressLabel}>Wallet:</Text>
                    <Text style={styles.addressValue}>{request.memberAddress}</Text>
                  </View>

                  <View style={styles.buttonContainer}>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.acceptButton]}
                      onPress={() => handleAccept(request)}
                    >
                      <Text style={styles.actionButtonText}>Accept</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.rejectButton]}
                      onPress={() => handleReject(request)}
                    >
                      <Text style={styles.actionButtonText}>Reject</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </ScrollView>
        </View>
      </View>
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
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
  },
  loader: {
    marginTop: 40,
  },
  errorContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  errorText: {
    color: '#EF4444',
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  retryButtonText: {
    color: '#fff',
  },
  emptyText: {
    textAlign: 'center',
    color: '#6B7280',
    fontSize: 16,
    marginTop: 40,
  },
  requestCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  requestDate: {
    color: '#6B7280',
    fontSize: 14,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  addressLabel: {
    color: '#6B7280',
    marginRight: 8,
  },
  addressValue: {
    color: '#111827',
    fontFamily: 'monospace',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: '#2563eb',
  },
  rejectButton: {
    backgroundColor: '#EF4444',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
}); 