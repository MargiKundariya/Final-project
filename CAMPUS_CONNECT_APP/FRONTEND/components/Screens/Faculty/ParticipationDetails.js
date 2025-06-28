import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { View, Text, ActivityIndicator, FlatList, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import * as XLSX from 'xlsx';
import * as FileSystem from 'expo-file-system';
import Toast from "react-native-toast-message";
import { getApiBaseUrl } from '../config';
import axios from "axios";

const ParticipationDetails = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [userName, setUserName] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [baseUrl, setBaseUrl] = useState('');

  const fetchParticipationData = useCallback(async () => {
    try {
      setLoading(true);
      const baseUrl = await getApiBaseUrl();
      const response = await fetch(`${baseUrl}/api/coordinator`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const participationData = await response.json();
      
      // Add additional validation to ensure we have an array
      if (!Array.isArray(participationData)) {
        console.warn("API did not return an array for participation data");
        setStudents([]);
        return;
      }
      
      setStudents(participationData);
      
      // Extract userName from the first record if available
      if (participationData.length > 0 && participationData[0].eventCoordinator) {
        setUserName(participationData[0].eventCoordinator);
      }
    } catch (error) {
      console.error("❌ Error fetching participation data:", error.message);
      Toast.show({ 
        type: "error", 
        text1: "Data Loading Failed", 
        text2: "Could not retrieve participation data. Please try again later."
      });
      setStudents([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchParticipationData();
  }, [fetchParticipationData]);

  useEffect(() => {
    fetchParticipationData();
  }, [fetchParticipationData]);

  
  
  const toggleAttendance = async (id, currentAttendance) => {
    try {
      const baseUrl = await getApiBaseUrl();
      const updatedAttendance = !currentAttendance;
  
      await axios.put(`${baseUrl}/api/participation/${id}/attendance`, {
        attendance: updatedAttendance,
      });
  
      // Update local state
      setStudents(prevStudents =>
        prevStudents.map(student =>
          student._id === id
            ? { ...student, attended: updatedAttendance }
            : student
        )
      );
  
      Toast.show({
        type: "success",
        text1: "Attendance updated",
        text2: `Marked as ${updatedAttendance ? 'present' : 'absent'}.`
      });
    } catch (error) {
      console.error('Error toggling attendance:', error.message);
      Toast.show({
        type: "error",
        text1: "Update Failed",
        text2: "Could not update attendance. Please try again."
      });
    }
  };
  
  
  const exportToExcel = async () => {
    if (students.length === 0) {
      Toast.show({ 
        type: "info", 
        text1: "No Data", 
        text2: "There is no data to export."
      });
      return;
    }
    
    try {
      // Format data for export
      const cleanedData = students.map(({ _id, __v, ...rest }) => {
        // Convert boolean to Yes/No for better readability in Excel
        return {
          ...rest,
          attended: rest.attended ? 'Yes' : 'No',
          exportDate: new Date().toLocaleString()
        };
      });
      
      const worksheet = XLSX.utils.json_to_sheet(cleanedData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Participation Data');
      
      const fileName = `ParticipationData_${new Date().toISOString().split('T')[0]}.xlsx`;
      const path = `${FileSystem.documentDirectory}${fileName}`;
      const excelFile = XLSX.write(workbook, { type: 'base64' });
      
      await FileSystem.writeAsStringAsync(path, excelFile, { encoding: FileSystem.EncodingType.Base64 });
      
      Toast.show({ 
        type: "success", 
        text1: "Export Successful", 
        text2: `File saved as ${fileName}`
      });
    } catch (error) {
      console.error("❌ Error exporting data:", error);
      Toast.show({ 
        type: "error", 
        text1: "Export Failed", 
        text2: "Could not export data to Excel. Please try again."
      });
    }
  };

  // Memoize filtered students to prevent unnecessary recalculations
  const filteredStudents = useMemo(() => {
    return students.filter(student => 
      student.eventName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.department?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [students, searchTerm]);

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Loading participation data...</Text>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Participation List {userName ? `for ${userName}` : ''}
      </Text>
      
      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Search by name, event or department"
          value={searchTerm}
          onChangeText={setSearchTerm}
          style={styles.input}
          clearButtonMode="while-editing"
        />
      </View>
      
      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>
          Total: {students.length} | Present: {students.filter(s => s.attended).length} | 
          Absent: {students.filter(s => !s.attended).length}
        </Text>
      </View>
      
      <TouchableOpacity 
        style={styles.button} 
        onPress={exportToExcel}
      >
        <Text style={styles.buttonText}>Export to Excel</Text>
      </TouchableOpacity>
      
      <FlatList
        data={filteredStudents}
        keyExtractor={item => item._id}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.noData}>
              {searchTerm ? 'No matching records found' : 'No participants available'}
            </Text>
            {searchTerm && (
              <TouchableOpacity onPress={() => setSearchTerm('')}>
                <Text style={styles.clearSearch}>Clear Search</Text>
              </TouchableOpacity>
            )}
          </View>
        }
        renderItem={({ item }) => (
          <View style={[styles.card, item.attended && styles.attendedCard]}>
            <View style={styles.cardContent}>
              <Text style={styles.cardName}>{item.name}</Text>
              <Text style={styles.cardDetail}>Department: {item.department || 'N/A'}</Text>
              <Text style={styles.cardDetail}>Event: {item.eventName || 'N/A'}</Text>
              <Text style={styles.cardDetail}>Status: 
                <Text style={item.attended ? styles.presentText : styles.absentText}>
                  {item.attended ? ' Present' : ' Absent'}
                </Text>
              </Text>
            </View>
            <TouchableOpacity 
              style={[
                styles.attendanceButton, 
                item.attended ? styles.absentButton : styles.presentButton
              ]} 
              onPress={() => toggleAttendance(item._id)}
            >
              <Text style={styles.attendanceButtonText}>
                {item.attended ? 'Mark Absent' : 'Mark Present'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      />
      <Toast />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    padding: 10, 
    backgroundColor: '#fff', 
    flex: 1 
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff'
  },
  loadingText: {
    marginTop: 10,
    color: '#666'
  },
  title: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    marginBottom: 10,
    textAlign: 'center',
    marginTop: 10
  },
  searchContainer: {
    marginBottom: 10
  },
  input: { 
    borderWidth: 1, 
    marginBottom: 5, 
    padding: 10, 
    borderRadius: 5, 
    borderColor: '#ccc',
    backgroundColor: '#f5f5f5'
  },
  statsContainer: {
    marginBottom: 10,
    alignItems: 'center'
  },
  statsText: {
    color: '#666',
    fontSize: 12
  },
  button: { 
    backgroundColor: '#007bff', 
    padding: 12, 
    borderRadius: 5, 
    alignItems: 'center', 
    marginBottom: 15,
    elevation: 2
  },
  buttonText: { 
    color: 'white', 
    fontWeight: 'bold' 
  },
  card: { 
    padding: 15, 
    borderWidth: 1,
    borderColor: '#ddd', 
    backgroundColor: '#f9f9f9', 
    borderRadius: 8, 
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 1
  },
  attendedCard: {
    borderLeftWidth: 5,
    borderLeftColor: '#28a745'
  },
  cardContent: {
    flex: 1
  },
  cardName: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 5
  },
  cardDetail: {
    color: '#555',
    marginBottom: 2
  },
  attendanceButton: { 
    padding: 10, 
    borderRadius: 5, 
    alignItems: 'center',
    minWidth: 110,
    elevation: 1
  },
  presentButton: {
    backgroundColor: '#28a745'
  },
  absentButton: {
    backgroundColor: '#dc3545'
  },
  attendanceButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 13
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 50
  },
  noData: { 
    textAlign: 'center', 
    fontSize: 16, 
    color: 'gray', 
    marginBottom: 10
  },
  clearSearch: {
    color: '#007bff',
    textDecorationLine: 'underline'
  },
  presentText: {
    color: '#28a745',
    fontWeight: 'bold'
  },
  absentText: {
    color: '#dc3545',
    fontWeight: 'bold'
  }
});

export default ParticipationDetails;