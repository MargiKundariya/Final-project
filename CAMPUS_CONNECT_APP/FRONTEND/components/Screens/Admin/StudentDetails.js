import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, FlatList, StyleSheet, TextInput, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Card } from 'react-native-paper';
import axios from 'axios';
import Toast from "react-native-toast-message";
import { getApiBaseUrl } from '../config';

const StudentDetails = () => {
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterType, setFilterType] = useState('name'); // 'name', 'division', 'gender'

  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      const baseUrl = await getApiBaseUrl();
      const response = await axios.get(`${baseUrl}/api/student/students`, {
        withCredentials: true,
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (Array.isArray(response.data)) {
        setStudents(response.data);
      } else {
        console.warn("API did not return an array for student data");
        setStudents([]);
      }
    } catch (error) {
      console.error('❌ Error fetching students:', error.message);
      Toast.show({ 
        type: "error", 
        text1: "Data Loading Failed", 
        text2: "Could not retrieve student data. Please try again later."
      });
      setStudents([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchStudents();
  }, [fetchStudents]);

  // Filter students by search term based on selected filter type
  const filteredStudents = useMemo(() => {
    if (!searchTerm.trim()) return students;

    const term = searchTerm.toLowerCase();
    return students.filter(student => {
      switch (filterType) {
        case 'name':
          return student.name?.toLowerCase().includes(term);
        case 'division':
          return student.division?.toLowerCase().includes(term);
        case 'gender':
          return student.gender?.toLowerCase().includes(term);
        default:
          return (
            student.name?.toLowerCase().includes(term) ||
            student.division?.toLowerCase().includes(term) ||
            student.gender?.toLowerCase().includes(term) ||
            student.id?.toString().includes(term) ||
            student.mobileNumber?.includes(term)
          );
      }
    });
  }, [students, searchTerm, filterType]);

  const FilterButton = ({ title, type }) => (
    <TouchableOpacity
      style={[styles.filterButton, filterType === type && styles.activeFilterButton]}
      onPress={() => setFilterType(type)}
    >
      <Text style={[styles.filterButtonText, filterType === type && styles.activeFilterButtonText]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1e3a8a" />
        <Text style={styles.loadingText}>Loading student data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Student Details</Text>

      {/* Stats Panel */}
      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>
          Total Students: {students.length}
        </Text>
      </View>

      {/* Search Bar */}
      <TextInput
        style={styles.searchInput}
        placeholder="🔍 Search students..."
        placeholderTextColor="#888"
        value={searchTerm}
        onChangeText={setSearchTerm}
        clearButtonMode="while-editing"
      />

      {/* Filter Options */}
      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Filter by:</Text>
        <View style={styles.filterButtonsRow}>
          <FilterButton title="Name" type="name" />
          <FilterButton title="Division" type="division" />
          <FilterButton title="Gender" type="gender" />
          <FilterButton title="All" type="all" />
        </View>
      </View>

      {/* Display Students in Cards */}
      <FlatList
        data={filteredStudents}
        keyExtractor={(item) => item.id.toString()}
        refreshing={refreshing}
        onRefresh={onRefresh}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <View style={styles.cardRowsContainer}>
                <View style={styles.cardRow}>
                  <Text style={styles.cardLabel}>ID:</Text>
                  <Text style={styles.cardValue}>{item.id}</Text>
                </View>
                <View style={styles.cardRow}>
                  <Text style={styles.cardLabel}>Division:</Text>
                  <Text style={styles.cardValue}>{item.division || 'N/A'}</Text>
                </View>
                <View style={styles.cardRow}>
                  <Text style={styles.cardLabel}>Gender:</Text>
                  <Text style={styles.cardValue}>{item.gender || 'N/A'}</Text>
                </View>
                <View style={styles.cardRow}>
                  <Text style={styles.cardLabel}>Phone:</Text>
                  <Text style={styles.cardValue}>{item.mobileNumber || 'N/A'}</Text>
                </View>
              </View>
              
              {/* Status Indicator */}
              <View style={styles.statusIndicator}>
                <View style={[
                  styles.statusDot, 
                  item.status === 'active' ? styles.activeStatus : 
                  item.status === 'inactive' ? styles.inactiveStatus : 
                  styles.defaultStatus
                ]} />
                <Text style={styles.statusText}>
                  {item.status ? item.status.charAt(0).toUpperCase() + item.status.slice(1) : 'Active'}
                </Text>
              </View>
            </Card.Content>
          </Card>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.noResults}>
              {searchTerm ? 'No matching students found' : 'No students available'}
            </Text>
            {searchTerm && (
              <TouchableOpacity onPress={() => setSearchTerm('')}>
                <Text style={styles.clearSearch}>Clear Search</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />
      <Toast />
    </View>
  );
};

// Enhanced Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f9f9f9',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9'
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1e3a8a',
    textAlign: 'center',
    marginBottom: 16,
    marginTop: 10
  },
  statsContainer: {
    backgroundColor: '#e6effd',
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center'
  },
  statsText: {
    color: '#1e3a8a',
    fontWeight: '600',
    fontSize: 14
  },
  searchInput: {
    height: 46,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: '#fff',
    fontSize: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  filterContainer: {
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 6,
    paddingLeft: 4
  },
  filterButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  activeFilterButton: {
    backgroundColor: '#dbeafe',
    borderColor: '#93c5fd',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#4b5563',
  },
  activeFilterButtonText: {
    color: '#1e40af',
    fontWeight: '600',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 2,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#1e3a8a',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e3a8a',
    marginBottom: 10,
  },
  cardRowsContainer: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
    paddingHorizontal: 4,
  },
  cardLabel: {
    fontSize: 15,
    color: '#4b5563',
    fontWeight: '600',
  },
  cardValue: {
    fontSize: 15,
    color: '#1f2937',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  activeStatus: {
    backgroundColor: '#10b981',
  },
  inactiveStatus: {
    backgroundColor: '#ef4444',
  },
  defaultStatus: {
    backgroundColor: '#10b981',
  },
  statusText: {
    fontSize: 13,
    color: '#6b7280',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 50,
    padding: 20,
  },
  noResults: {
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 10,
    color: '#6b7280',
  },
  clearSearch: {
    color: '#1e3a8a',
    textDecorationLine: 'underline',
  },
});

export default StudentDetails;