import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, LayoutAnimation, StyleSheet, Animated } from 'react-native';
import type { Template } from './CreateWizard';
import allTemplates from '../../../templates/anise';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

type Props = {
  onSelect: (template: Template) => void;
  step?: number;
  selectedTemplate: Template | null;
  setSelectedTemplate: (t: Template | null) => void;
};

export default function Step1TemplateSelect({ onSelect, selectedTemplate, setSelectedTemplate }: Props) {
  const [query, setQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const navigation = useNavigation() as any;
  const filtered = allTemplates.filter(t =>
    t.templateName.toLowerCase().includes(query.toLowerCase()) ||
    t.templateDescription.toLowerCase().includes(query.toLowerCase())
  );

  const handleExpand = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchBarContainer}>
        <Icon name="search-outline" size={20} color="#2563eb" style={styles.searchIcon} />
        <TextInput
          placeholder="Search for template"
          value={query}
          onChangeText={setQuery}
          style={styles.searchBar}
          placeholderTextColor="#888"
          accessibilityLabel="Search for template"
        />
      </View>
      {filtered.map(t => {
        const template: Template = {
          ...t,
          initParamsSchema: [], // fallback since JSONs do not include this
        };
        const isExpanded = expandedId === template.templateId;
        const isSelected = selectedTemplate?.templateId === template.templateId;
        return (
          <Animated.View
            key={template.templateId}
            style={[
              styles.card,
              isSelected && styles.cardSelected,
              { shadowOpacity: isSelected ? 0.18 : 0.08 },
            ]}
            accessible={true}
            accessibilityLabel={`Template card for ${template.templateName}${isSelected ? ', selected' : ''}`}
          >
            <TouchableOpacity
              style={styles.cardHeader}
              onPress={() => setSelectedTemplate(template)}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <Icon name="layers-outline" size={28} color={isSelected ? '#2563eb' : '#888'} style={{ marginRight: 12 }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.templateName}>{template.templateName}</Text>
                  <Text style={styles.templateDescription} numberOfLines={isExpanded ? undefined : 2}>{template.templateDescription}</Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => handleExpand(template.templateId)}
                style={styles.expandButton}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityRole="button"
                accessibilityLabel={isExpanded ? 'Collapse details' : 'Expand details'}
              >
                <Icon name={isExpanded ? 'chevron-up-outline' : 'chevron-down-outline'} size={24} color="#2563eb" />
              </TouchableOpacity>
            </TouchableOpacity>
            {isExpanded && (
              <View style={styles.cardExpandedContent}>
                <Text style={styles.modulesTitle}>Modules:</Text>
                <View style={styles.modulesList}>
                  {template.modules.map(m => (
                    <View key={m} style={styles.moduleBadge}>
                      <Icon name="cube-outline" size={14} color="#2563eb" style={{ marginRight: 4 }} />
                      <Text style={styles.moduleBadgeText}>{m}</Text>
                    </View>
                  ))}
                </View>
                <TouchableOpacity
                  style={styles.exploreButton}
                  onPress={() => navigation.navigate('Explore')}
                  activeOpacity={0.92}
                  accessibilityRole="button"
                  accessibilityLabel="Explore user-created groups"
                >
                  <Icon name="search-outline" size={18} color="#fff" style={{ marginRight: 8 }} />
                  <Text style={styles.exploreButtonText}>
                    Explore User-Created Groups
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </Animated.View>
        );
      })}
      {filtered.length === 0 && (
        <View style={styles.emptyStateContainer}>
          <Icon name="alert-circle-outline" size={40} color="#d1d5db" style={{ marginBottom: 8 }} />
          <Text style={styles.emptyStateText}>No templates found.</Text>
          <Text style={styles.emptyStateSubtext}>Try a different search or clear your query.</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 0,
    paddingTop: 8,
    backgroundColor: '#f8fafc',
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 18,
    paddingHorizontal: 16,
    marginHorizontal: 2,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  searchIcon: {
    marginRight: 6,
  },
  searchBar: {
    flex: 1,
    height: 42,
    fontSize: 16,
    color: '#222',
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  card: {
    marginBottom: 20,
    borderRadius: 18,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
    overflow: 'hidden',
    marginHorizontal: 2,
    position: 'relative',
  },
  cardSelected: {
    borderColor: '#2563eb',
    borderWidth: 3,
    shadowOpacity: 0.18,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
    paddingBottom: 10,
    backgroundColor: 'transparent',
  },
  templateName: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 2,
  },
  templateDescription: {
    color: '#555',
    fontSize: 15,
    marginBottom: 2,
  },
  expandButton: {
    marginLeft: 10,
    padding: 4,
  },
  cardExpandedContent: {
    paddingHorizontal: 18,
    paddingBottom: 16,
    backgroundColor: '#f3f4f6',
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
  },
  modulesTitle: {
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 6,
    fontSize: 15,
    color: '#2563eb',
  },
  modulesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  moduleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0e7ff',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginRight: 8,
    marginBottom: 6,
  },
  moduleBadgeText: {
    color: '#2563eb',
    fontSize: 13,
    fontWeight: '600',
  },
  exploreButton: {
    marginTop: 18,
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 4,
    elevation: 2,
  },
  exploreButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.2,
  },
  emptyStateContainer: {
    alignItems: 'center',
    marginTop: 48,
  },
  emptyStateText: {
    color: '#a1a1aa',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  emptyStateSubtext: {
    color: '#a1a1aa',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8,
  },
}); 