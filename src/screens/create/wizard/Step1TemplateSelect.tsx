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
  const filtered = allTemplates.filter(t => {
    const templateName = t.name || '';
    const templateDescription = t.description || '';
    return (
      templateName.toLowerCase().includes(query.toLowerCase()) ||
      templateDescription.toLowerCase().includes(query.toLowerCase())
    );
  });

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
        const templateName = template.name || '';
        const templateDescription = template.description || '';
        const isExpanded = expandedId === template.templateId;
        const isSelected = selectedTemplate?.templateId === template.templateId;
        return (
          <Animated.View
            key={template.templateId}
            style={[
              styles.card,
              isSelected && styles.cardSelected,
              { shadowOpacity: isSelected ? 0.15 : 0.06 },
            ]}
            accessible={true}
            accessibilityLabel={`Template card for ${templateName}${isSelected ? ', selected' : ''}`}
          >
            <TouchableOpacity
              style={styles.cardHeader}
              onPress={() => setSelectedTemplate(template)}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
            >
              <View style={styles.cardContent}>
                <View style={[styles.iconContainer, isSelected && styles.iconContainerSelected]}>
                  <Icon name="layers-outline" size={20} color={isSelected ? '#fff' : '#2563eb'} />
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.templateName}>{templateName}</Text>
                  {isExpanded && (
                    <Text style={styles.templateDescription}>
                      {templateDescription}
                    </Text>
                  )}
                </View>
              </View>
              <TouchableOpacity
                onPress={() => handleExpand(template.templateId)}
                style={styles.expandButton}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityRole="button"
                accessibilityLabel={isExpanded ? 'Collapse details' : 'Expand details'}
              >
                <Icon name={isExpanded ? 'chevron-up-outline' : 'chevron-down-outline'} size={18} color="#2563eb" />
              </TouchableOpacity>
            </TouchableOpacity>
            {isExpanded && (
              <View style={styles.cardExpandedContent}>
                <View style={styles.modulesHeader}>
                  <Text style={styles.modulesTitle}>Modules ({template.modules.length})</Text>
                  <View style={styles.moduleCountBadge}>
                    <Text style={styles.moduleCountText}>{template.modules.length}</Text>
                  </View>
                </View>
                <View style={styles.modulesList}>
                  {template.modules.map((m, index) => (
                    <View key={m} style={styles.moduleItem}>
                      <View style={styles.moduleBadge}>
                        <Icon name="cube-outline" size={16} color="#2563eb" style={styles.moduleIcon} />
                        <Text style={styles.moduleBadgeText}>{m}</Text>
                      </View>
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
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 20,
    paddingHorizontal: 16,
    marginHorizontal: 2,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchBar: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: '#222',
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  card: {
    marginBottom: 16,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
    marginHorizontal: 2,
  },
  cardSelected: {
    borderColor: '#2563eb',
    borderWidth: 2,
    shadowOpacity: 0.15,
    elevation: 6,
    backgroundColor: '#fefefe',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingBottom: 16,
    backgroundColor: 'transparent',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#f0f9ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconContainerSelected: {
    backgroundColor: '#2563eb',
  },
  textContainer: {
    flex: 1,
    paddingRight: 8,
  },
  templateName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1e293b',
    lineHeight: 22,
  },
  templateDescription: {
    color: '#64748b',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
  },
  expandButton: {
    marginLeft: 8,
    padding: 6,
    borderRadius: 6,
    backgroundColor: '#f8fafc',
  },
  cardExpandedContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#f8fafc',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  modulesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    marginBottom: 16,
  },
  modulesTitle: {
    fontWeight: '600',
    fontSize: 16,
    color: '#1e293b',
  },
  moduleCountBadge: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  moduleCountText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  modulesList: {
    marginBottom: 16,
  },
  moduleItem: {
    marginBottom: 8,
  },
  moduleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  moduleIcon: {
    marginRight: 8,
  },
  moduleBadgeText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '500',
  },
  exploreButton: {
    marginTop: 16,
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  exploreButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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