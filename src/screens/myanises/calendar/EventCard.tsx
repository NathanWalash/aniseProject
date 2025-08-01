import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Event } from '../../../services/calendarApi';

interface EventCardProps {
  event: Event;
  onDelete?: () => void;
  isCreator?: boolean;
  creatorName?: string;
}

export const EventCard: React.FC<EventCardProps> = ({ event, onDelete, isCreator, creatorName }) => {
  // Convert timestamps to readable dates - startTime and endTime are Unix timestamps
  const startTime = new Date(event.startTime * 1000);
  const endTime = new Date(event.endTime * 1000);
  const createdAt = new Date(event.createdAt._seconds * 1000);

  // Calculate event status
  const now = new Date();
  let status = 'UPCOMING';
  let statusColor = '#059669';
  let statusIcon = 'time-outline';

  if (startTime <= now && endTime >= now) {
    status = 'ONGOING';
    statusColor = '#2563eb';
    statusIcon = 'play-circle-outline';
  } else if (endTime < now) {
    status = 'PAST';
    statusColor = '#6b7280';
    statusIcon = 'checkmark-circle-outline';
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={2}>
            {event.title}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
            <Icon name={statusIcon} size={14} color={statusColor} />
            <Text style={[styles.statusText, { color: statusColor }]}>
              {status}
            </Text>
          </View>
        </View>
        {isCreator && onDelete && (
          <TouchableOpacity onPress={onDelete} style={styles.deleteButton}>
            <Icon name="trash-outline" size={20} color="#ef4444" />
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.description} numberOfLines={3}>
        {event.description}
      </Text>

      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Icon name="location-outline" size={16} color="#6b7280" />
          <Text style={styles.detailText} numberOfLines={1}>
            {event.location}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Icon name="time-outline" size={16} color="#6b7280" />
          <Text style={styles.detailText}>
            {startTime.toLocaleDateString()} {startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Icon name="person-outline" size={16} color="#6b7280" />
          <Text style={styles.detailText} numberOfLines={1}>
            {creatorName || event.creator}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Icon name="calendar-outline" size={16} color="#6b7280" />
          <Text style={styles.detailText}>
            Created {createdAt.toLocaleDateString()}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleContainer: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  deleteButton: {
    padding: 4,
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  details: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 8,
    flex: 1,
  },
}); 