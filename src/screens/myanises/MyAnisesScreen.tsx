import React from 'react';
import { View, Text, SafeAreaView, ScrollView, Alert } from 'react-native';
import { getMyAnises } from '../../utils/myAnisesData'; // Import the data utility
import { Anise } from './types/myAnise';              // Import the type
import { AniseCard } from './AniseCard';                // Import the card component

export default function MyAnisesScreen({ navigation }: { navigation: any }) {
  const myAnises: Anise[] = getMyAnises(); // Get the list of Anises

  // Handler for the View & Manage button
  const handleViewManage = (anise: Anise) => {
    if (anise.name === 'LA Wildfire Fund') {
      navigation.navigate('LAWildfireFund');
    } else {
      Alert.alert('Manage', `Manage ${anise.name}`);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F5F7' }}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {/* Screen title */}
        <Text style={{ fontSize: 28, fontWeight: 'bold', marginBottom: 24, color: '#23202A' }}>
          My Anises
        </Text>
        {/* Render a card for each Anise */}
        {myAnises.map(anise => (
          <AniseCard key={anise.id} anise={anise} onViewManage={() => handleViewManage(anise)} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}