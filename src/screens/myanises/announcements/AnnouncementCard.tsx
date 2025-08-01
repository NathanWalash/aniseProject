import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Announcement } from '../../../services/announcementApi';

interface AnnouncementCardProps {
  announcement: Announcement;
  isCreator: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const AnnouncementCard: React.FC<AnnouncementCardProps> = ({ 
  announcement, 
  isCreator, 
  onEdit, 
  onDelete 
}) => {
  const getTypeColor = (type: string): string => {
    switch (type) {
      case 'GENERAL': return '#6B7280';
      case 'URGENT': return '#EF4444';
      case 'INFO': return '#3B82F6';
      default: return '#6B7280';
    }
  };

  const getTypeIcon = (type: string): string => {
    switch (type) {
      case 'GENERAL': return 'megaphone';
      case 'URGENT': return 'warning';
      case 'INFO': return 'information-circle';
      default: return 'megaphone';
    }
  };

  const formatDate = (timestamp: { _seconds: number; _nanoseconds: number }) => {
    const date = new Date(timestamp._seconds * 1000);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const isExpired = () => {
    const now = Math.floor(Date.now() / 1000);
    return announcement.expiresAt._seconds < now;
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Announcement',
      'Are you sure you want to delete this announcement?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: onDelete }
      ]
    );
  };

  return (
    <View style={[styles.card, isExpired() && styles.expiredCard]}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={2}>
            {announcement.title}
          </Text>
          <View style={[
            styles.typeBadge,
            { backgroundColor: getTypeColor(announcement.announcementType) }
          ]}>
            <Icon 
              name={getTypeIcon(announcement.announcementType)} 
              size={12} 
              color="#fff" 
            />
            <Text style={styles.typeText}>{announcement.announcementType}</Text>
          </View>
        </View>
        
        {isCreator && (
          <View style={styles.actions}>
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={onEdit}
            >
              <Icon name="create" size={16} color="#6B7280" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={handleDelete}
            >
              <Icon name="trash" size={16} color="#EF4444" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      <Text style={styles.content} numberOfLines={3}>
        {announcement.content}
      </Text>

      <View style={styles.footer}>
        <View style={styles.meta}>
          <Text style={styles.metaText}>
            Created: {formatDate(announcement.createdAt)}
          </Text>
          <Text style={styles.metaText}>
            Expires: {formatDate(announcement.expiresAt)}
          </Text>
        </View>
        
        {isExpired() && (
          <View style={styles.expiredBadge}>
            <Icon name="time" size={12} color="#EF4444" />
            <Text style={styles.expiredText}>EXPIRED</Text>
          </View>
        )}
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
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  expiredCard: {
    opacity: 0.6,
    borderColor: '#FCA5A5'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12
  },
  titleContainer: {
    flex: 1,
    marginRight: 12
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    gap: 4
  },
  typeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
    textTransform: 'uppercase'
  },
  actions: {
    flexDirection: 'row',
    gap: 8
  },
  actionButton: {
    padding: 4
  },
  content: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 12
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  meta: {
    flex: 1
  },
  metaText: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2
  },
  expiredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  expiredText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#EF4444',
    textTransform: 'uppercase'
  }
}); 