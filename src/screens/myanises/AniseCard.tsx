import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Anise } from './types/myAnise';

// Props for the AniseCard component
interface Props {
  anise: Anise;                        // The Anise object to display
  onViewManage?: (anise: Anise) => void; // Optional callback for the button
}

// Card component to display a single Anise
export const AniseCard: React.FC<Props> = ({ anise, onViewManage }) => (
  <View
    style={{
      backgroundColor: anise.isCharity ? '#F6F3FA' : '#fff', // Special color for charity
      borderRadius: 16,                                      // Rounded corners
      padding: 20,                                           // Padding inside the card
      marginBottom: 16,                                      // Space below the card
      borderWidth: anise.isCharity ? 2 : 1,                  // Thicker border for charity
      borderColor: anise.isCharity ? '#3B2364' : '#E0E0EA',  // Special border for charity
      shadowColor: '#B3AFC2',                                // Shadow color
      shadowOpacity: 0.08,                                   // Shadow opacity
      shadowRadius: 8,                                       // Shadow blur
      elevation: 2,                                          // Android shadow
    }}
  >
    {/* Group name */}
    <Text style={{ fontWeight: 'bold', fontSize: 18, color: '#23202A', marginBottom: 4 }}>
      {anise.name}
    </Text>
    {/* Members and role */}
    <Text style={{ color: '#6B7280', marginBottom: 2 }}>
      {anise.members} contributors • {anise.role}
    </Text>
    {/* Creation date */}
    <Text style={{ color: '#888', marginBottom: 8, fontSize: 13 }}>
      Created: {anise.created}
    </Text>
    {/* Status */}
    <Text style={{ color: anise.status === 'Active' ? '#22c55e' : '#f59e42', fontWeight: '500', marginBottom: 12 }}>
      {anise.status}
    </Text>
    {/* Charity badge */}
    {anise.isCharity && (
      <Text style={{ color: '#3B2364', fontWeight: 'bold', marginBottom: 8 }}>Charity DAO</Text>
    )}
    {/* View & Manage button */}
    <TouchableOpacity
      style={{
        backgroundColor: '#3B2364',
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
        marginTop: 4,
      }}
      onPress={() => onViewManage && onViewManage(anise)}
    >
      <Text style={{ color: '#fff', fontWeight: '500', fontSize: 16 }}>View & Manage</Text>
    </TouchableOpacity>
  </View>
);