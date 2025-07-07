// src/screens/HomeScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  View,
  TextInput,
  ScrollView,
  StyleSheet,
  Image,
  Alert,
  LayoutAnimation,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../../utils/api';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import DatePicker from 'react-native-date-picker';
import Constants from 'expo-constants';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

interface Profile {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  email: string;
}

type ProfileScreenProps = { onLogout: () => void };

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
              <TouchableOpacity style={styles.linkBtn} onPress={() => Alert.alert('Link GoCardless', 'Linking coming soon!')}>
                <Text style={styles.linkBtnText}>Link Now</Text>
              </TouchableOpacity>
            </View>
          )}
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
