import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
  Platform,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

export interface SearchFilters {
  query: string;
  sortBy: string;
  memberCount: string;
  privateKey?: string;
}

interface AdvancedSearchProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  onSearch: () => void;
  onPrivateKeySubmit: (privateKey: string) => void;
  placeholder?: string;
}

const SORT_OPTIONS = [
  { label: 'ALL', value: 'all' },
  { label: 'Most Recent', value: 'recent' },
  { label: 'Most Popular', value: 'popular' },
];

const MEMBER_COUNT_OPTIONS = [
  { label: 'Any Size', value: 'any' },
  { label: '1-10 Members', value: '1-10' },
  { label: '11-50 Members', value: '11-50' },
  { label: '51-100 Members', value: '51-100' },
  { label: '100+ Members', value: '100+' },
];

export default function AdvancedSearch({
  filters,
  onFiltersChange,
  onSearch,
  onPrivateKeySubmit,
  placeholder = 'Search Anises...',
}: AdvancedSearchProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [showPrivateKeyModal, setShowPrivateKeyModal] = useState(false);
  const [privateKeyInput, setPrivateKeyInput] = useState('');

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({
      query: '',
      sortBy: 'all',
      memberCount: 'any',
      privateKey: undefined,
    });
  };

  const hasActiveFilters = () => {
    return (
      filters.sortBy !== 'all' ||
      filters.memberCount !== 'any' ||
      filters.privateKey
    );
  };

  const handlePrivateKeySubmit = () => {
    if (!privateKeyInput.trim()) {
      Alert.alert('Error', 'Please enter a private key');
      return;
    }
    
    updateFilter('privateKey', privateKeyInput.trim());
    setShowPrivateKeyModal(false);
    setPrivateKeyInput('');
    onPrivateKeySubmit(privateKeyInput.trim());
  };

  const removePrivateKey = () => {
    updateFilter('privateKey', undefined);
  };

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          placeholder={placeholder}
          value={filters.query}
          onChangeText={(text) => updateFilter('query', text)}
          onSubmitEditing={onSearch}
          returnKeyType="search"
          placeholderTextColor="#999"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity
          style={styles.searchButton}
          onPress={onSearch}
        >
          <Icon name="search" size={20} color="#2563eb" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.privateKeyButton}
          onPress={() => setShowPrivateKeyModal(true)}
        >
          <Icon name="key-outline" size={20} color="#2563eb" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => {
            console.log('Filter button pressed, opening modal...');
            setShowFilters(true);
          }}
        >
          <Icon
            name="options-outline"
            size={20}
            color={hasActiveFilters() ? '#2563eb' : '#666'}
          />
          {hasActiveFilters() && <View style={styles.filterIndicator} />}
        </TouchableOpacity>
      </View>

      {/* Active Filters Display */}
      {hasActiveFilters() && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.activeFiltersContainer}
          contentContainerStyle={styles.activeFiltersContent}
          bounces={false}
        >
          {filters.sortBy !== 'all' && (
            <View style={styles.activeFilter}>
              <Text style={styles.activeFilterText}>
                {SORT_OPTIONS.find(opt => opt.value === filters.sortBy)?.label || filters.sortBy}
              </Text>
              <TouchableOpacity
                onPress={() => updateFilter('sortBy', 'all')}
                style={styles.removeFilter}
              >
                <Icon name="close" size={14} color="#666" />
              </TouchableOpacity>
            </View>
          )}
          {filters.memberCount !== 'any' && (
            <View style={styles.activeFilter}>
              <Text style={styles.activeFilterText}>
                {MEMBER_COUNT_OPTIONS.find(opt => opt.value === filters.memberCount)?.label || filters.memberCount}
              </Text>
              <TouchableOpacity
                onPress={() => updateFilter('memberCount', 'any')}
                style={styles.removeFilter}
              >
                <Icon name="close" size={14} color="#666" />
              </TouchableOpacity>
            </View>
          )}
          {filters.privateKey && (
            <View style={styles.activeFilter}>
              <Text style={styles.activeFilterText}>Private Group</Text>
              <TouchableOpacity
                onPress={removePrivateKey}
                style={styles.removeFilter}
              >
                <Icon name="close" size={14} color="#666" />
              </TouchableOpacity>
            </View>
          )}
          <TouchableOpacity onPress={clearFilters} style={styles.clearAllButton}>
            <Text style={styles.clearAllText}>Clear All</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* Private Key Modal */}
      <Modal
        visible={showPrivateKeyModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Join Private Group</Text>
            <TouchableOpacity onPress={() => setShowPrivateKeyModal(false)}>
              <Icon name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <Text style={styles.modalSubtitle}>
              Enter the private key or invitation code to join a private group
            </Text>
            
            <TextInput
              style={styles.privateKeyInput}
              placeholder="Enter private key or invitation code"
              value={privateKeyInput}
              onChangeText={setPrivateKeyInput}
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry={false}
            />

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handlePrivateKeySubmit}
            >
              <Text style={styles.submitButtonText}>Join Group</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Filters Modal */}
      <Modal
        visible={showFilters}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Search Filters</Text>
            <TouchableOpacity onPress={() => setShowFilters(false)}>
              <Icon name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Sort Options */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Filter By</Text>
              {SORT_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.optionRow,
                    filters.sortBy === option.value && styles.optionRowActive,
                  ]}
                  onPress={() => {
                    console.log('Sort filter selected:', option.value);
                    updateFilter('sortBy', option.value);
                  }}
                >
                  <Text
                    style={[
                      styles.optionRowText,
                      filters.sortBy === option.value && styles.optionRowTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                  {filters.sortBy === option.value && (
                    <Icon name="checkmark" size={20} color="#2563eb" />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Member Count Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Group Size</Text>
              {MEMBER_COUNT_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.optionRow,
                    filters.memberCount === option.value && styles.optionRowActive,
                  ]}
                  onPress={() => {
                    console.log('Member count filter selected:', option.value);
                    updateFilter('memberCount', option.value);
                  }}
                >
                  <Text
                    style={[
                      styles.optionRowText,
                      filters.memberCount === option.value && styles.optionRowTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                  {filters.memberCount === option.value && (
                    <Icon name="checkmark" size={20} color="#2563eb" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* Modal Actions */}
          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
              <Text style={styles.clearButtonText}>Clear All</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.applyButton}
              onPress={() => {
                console.log('Apply filters pressed, current filters:', filters);
                setShowFilters(false);
                onSearch();
              }}
            >
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 8,
    minHeight: 24,
  },
  searchButton: {
    padding: 4,
    marginRight: 8,
  },
  privateKeyButton: {
    padding: 4,
    marginRight: 8,
  },
  filterButton: {
    padding: 4,
    position: 'relative',
  },
  filterIndicator: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2563eb',
  },
  activeFiltersContainer: {
    maxHeight: 70,
    minHeight: 50,
    marginTop: 4,
  },
  activeFiltersContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0e7ff',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    minHeight: 36,
    borderWidth: 1,
    borderColor: '#c7d2fe',
  },
  activeFilterText: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '600',
    marginRight: 6,
    flexShrink: 0,
    lineHeight: 16,
  },
  removeFilter: {
    padding: 2,
  },
  clearAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  clearAllText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  privateKeyInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: '#f8f9fa',
  },
  submitButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  filterSection: {
    marginVertical: 20,
  },
  filterSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  optionChipActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  optionChipText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  optionChipTextActive: {
    color: '#fff',
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 4,
  },
  optionRowActive: {
    backgroundColor: '#e0e7ff',
  },
  optionRowText: {
    fontSize: 16,
    color: '#333',
  },
  optionRowTextActive: {
    color: '#2563eb',
    fontWeight: '500',
  },
  modalActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    gap: 12,
  },
  clearButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  applyButton: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#2563eb',
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
}); 