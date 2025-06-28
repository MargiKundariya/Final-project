import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  StatusBar,
  Animated,
  Dimensions
} from 'react-native';
import axios from 'axios';
import Toast from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';
import Dashboard from './Dashboard';
import { getApiBaseUrl } from '../config';

const { width } = Dimensions.get('window');
const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

const DashboardContainer = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');
  const [animatedValue] = useState(new Animated.Value(0));

  const scrollY = animatedValue.interpolate({
    inputRange: [0, 100],
    outputRange: [0, -10],
    extrapolate: 'clamp'
  });

  const headerOpacity = animatedValue.interpolate({
    inputRange: [0, 60, 90],
    outputRange: [1, 0.8, 0],
    extrapolate: 'clamp'
  });

  const filterOpacity = animatedValue.interpolate({
    inputRange: [0, 100, 120],
    outputRange: [1, 1, 0],
    extrapolate: 'clamp'
  });

  const fetchEvents = useCallback(async (isRefreshing = false) => {
    try {
      if (!isRefreshing) setLoading(true);
      const baseUrl = await getApiBaseUrl();
      let fetchedEvents = [];

      if (filter === 'all') {
        const [ongoingRes, upcomingRes, completedRes] = await Promise.all([
          axios.get(`${baseUrl}/api/events/getOngoing`),
          axios.get(`${baseUrl}/api/events/upcoming`),
          axios.get(`${baseUrl}/api/events/completed`),
        ]);

        const ongoingEvents = ongoingRes.data?.events || ongoingRes.data?.ongoingEvents || [];
        const upcomingEvents = upcomingRes.data?.events || upcomingRes.data?.upcomingEvents || [];
        const completedEvents = (completedRes.data?.events || completedRes.data?.completedEvents || []).map(event => ({
          ...event,
          status: 'completed'
        }));

        fetchedEvents = [...ongoingEvents, ...upcomingEvents, ...completedEvents];
      } else {
        let endpoint = '/api/events';
        if (filter === 'ongoing') endpoint = '/api/events/getOngoing';
        else if (filter === 'upcoming') endpoint = '/api/events/upcoming';
        else if (filter === 'completed') endpoint = '/api/events/completed';

        const response = await axios.get(`${baseUrl}${endpoint}`);
        fetchedEvents = response.data?.events || response.data?.ongoingEvents || response.data?.upcomingEvents || response.data?.completedEvents || [];

        // Tag completed events if needed
        if (filter === 'completed') {
          fetchedEvents = fetchedEvents.map(event => ({
            ...event,
            status: 'completed'
          }));
        }
      }

      setEvents(fetchedEvents);

      if (fetchedEvents.length === 0 && !isRefreshing) {
        Toast.show({
          type: 'info',
          text1: `No ${filter !== 'all' ? filter : ''} events found`,
          position: 'bottom',
        });
      }
    } catch (error) {
      console.error("Error fetching events:", error);
      setEvents([]);
      Toast.show({
        type: 'error',
        text1: 'Error fetching events',
        text2: error.message,
        position: 'bottom',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filter]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchEvents(true);
  }, [fetchEvents]);

  useEffect(() => {
    fetchEvents();
  }, [filter, fetchEvents]);

  const handleFilterChange = (newFilter) => {
    if (newFilter !== filter) {
      setFilter(newFilter);
      animatedValue.setValue(0);
    }
  };

  const renderFilters = () => (
    <Animated.View style={[styles.filterContainer, { opacity: filterOpacity }]}>
      {['all', 'ongoing', 'upcoming', 'completed'].map((type) => (
        <TouchableOpacity
          key={type}
          style={[styles.filterButton, filter === type && styles.activeFilterButton]}
          onPress={() => handleFilterChange(type)}
        >
          <Text style={[styles.filterButtonText, filter === type && styles.activeFilterText]}>
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </Animated.View>
  );

  const prepareEventListWithHeader = (eventList) => {
    if (filter !== 'all') return eventList;

    const ongoingUpcoming = eventList.filter(event => !event.status || event.status !== 'completed');
    const completed = eventList.filter(event => event.status === 'completed');

    if (completed.length === 0) return ongoingUpcoming;

    return [
      ...ongoingUpcoming,
      { _id: 'completed-header', isHeader: true },
      ...completed
    ];
  };

  const renderItem = ({ item }) => {
    if (item.isHeader) {
      return (
        <View style={styles.completedHeaderContainer}>
          <Text style={styles.completedHeaderText}>Completed Events</Text>
        </View>
      );
    }
    return <Dashboard event={item} />;
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="calendar-outline" size={64} color="#ccc" />
      <Text style={styles.noEventsText}>
        No {filter !== 'all' ? filter : ''} events available
      </Text>
      <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
        <Ionicons name="refresh-outline" size={18} color="#fff" />
        <Text style={styles.refreshButtonText}>Refresh</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      <Toast />
      {renderFilters()}

      {loading && !refreshing ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#3498db" />
          <Text style={styles.loadingText}>Loading events...</Text>
        </View>
      ) : (
        <AnimatedFlatList
          data={prepareEventListWithHeader(events)}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={[styles.list, events.length === 0 && styles.emptyList]}
          showsVerticalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: animatedValue } } }],
            { useNativeDriver: true }
          )}
          scrollEventThrottle={16}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#3498db']}
              tintColor="#3498db"
            />
          }
          ListEmptyComponent={renderEmptyState}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    zIndex: 10,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#f1f2f6',
    borderRadius: 20,
    marginHorizontal: 6,
  },
  activeFilterButton: {
    backgroundColor: '#3498db',
  },
  filterButtonText: {
    color: '#7f8c8d',
    fontWeight: '600',
    fontSize: 14,
  },
  activeFilterText: {
    color: '#fff',
  },
  list: {
    paddingTop: 15,
    paddingBottom: 30,
    minHeight: '100%',
  },
  emptyList: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#7f8c8d',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  noEventsText: {
    fontSize: 18,
    color: '#95a5a6',
    marginTop: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  refreshButton: {
    flexDirection: 'row',
    backgroundColor: '#3498db',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: 'center',
  },
  refreshButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 6,
  },
  completedHeaderContainer: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    backgroundColor: '#f8f9fa',
  },
  completedHeaderText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
});

export default DashboardContainer;
