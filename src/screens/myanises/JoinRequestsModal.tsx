import React, { useEffect, useState } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, ActivityIndicator, Alert, StyleSheet, Linking } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getJoinRequests, getJoinRequest, acceptJoinRequest, rejectJoinRequest } from '../../services/memberApi';
import { API_BASE_URL } from '../../utils/api';
import { ethers } from 'ethers';
import { walletConnectService } from '../../../wallet/walletConnectInstance';
import MemberModuleAbi from '../../services/abis/MemberModule.json';

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
  onRequestProcessed?: () => void;
}

export const JoinRequestsModal: React.FC<Props> = ({ visible, onClose, daoAddress, onRequestProcessed }) => {
  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingRequest, setProcessingRequest] = useState<string | null>(null);
  const [showWalletAddress, setShowWalletAddress] = useState<string | null>(null);

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

  const handleAccept = async (request: JoinRequest) => {
    try {
      setProcessingRequest(request.memberAddress);

      // 1. Check if WalletConnect is connected
      if (!walletConnectService.isConnected()) {
        throw new Error('Please connect your wallet first');
      }

      // 2. Prepare the transaction
      const tx = {
        to: daoAddress,
        data: new ethers.Interface(MemberModuleAbi.abi).encodeFunctionData('acceptRequest', [
          request.memberAddress,
          1 // Member role
        ])
      };

      // 3. Send the transaction (this will trigger the MetaMask deeplink)
      console.log('Accepting join request for:', request.memberAddress);
      
      // Try to open MetaMask app
      try {
        await Linking.openURL('metamask://');
      } catch (e) {
        console.log('Could not open MetaMask:', e);
      }
      
      const txHash = await walletConnectService.sendTransaction(tx) as string;
      console.log('Transaction sent:', txHash);

      // 4. Update backend
      await acceptJoinRequest(daoAddress, request.memberAddress, txHash);

      // 5. Refresh the list
              await fetchJoinRequests();
        
        // Call the callback to update the count
        if (onRequestProcessed) {
          onRequestProcessed();
        }
        
        Alert.alert(
          'Success',
          'Join request accepted successfully',
          [{ text: 'OK' }]
        );
    } catch (err: any) {
      console.error('Error accepting join request:', err);
      Alert.alert(
        'Error',
        err.message || 'Failed to accept join request',
        [{ text: 'OK' }]
      );
    } finally {
      setProcessingRequest(null);
    }
  };

  const handleReject = async (request: JoinRequest) => {
    try {
      setProcessingRequest(request.memberAddress);

      // 1. Check if WalletConnect is connected
      if (!walletConnectService.isConnected()) {
        throw new Error('Please connect your wallet first');
      }

      // 2. Prepare the transaction
      const tx = {
        to: daoAddress,
        data: new ethers.Interface(MemberModuleAbi.abi).encodeFunctionData('rejectRequest', [
          request.memberAddress
        ])
      };

      // 3. Send the transaction (this will trigger the MetaMask deeplink)
      console.log('Rejecting join request for:', request.memberAddress);
      
      // Try to open MetaMask app
      try {
        await Linking.openURL('metamask://');
      } catch (e) {
        console.log('Could not open MetaMask:', e);
      }
      
      const txHash = await walletConnectService.sendTransaction(tx) as string;
      console.log('Transaction sent:', txHash);

      // 4. Update backend
      await rejectJoinRequest(daoAddress, request.memberAddress, txHash);

      // 5. Refresh the list
              await fetchJoinRequests();
        
        // Call the callback to update the count
        if (onRequestProcessed) {
          onRequestProcessed();
        }
        
        Alert.alert(
          'Success',
          'Join request rejected successfully',
          [{ text: 'OK' }]
        );
    } catch (err: any) {
      console.error('Error rejecting join request:', err);
      Alert.alert(
        'Error',
        err.message || 'Failed to reject join request',
        [{ text: 'OK' }]
      );
    } finally {
      setProcessingRequest(null);
    }
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
                    <View style={styles.nameDateContainer}>
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
                    <TouchableOpacity 
                      style={styles.infoButton}
                      onPress={() => setShowWalletAddress(
                        showWalletAddress === request.memberAddress ? null : request.memberAddress
                      )}
                    >
                      <Icon name="information-circle-outline" size={20} color="#2563eb" />
                    </TouchableOpacity>
                  </View>
                  
                  {showWalletAddress === request.memberAddress && (
                    <View style={styles.addressRow}>
                      <Text style={styles.addressLabel}>Wallet:</Text>
                      <Text style={styles.addressValue}>{request.memberAddress}</Text>
                    </View>
                  )}

                  <View style={styles.buttonContainer}>
                    <TouchableOpacity
                      style={[
                        styles.actionButton,
                        styles.acceptButton,
                        processingRequest === request.memberAddress && styles.processingButton
                      ]}
                      onPress={() => handleAccept(request)}
                      disabled={processingRequest === request.memberAddress}
                    >
                      <Text style={styles.actionButtonText}>
                        {processingRequest === request.memberAddress ? 'Processing...' : 'Accept'}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.rejectButton]}
                      onPress={() => handleReject(request)}
                      disabled={processingRequest === request.memberAddress}
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
  nameDateContainer: {
    flex: 1,
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
  infoButton: {
    padding: 4,
  },
  addressRow: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  addressLabel: {
    color: '#6B7280',
    marginBottom: 4,
    fontSize: 12,
    fontWeight: '500',
  },
  addressValue: {
    color: '#111827',
    fontFamily: 'monospace',
    fontSize: 12,
    flexWrap: 'wrap',
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
  processingButton: {
    opacity: 0.7
  }
}); 