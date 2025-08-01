// src/screens/ProfileScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, Alert, SafeAreaView, ActivityIndicator, TextInput, Image, Linking, LayoutAnimation } from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { walletConnectService } from '../../../wallet/walletConnectInstance';
import { connectAndLinkWallet, getWalletAddress } from '../../services/walletApi';
import { API_BASE_URL } from '../../utils/api';
import { TokenBalanceCard } from './components/TokenBalanceCard';
import { getUserTokenBalance } from '../../services/blockchainService';
import { getContractAddress } from '../../utils/contractAddresses';
import Icon from 'react-native-vector-icons/Ionicons';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import DatePicker from 'react-native-date-picker';
import { startRedirectFlow } from '../../services/gocardlessApi';

interface Profile {
  uid: string;
  email: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  wallet?: {
    address: string;
  };
  gocardless?: {
    mandate_id: string;
  };
}

interface ProfileScreenProps {
  onLogout: () => void;
}

// Fetch user profile from backend using ID token
type UserProfile = {
  gocardless?: {
    mandate_id?: string;
    customer_id?: string;
    linked_at?: string;
  };
  // ...other fields
};

async function fetchUserProfile(): Promise<UserProfile | null> {
  try {
    const idToken = await AsyncStorage.getItem('idToken');
    if (!idToken) throw new Error('No auth token found');
    const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
      headers: {
        'Authorization': `Bearer ${idToken}`,
        'Content-Type': 'application/json',
      },
    });
    if (!res.ok) throw new Error('Failed to fetch profile');
    return await res.json();
  } catch (err) {
    console.error('Failed to fetch user profile:', err);
    return null;
  }
}

export default function ProfileScreen({ onLogout }: ProfileScreenProps) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<{ message: string; error?: boolean } | null>(null);
  // Profile edit
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dob, setDob] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  // Email
  const [newEmail, setNewEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [savingEmail, setSavingEmail] = useState(false);
  // Password
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const navigation = useNavigation() as any; // TODO: use proper navigation typing
  const [mandateId, setMandateId] = useState<string | null>(null);
  const [loadingMandate, setLoadingMandate] = useState(false);
  const isFocused = useIsFocused();
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showEmail, setShowEmail] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [avatarUri, setAvatarUri] = useState<string | null>(null); // Placeholder for real avatar
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickerDate, setPickerDate] = useState(dob ? new Date(dob) : new Date(2000, 0, 1));
  const isExpoGo = Constants.appOwnership === 'expo';
  const isIOS = Platform.OS === 'ios';

  // WalletConnect state
  const [walletConnected, setWalletConnected] = useState(walletConnectService.isConnected());
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [walletLoading, setWalletLoading] = useState(false);
  const [walletError, setWalletError] = useState<string | null>(null);
  const [showReconnectPrompt, setShowReconnectPrompt] = useState(false);
  const [tokenBalance, setTokenBalance] = useState<string | null>(null);
  const [tokenBalanceLoading, setTokenBalanceLoading] = useState(false);
  const [tokenBalanceError, setTokenBalanceError] = useState<string | null>(null);
  const [selectedDao, setSelectedDao] = useState<string | null>(null);

  // Assume userId is available from props or app state
  const userId = profile?.uid || '';

  // Helper to get wallet address from session
  const getWalletAddressFromSession = (): string => {
    if (walletConnectService.session && walletConnectService.session.namespaces?.eip155?.accounts?.length) {
      const full = walletConnectService.session.namespaces.eip155.accounts[0];
      const addr = full.split(":").pop();
      return typeof addr === 'string' ? addr : '';
    }
    return '';
  };

  // Defensive WalletConnect initialization
  const ensureWalletInit = async () => {
    if (!walletConnectService.client) {
      await walletConnectService.init();
    }
  };

  const handleConnectWallet = async () => {
    setWalletLoading(true);
    setWalletError(null);
    try {
      if (!profile?.uid) throw new Error('User ID not found.');
      // Step 1: Connect wallet if not already connected
      if (!walletConnectService.isConnected()) {
        await walletConnectService.init();
        const { uri } = await walletConnectService.connect();
        if (!uri) throw new Error('No WalletConnect URI generated');
        // Visually distinct popup for onboarding
        Alert.alert(
          'Connect Wallet',
          'Open MetaMask and approve the connection. After approving, return to the app to continue.',
          [{ text: 'OK', onPress: () => Linking.openURL(uri) }]
        );
        await walletConnectService.approve(); // Wait for approval
      }
      // Step 2: Compare session wallet address to Firestore
      const sessionAddress = await getWalletAddress();
      const linkedAddress = profile.wallet?.address;
      if (linkedAddress && sessionAddress.toLowerCase() !== linkedAddress.toLowerCase()) {
        Alert.alert(
          'Wallet Already Linked',
          'You already have a wallet linked. Please contact support to change it.',
          [{ text: 'OK' }]
        );
        await walletConnectService.disconnect();
        setWalletConnected(false);
        setWalletAddress('');
        return;
      }
      // Step 3: Prompt user to sign the message in MetaMask
      Alert.alert(
        'Signature Required',
        'Return to MetaMask to sign the signature request. After signing, you will return to the app.',
        [{ text: 'Open MetaMask', onPress: () => Linking.openURL('metamask://') }]
      );
      const address = await connectAndLinkWallet(profile.uid);
      setWalletConnected(true);
      setWalletAddress(address);
      setStatus({ message: 'Wallet linked successfully.' });
    } catch (err: any) {
      setWalletError(err.message || 'Failed to connect and link wallet');
      if (err.message && err.message.includes('already have a wallet linked')) {
        await walletConnectService.disconnect();
        setWalletConnected(false);
        setWalletAddress('');
      }
    } finally {
      setWalletLoading(false);
    }
  };

  const handleDisconnectWallet = async () => {
    await ensureWalletInit();
    await walletConnectService.disconnect();
    setWalletConnected(false);
    setWalletAddress('');
  };

  // On mount, restore wallet session if present
  useEffect(() => {
    if (walletConnectService.isConnected()) {
      setWalletConnected(true);
      // Use the utility to get the address from the session
      getWalletAddress().then(addr => setWalletAddress(addr));
    }
    walletConnectService.onSessionDisconnect = () => {
      setWalletConnected(false);
      setWalletAddress('');
      setShowReconnectPrompt(true);
    };
    return () => {
      walletConnectService.onSessionDisconnect = undefined;
    };
  }, []); // Only run on mount

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      const idToken = await AsyncStorage.getItem('idToken');
      if (!idToken) return;
      try {
        const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${idToken}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to fetch profile');
        setProfile(data);
        setFirstName(data.firstName || '');
        setLastName(data.lastName || '');
        setDob(data.dateOfBirth || '');
      } catch (err: any) {
        setStatus({ message: err.message, error: true });
      } finally {
        setLoading(false);
      }
    };
    const unsubscribe = navigation.addListener('focus', fetchProfile);
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    async function fetchMandate() {
      setLoadingMandate(true);
      // Replace with your actual API call or Firestore fetch
      const userProfile = await fetchUserProfile();
      setMandateId(userProfile?.gocardless?.mandate_id || null);
      setLoadingMandate(false);
    }
    fetchMandate();
  }, []);

  useEffect(() => {
    const checkSession = async () => {
      if (walletConnectService.isConnected()) {
        const sessionAddress = await getWalletAddress();
        const linkedAddress = profile?.wallet?.address;
        if (linkedAddress && sessionAddress.toLowerCase() !== linkedAddress.toLowerCase()) {
          // Session address does not match linked address, disconnect
          await walletConnectService.disconnect();
          setWalletConnected(false);
          setWalletAddress('');
          setShowReconnectPrompt(true);
          return;
        }
        setWalletConnected(true);
        setWalletAddress(sessionAddress);
      }
      walletConnectService.onSessionDisconnect = () => {
        setWalletConnected(false);
        setWalletAddress('');
        setShowReconnectPrompt(true);
      };
    };
    checkSession();
    return () => {
      walletConnectService.onSessionDisconnect = undefined;
    };
  }, [profile?.wallet?.address]);

  // Add token balance fetching
  useEffect(() => {
    const fetchTokenBalance = async () => {
      if (!walletConnected || !walletAddress) return;
      
      setTokenBalanceLoading(true);
      setTokenBalanceError(null);
      try {
        const tokenAddress = getContractAddress('Token');
        if (!tokenAddress || tokenAddress === '0x0000000000000000000000000000000000000000') {
          throw new Error('Invalid token contract address');
        }
        const balance = await getUserTokenBalance(tokenAddress, walletAddress);
        setTokenBalance(balance.toString());
      } catch (err: any) {
        console.error('Error fetching token balance:', err);
        setTokenBalanceError(
          err.code === 'CALL_EXCEPTION' ? 'Failed to read from token contract' :
          err.code === 'NETWORK_ERROR' ? 'Network error - please check your connection' :
          err.message || 'Failed to fetch token balance'
        );
      } finally {
        setTokenBalanceLoading(false);
      }
    };

    fetchTokenBalance();
  }, [walletConnected, walletAddress]);

  const handleWithdraw = () => {
    // To be implemented
    Alert.alert('Coming Soon', 'Withdraw functionality will be available soon!');
  };

  const handleLinkGoCardless = async () => {
    try {
      const flowData = await startRedirectFlow();
      // Open the GoCardless redirect URL in browser
      await Linking.openURL(flowData.redirect_url);
      Alert.alert(
        'GoCardless Setup',
        'Complete the direct debit setup in your browser, then return to the app. Your mandate will be automatically linked.',
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      console.error('Error starting GoCardless flow:', error);
      Alert.alert('Error', error.message || 'Failed to start GoCardless linking');
    }
  };

  // Floating label input for modern look
  const FloatingInput = ({ label, value, onChangeText, ...props }: any) => {
    const [focused, setFocused] = useState(false);
    const [localValue, setLocalValue] = useState(value ?? '');
    useEffect(() => { setLocalValue(value ?? ''); }, [value]);
    const showFloating = focused || (localValue && localValue.length > 0);
    return (
      <View style={styles.floatingInputContainer}>
        <Text style={[styles.floatingLabel, showFloating && styles.floatingLabelActive]} pointerEvents="none">{label}</Text>
        <TextInput
          value={localValue}
          onChangeText={setLocalValue}
          onFocus={() => setFocused(true)}
          onEndEditing={() => {
            setFocused(false);
            if (onChangeText) onChangeText(localValue);
          }}
          style={styles.floatingInput}
          {...props}
        />
      </View>
    );
  };

  const saveProfile = async () => {
    setSavingProfile(true);
    setStatus(null);
    const idToken = await AsyncStorage.getItem('idToken');
    if (!idToken) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ firstName, lastName, dateOfBirth: dob }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update profile');
      setStatus({ message: 'Profile updated.' });
      setProfile({ ...profile, firstName, lastName, dateOfBirth: dob, email: profile?.email } as Profile);
      setShowEditProfile(false);
    } catch (err: any) {
      setStatus({ message: err.message, error: true });
    } finally {
      setSavingProfile(false);
    }
  };

  const saveEmail = async () => {
    setStatus(null);
    if (!newEmail.trim() || !currentPassword) {
      setStatus({ message: 'Email + current password required.', error: true });
      return;
    }
    setSavingEmail(true);
    try {
      // TODO: Update user email by calling backend endpoint
      setStatus({ message: 'Email updated. Log back in.' });
      setShowEmail(false);
    } catch (err) {
      setStatus({ message: (err as Error).message, error: true });
    } finally {
      setSavingEmail(false);
    }
  };

  const savePassword = async () => {
    setStatus(null);
    if (newPassword !== confirmPassword || !currentPassword) {
      setStatus({ message: 'Passwords must match + current password.', error: true });
      return;
    }
    setSavingPassword(true);
    try {
      // TODO: Update user password by calling backend endpoint
      setStatus({ message: 'Password updated.' });
      setShowPassword(false);
    } catch (err) {
      setStatus({ message: (err as Error).message, error: true });
    } finally {
      setSavingPassword(false);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('idToken');
    await AsyncStorage.removeItem('refreshToken');
    // Do NOT disconnect wallet or remove WALLETCONNECT_SESSION here
    if (onLogout) onLogout();
  };

  // Animate expand/collapse
  const toggleSection = (setter: (v: boolean) => void, value: boolean) => {
    LayoutAnimation.configureNext(
      Platform.OS === 'ios' ? LayoutAnimation.Presets.easeInEaseOut : LayoutAnimation.create(200, 'easeInEaseOut', 'opacity')
    );
    setter(!value);
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-gray-100">
        <ActivityIndicator size="large" color="#7B68EE" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        

        {/* Profile Card */}
        <View style={styles.card}>
          <View style={styles.avatarWrap}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatarImg} />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarInitials}>{profile?.firstName?.[0] || ''}{profile?.lastName?.[0] || ''}</Text>
              </View>
            )}
            <TouchableOpacity style={styles.avatarEdit} onPress={() => Alert.alert('Avatar', 'Change avatar coming soon!')}>
              <Icon name="camera-outline" size={18} color="#2563eb" />
            </TouchableOpacity>
          </View>
          <Text style={styles.profileName}>{profile?.firstName} {profile?.lastName}</Text>
          <Text style={styles.profileEmail}>{profile?.email}</Text>
          <Text style={styles.profileDob}>DOB: {profile?.dateOfBirth}</Text>
        </View>
        
        {/* Add TokenBalanceCard if wallet is connected */}
        {walletConnected && (
          <TokenBalanceCard
            balance={tokenBalance}
            isLoading={tokenBalanceLoading}
            error={tokenBalanceError}
            onWithdraw={handleWithdraw}
          />
        )}
        
        {/* Edit Profile Section */}
        <View style={styles.card}>
          <TouchableOpacity style={styles.sectionHeaderRow} onPress={() => toggleSection(setShowEditProfile, showEditProfile)}>
            <Text style={styles.cardHeader}>Edit Profile</Text>
            <Icon name={showEditProfile ? 'chevron-up-outline' : 'chevron-down-outline'} size={22} color="#2563eb" />
          </TouchableOpacity>
          {showEditProfile && (
            <View>
              <FloatingInput label="First Name" value={firstName} onChangeText={setFirstName} autoCapitalize="words" />
              <FloatingInput label="Last Name" value={lastName} onChangeText={setLastName} autoCapitalize="words" />
              {/* Date of Birth Picker */}
              <TouchableOpacity
                style={{ borderBottomWidth: 1, borderBottomColor: '#d1d5db', paddingBottom: 8, marginBottom: 18 }}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={{ fontSize: 16, color: dob ? '#000' : '#999' }}>
                  {dob ? dob : 'Date of Birth (YYYY-MM-DD)'}
                </Text>
              </TouchableOpacity>
              {(isExpoGo || isIOS) ? (
                <DateTimePickerModal
                  isVisible={showDatePicker}
                  mode="date"
                  date={pickerDate}
                  maximumDate={new Date()}
                  onConfirm={(date) => {
                    setShowDatePicker(false);
                    setPickerDate(date);
                    const yyyy = date.getFullYear();
                    const mm = String(date.getMonth() + 1).padStart(2, '0');
                    const dd = String(date.getDate()).padStart(2, '0');
                    setDob(`${yyyy}-${mm}-${dd}`);
                  }}
                  onCancel={() => setShowDatePicker(false)}
                />
              ) : (
                <DatePicker
                  modal
                  open={showDatePicker}
                  date={pickerDate}
                  mode="date"
                  maximumDate={new Date()}
                  onConfirm={(date) => {
                    setShowDatePicker(false);
                    setPickerDate(date);
                    const yyyy = date.getFullYear();
                    const mm = String(date.getMonth() + 1).padStart(2, '0');
                    const dd = String(date.getDate()).padStart(2, '0');
                    setDob(`${yyyy}-${mm}-${dd}`);
                  }}
                  onCancel={() => setShowDatePicker(false)}
                />
              )}
              <TouchableOpacity style={styles.saveBtn} onPress={saveProfile} disabled={savingProfile}>
                {savingProfile ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Save</Text>}
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Change Email Section */}
        <View style={styles.card}>
          <TouchableOpacity style={styles.sectionHeaderRow} onPress={() => toggleSection(setShowEmail, showEmail)}>
            <Text style={styles.cardHeader}>Change Email</Text>
            <Icon name={showEmail ? 'chevron-up-outline' : 'chevron-down-outline'} size={22} color="#2563eb" />
          </TouchableOpacity>
          {showEmail && (
            <View>
              <FloatingInput label="New Email" value={newEmail} onChangeText={setNewEmail} autoCapitalize="none" keyboardType="email-address" />
              <FloatingInput label="Current Password" value={currentPassword} onChangeText={setCurrentPassword} secureTextEntry />
              <TouchableOpacity style={styles.saveBtn} onPress={saveEmail} disabled={savingEmail}>
                {savingEmail ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Save</Text>}
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Change Password Section */}
        <View style={styles.card}>
          <TouchableOpacity style={styles.sectionHeaderRow} onPress={() => toggleSection(setShowPassword, showPassword)}>
            <Text style={styles.cardHeader}>Change Password</Text>
            <Icon name={showPassword ? 'chevron-up-outline' : 'chevron-down-outline'} size={22} color="#2563eb" />
          </TouchableOpacity>
          {showPassword && (
            <View>
              <FloatingInput label="Current Password" value={currentPassword} onChangeText={setCurrentPassword} secureTextEntry />
              <FloatingInput label="New Password" value={newPassword} onChangeText={setNewPassword} secureTextEntry />
              <FloatingInput label="Confirm Password" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />
              <TouchableOpacity style={styles.saveBtn} onPress={savePassword} disabled={savingPassword}>
                {savingPassword ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Save</Text>}
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* GoCardless/Mandate Card */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>GoCardless</Text>
          {loadingMandate ? (
            <ActivityIndicator color="#2563eb" />
          ) : mandateId ? (
            <View style={styles.mandateRow}>
              <Icon name="checkmark-circle" size={18} color="#22c55e" style={{ marginRight: 8 }} />
              <Text style={styles.mandateText}>Linked (Mandate ID: {mandateId})</Text>
            </View>
          ) : (
            <View style={styles.mandateRow}>
              <Icon name="close-circle" size={18} color="#ef4444" style={{ marginRight: 8 }} />
              <Text style={styles.mandateText}>Not Linked</Text>
              <TouchableOpacity style={styles.linkBtn} onPress={handleLinkGoCardless}>
                <Text style={styles.linkBtnText}>Link Now</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* WalletConnect/MetaMask Card */}
        {/* Warning for Amoy-only network */}
        <View style={{ backgroundColor: '#fef3c7', padding: 10, borderRadius: 8, marginBottom: 12 }}>
          <Text style={{ color: '#92400e', fontWeight: 'bold', textAlign: 'center' }}>
            Note: When connecting your wallet, please ensure ONLY the Polygon Amoy network is enabled in MetaMask.
          </Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardHeader}>MetaMask / WalletConnect</Text>
          {walletConnected && walletAddress ? (
            <View style={styles.mandateRow}>
              <Icon name="checkmark-circle" size={18} color="#22c55e" style={{ marginRight: 8 }} />
              <Text style={styles.mandateText}>Linked ({walletAddress.slice(0, 6)}...{walletAddress.slice(-4)})</Text>
              <TouchableOpacity style={[styles.linkBtn, { backgroundColor: '#ef4444', marginLeft: 8 }]} onPress={handleDisconnectWallet}>
                <Text style={[styles.linkBtnText, { color: '#fff' }]}>Disconnect Wallet</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.mandateRow}>
              <Icon name="close-circle" size={18} color="#ef4444" style={{ marginRight: 8 }} />
              <Text style={styles.mandateText}>Not Linked</Text>
              <TouchableOpacity style={[styles.linkBtn, { backgroundColor: '#2563eb', marginLeft: 8 }]} onPress={handleConnectWallet} disabled={walletLoading}>
                {walletLoading ? <ActivityIndicator color="#fff" /> : <Text style={[styles.linkBtnText, { color: '#fff' }]}>Connect Wallet</Text>}
              </TouchableOpacity>
            </View>
          )}
          {walletError && <Text style={{ color: 'red', marginTop: 4 }}>{walletError}</Text>}
          <TouchableOpacity
            style={{ marginTop: 12, backgroundColor: '#007AFF', padding: 10, borderRadius: 8, alignItems: 'center' }}
            onPress={() => navigation.navigate('DebugScreen')}
          >
            <Text style={{ color: 'white', fontWeight: 'bold' }}>Open Debug Page</Text>
          </TouchableOpacity>
        </View>

        {/* Status Message */}
        {status && (
          <View style={[styles.statusMsg, status.error ? styles.statusMsgError : styles.statusMsgSuccess]}>
            <Text style={styles.statusMsgText}>{status.message}</Text>
          </View>
        )}

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Icon name="log-out-outline" size={20} color="#ef4444" style={{ marginRight: 8 }} />
          <Text style={styles.logoutBtnText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    paddingHorizontal: 8,
    paddingTop: 16,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 22,
    marginHorizontal: 10,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  avatarWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    position: 'relative',
  },
  avatarImg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e0e7ff',
  },
  avatarFallback: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e0e7ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontSize: 32,
    color: '#2563eb',
    fontWeight: 'bold',
  },
  avatarEdit: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 4,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.10,
    shadowRadius: 2,
    elevation: 2,
  },
  profileName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222',
    textAlign: 'center',
    marginBottom: 2,
  },
  profileEmail: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 2,
  },
  profileDob: {
    fontSize: 15,
    color: '#888',
    textAlign: 'center',
    marginBottom: 2,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cardHeader: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 0,
  },
  floatingInputContainer: {
    position: 'relative',
    marginBottom: 18,
  },
  floatingLabel: {
    position: 'absolute',
    left: 12,
    top: 12,
    fontSize: 15,
    color: '#888',
    zIndex: 2,
    backgroundColor: 'transparent',
  },
  floatingLabelActive: {
    top: -10,
    left: 8,
    fontSize: 12,
    color: '#2563eb',
    backgroundColor: '#fff',
    paddingHorizontal: 2,
  },
  floatingInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    paddingTop: 22,
    fontSize: 15,
    backgroundColor: '#fff',
    color: '#222',
  },
  saveBtn: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 2,
  },
  saveBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  mandateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 2,
  },
  mandateText: {
    color: '#2563eb',
    fontWeight: 'bold',
    fontSize: 15,
  },
  linkBtn: {
    marginLeft: 12,
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  linkBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  statusMsg: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  statusMsgError: {
    backgroundColor: '#fee2e2',
  },
  statusMsgSuccess: {
    backgroundColor: '#d1fae5',
  },
  statusMsgText: {
    color: '#222',
    fontSize: 15,
    fontWeight: 'bold',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ef4444',
    paddingVertical: 14,
    marginTop: 10,
    marginBottom: 24,
    marginHorizontal: 2,
  },
  logoutBtnText: {
    color: '#ef4444',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
