import React from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, ScrollView, Alert } from 'react-native';

export default function LAWildfireFundScreen({ navigation }: { navigation: any }) {
  // Handler for leaving the fund
  const handleLeave = () => {
    Alert.alert('Leave Group', 'Are you sure you want to leave the LA Wildfire Fund?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Leave', style: 'destructive', onPress: () => navigation.goBack() },
    ]);
  };

  // Handler for inviting others (placeholder)
  const handleInvite = () => {
    Alert.alert('Invite', 'Invite functionality coming soon!');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F5F7' }}>
      <ScrollView contentContainerStyle={{ padding: 24 }}>
        <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#3B2364', marginBottom: 12 }}>
          LA Wildfire Fund
        </Text>
        <Text style={{ color: '#23202A', fontSize: 16, marginBottom: 18 }}>
          The LA Wildfire Fund is a non-profit Charity DAO dedicated to supporting victims of wildfires in Los Angeles. All proceeds go directly to relief efforts. Join to see where your donations end up!
        </Text>
        <View style={{ backgroundColor: '#F6F3FA', borderRadius: 16, padding: 18, marginBottom: 18, borderWidth: 2, borderColor: '#3B2364' }}>
          <Text style={{ fontWeight: 'bold', color: '#3B2364', fontSize: 16, marginBottom: 6 }}>Group Details</Text>
          <Text style={{ color: '#23202A', marginBottom: 2 }}>Members: <Text style={{ fontWeight: 'bold' }}>3200</Text></Text>
          <Text style={{ color: '#23202A', marginBottom: 2 }}>Created: <Text style={{ fontWeight: 'bold' }}>15 April 2024</Text></Text>
          <Text style={{ color: '#23202A', marginBottom: 2 }}>Status: <Text style={{ fontWeight: 'bold', color: '#22c55e' }}>Active</Text></Text>
          <Text style={{ color: '#23202A', marginBottom: 2 }}>Your Role: <Text style={{ fontWeight: 'bold' }}>Admin</Text></Text>
        </View>
        <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 18, borderWidth: 1, borderColor: '#ECE6F6' }}>
          <Text style={{ fontWeight: 'bold', color: '#3B2364', fontSize: 15, marginBottom: 6 }}>Fundraising Progress</Text>
          <Text style={{ color: '#23202A', marginBottom: 2 }}>Already Raised: <Text style={{ fontWeight: 'bold' }}>£42,500</Text></Text>
          <Text style={{ color: '#23202A', marginBottom: 2 }}>Suggested Donation: <Text style={{ fontWeight: 'bold' }}>Any amount</Text></Text>
          <Text style={{ color: '#23202A', marginBottom: 2 }}>Frequency: <Text style={{ fontWeight: 'bold' }}>One-off, Weekly, Monthly</Text></Text>
        </View>
        <TouchableOpacity
          style={{ backgroundColor: '#3B2364', borderRadius: 8, paddingVertical: 16, alignItems: 'center', marginBottom: 14 }}
          onPress={handleInvite}
        >
          <Text style={{ color: '#fff', fontWeight: '500', fontSize: 17 }}>Invite Others</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ backgroundColor: '#f59e42', borderRadius: 8, paddingVertical: 16, alignItems: 'center', marginBottom: 14 }}
          onPress={handleLeave}
        >
          <Text style={{ color: '#fff', fontWeight: '500', fontSize: 17 }}>Leave Group</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ backgroundColor: '#ECE6F6', borderRadius: 8, paddingVertical: 16, alignItems: 'center' }}
          onPress={() => navigation.goBack()}
        >
          <Text style={{ color: '#3B2364', fontWeight: '500', fontSize: 17 }}>Back</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
} 