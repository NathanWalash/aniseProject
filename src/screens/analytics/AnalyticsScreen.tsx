import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Platform,
} from 'react-native';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../../utils/api';

const { width } = Dimensions.get('window');

interface AnalyticsData {
  totalDaos: number;
  totalMembers: number;
  totalProposals: number;
  totalVotes: number;
  totalPayments: number;
  activityData: {
    labels: string[];
    datasets: Array<{
      data: number[];
      color?: (opacity: number) => string;
    }>;
  };
  categoryDistribution: Array<{
    name: string;
    count: number;
    color: string;
  }>;
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
    daoName: string;
  }>;
}

export default function AnalyticsScreen() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const idToken = await AsyncStorage.getItem('idToken');
      if (!idToken) throw new Error('Not authenticated');

      const response = await fetch(`${API_BASE_URL}/api/analytics?timeRange=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }

      const data = await response.json();
      setAnalyticsData(data);
    } catch (err: any) {
      setError(err.message);
      // For demo purposes, use mock data
      setAnalyticsData(getMockAnalyticsData());
    } finally {
      setLoading(false);
    }
  };

  const getMockAnalyticsData = (): AnalyticsData => ({
    totalDaos: 12,
    totalMembers: 156,
    totalProposals: 34,
    totalVotes: 89,
    totalPayments: 23,
    activityData: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [
        {
          data: [20, 45, 28, 80, 99, 43, 50],
          color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
        },
      ],
    },
    categoryDistribution: [
      { name: 'Investment', count: 4, color: '#3B82F6' },
      { name: 'Community', count: 3, color: '#10B981' },
      { name: 'Charity', count: 2, color: '#F59E0B' },
      { name: 'Technology', count: 2, color: '#8B5CF6' },
      { name: 'Education', count: 1, color: '#EF4444' },
    ],
    recentActivity: [
      {
        id: '1',
        type: 'proposal',
        description: 'New proposal created in Green Investors',
        timestamp: '2 hours ago',
        daoName: 'Green Investors',
      },
      {
        id: '2',
        type: 'vote',
        description: 'Vote cast on Community Garden funding',
        timestamp: '4 hours ago',
        daoName: 'Local Community DAO',
      },
      {
        id: '3',
        type: 'payment',
        description: 'Payment received from Investment Pool',
        timestamp: '1 day ago',
        daoName: 'Investment Pool',
      },
    ],
  });

  const StatCard = ({ title, value, icon, color, subtitle }: {
    title: string;
    value: string | number;
    icon: string;
    color: string;
    subtitle?: string;
  }) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={styles.statHeader}>
        <Icon name={icon} size={24} color={color} />
        <Text style={styles.statTitle}>{title}</Text>
      </View>
      <Text style={styles.statValue}>{value}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </View>
  );

  const ActivityItem = ({ activity }: { activity: AnalyticsData['recentActivity'][0] }) => {
    const getIcon = (type: string) => {
      switch (type) {
        case 'proposal': return 'document-text-outline';
        case 'vote': return 'checkbox-outline';
        case 'payment': return 'cash-outline';
        case 'member': return 'person-add-outline';
        default: return 'notifications-outline';
      }
    };

    const getColor = (type: string) => {
      switch (type) {
        case 'proposal': return '#3B82F6';
        case 'vote': return '#10B981';
        case 'payment': return '#F59E0B';
        case 'member': return '#8B5CF6';
        default: return '#6B7280';
      }
    };

    return (
      <View style={styles.activityItem}>
        <View style={[styles.activityIcon, { backgroundColor: getColor(activity.type) + '20' }]}>
          <Icon name={getIcon(activity.type)} size={20} color={getColor(activity.type)} />
        </View>
        <View style={styles.activityContent}>
          <Text style={styles.activityDescription}>{activity.description}</Text>
          <View style={styles.activityMeta}>
            <Text style={styles.activityDao}>{activity.daoName}</Text>
            <Text style={styles.activityTime}>{activity.timestamp}</Text>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Loading analytics...</Text>
      </View>
    );
  }

  if (error && !analyticsData) {
    return (
      <View style={styles.centered}>
        <Icon name="alert-circle-outline" size={64} color="#ef4444" />
        <Text style={styles.errorText}>Failed to load analytics</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchAnalytics}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!analyticsData) return null;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Analytics Dashboard</Text>
        <View style={styles.timeRangeSelector}>
          {(['7d', '30d', '90d'] as const).map((range) => (
            <TouchableOpacity
              key={range}
              style={[styles.timeRangeButton, timeRange === range && styles.timeRangeButtonActive]}
              onPress={() => setTimeRange(range)}
            >
              <Text style={[styles.timeRangeText, timeRange === range && styles.timeRangeTextActive]}>
                {range === '7d' ? '7D' : range === '30d' ? '30D' : '90D'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsGrid}>
        <StatCard
          title="Total DAOs"
          value={analyticsData.totalDaos}
          icon="business-outline"
          color="#3B82F6"
          subtitle="Active groups"
        />
        <StatCard
          title="Total Members"
          value={analyticsData.totalMembers}
          icon="people-outline"
          color="#10B981"
          subtitle="Across all DAOs"
        />
        <StatCard
          title="Proposals"
          value={analyticsData.totalProposals}
          icon="document-text-outline"
          color="#F59E0B"
          subtitle="Created"
        />
        <StatCard
          title="Votes Cast"
          value={analyticsData.totalVotes}
          icon="checkbox-outline"
          color="#8B5CF6"
          subtitle="Participated"
        />
      </View>

      {/* Activity Chart */}
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Activity Over Time</Text>
        <LineChart
          data={analyticsData.activityData}
          width={width - 32}
          height={220}
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
            style: {
              borderRadius: 16,
            },
            propsForDots: {
              r: '6',
              strokeWidth: '2',
              stroke: '#2563eb',
            },
          }}
          bezier
          style={styles.chart}
        />
      </View>

      {/* Category Distribution */}
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>DAO Categories</Text>
        <PieChart
          data={analyticsData.categoryDistribution.map((item, index) => ({
            name: item.name,
            population: item.count,
            color: item.color,
            legendFontColor: '#7F7F7F',
            legendFontSize: 12,
          }))}
          width={width - 32}
          height={200}
          chartConfig={{
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          }}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
          absolute
        />
      </View>

      {/* Recent Activity */}
      <View style={styles.activityContainer}>
        <Text style={styles.chartTitle}>Recent Activity</Text>
        {analyticsData.recentActivity.map((activity) => (
          <ActivityItem key={activity.id} activity={activity} />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  timeRangeSelector: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    padding: 4,
  },
  timeRangeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  timeRangeButtonActive: {
    backgroundColor: '#2563eb',
  },
  timeRangeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
  timeRangeTextActive: {
    color: '#fff',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
    marginLeft: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  statSubtitle: {
    fontSize: 12,
    color: '#94a3b8',
  },
  chartContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  chart: {
    borderRadius: 12,
  },
  activityContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityDescription: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1e293b',
    marginBottom: 4,
  },
  activityMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activityDao: {
    fontSize: 12,
    color: '#2563eb',
    fontWeight: '500',
  },
  activityTime: {
    fontSize: 12,
    color: '#94a3b8',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748b',
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#2563eb',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
}); 