import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TextInput, Button, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import axios from 'axios';
import Toast from 'react-native-toast-message';
import { getApiBaseUrl } from '../config';

const ParticipationDetails = () => {
  const [students, setStudents] = useState([]);
  const [criteriaData, setCriteriaData] = useState({});
  const [marks, setMarks] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);

  const fetchJudgeAndParticipation = useCallback(async () => {
    try {
      const baseUrl = await getApiBaseUrl();
      const { data: judgeData } = await axios.get(`${baseUrl}/api/users/session`, { withCredentials: true });
      if (!judgeData || !judgeData._id) {
        Toast.show({ type: 'error', text1: 'Judge session invalid.' });
        setLoading(false);
        return;
      }

      const { data: judgeDetails } = await axios.get(`${baseUrl}/api/judges/${judgeData._id}`, { withCredentials: true });
      const assignedEvents = judgeDetails.assignedEvents || [];

      if (assignedEvents.length === 0) {
        Toast.show({ type: 'warning', text1: 'No assigned events for this judge.' });
        setLoading(false);
        return;
      }

      // Set default current event
      if (!currentEvent && assignedEvents.length > 0) {
        setCurrentEvent(assignedEvents[0]);
      }

      const { data: participationData } = await axios.get(`${baseUrl}/api/participation/present`, { withCredentials: true });
      const filteredStudents = participationData.filter((p) => assignedEvents.includes(p.eventName));
      setStudents(filteredStudents);

      // Fetch event criteria dynamically
      const criteria = {};
      for (const eventName of assignedEvents) {
        const { data: eventData } = await axios.get(`${baseUrl}/api/events/${encodeURIComponent(eventName)}`);
        if (eventData.event?.criteria) {
          criteria[eventName] = eventData.event.criteria;
        }
      }
      setCriteriaData(criteria);

      // Initialize marks object with empty criteria and total for each student
      const initialMarks = {};
      filteredStudents.forEach(student => {
        initialMarks[student._id] = { total: 0 };
        if (criteria[student.eventName]) {
          criteria[student.eventName].forEach((_, index) => {
            initialMarks[student._id][index] = 0;
          });
        }
      });
      setMarks(initialMarks);

    } catch (error) {
      Toast.show({ type: 'error', text1: 'Error fetching data', text2: error.message });
    } finally {
      setLoading(false);
    }
  }, [currentEvent]);

  useEffect(() => {
    fetchJudgeAndParticipation();
  }, [fetchJudgeAndParticipation]);

  const handleMarkChange = (studentId, criterionIndex, value) => {
    setMarks((prevMarks) => {
      const updatedMarks = { ...prevMarks };
  
      // Convert input to a valid number (default to 0 if invalid)
      const numericValue = parseFloat(value);
      if (!updatedMarks[studentId]) {
        updatedMarks[studentId] = {};
      }
      updatedMarks[studentId][criterionIndex] = !isNaN(numericValue) && numericValue >= 0 ? numericValue : 0;
  
      // Calculate total correctly by summing only criteria marks
      const total = Object.entries(updatedMarks[studentId])
        .filter(([key]) => key !== "total" && !isNaN(parseInt(key)))
        .reduce((sum, [, val]) => sum + val, 0);
  
      updatedMarks[studentId].total = total; // Store updated total
  
      return updatedMarks;
    });
  };
  
  const handleSaveMarks = async (studentId) => {
    try {
      if (!marks[studentId]) {
        Toast.show({ type: 'error', text1: 'No marks found for this student!' });
        return;
      }
  
      // Extract total marks only
      const totalMarks = marks[studentId].total || 0;
  
      // Create payload with only the total
      const payload = { marks: totalMarks };
  
      const baseUrl = await getApiBaseUrl();
      await axios.put(`${baseUrl}/api/participation/${studentId}/marks`, payload, { withCredentials: true });
  
      Toast.show({ type: 'success', text1: 'Total marks updated successfully!' });
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Failed to update marks', text2: error.message });
    }
  };
  const handleSubmitResults = async () => {
    setSubmitting(true);
    try {
      // Sort students by total marks in descending order
      const sortedStudents = [...students].sort(
        (a, b) => (marks[b._id]?.total || 0) - (marks[a._id]?.total || 0)
      );
  
      let winners = [];
      let rank = 1;
      let prevMarks = null;
      let rankCount = 0; // Track how many students share the same rank
  
      for (let i = 0; i < sortedStudents.length; i++) {
        const currentMarks = marks[sortedStudents[i]._id]?.total || 0;
  
        // Assign ranks correctly
        if (prevMarks !== null && currentMarks < prevMarks) {
          rank += rankCount; // Move to next rank properly
          rankCount = 1;
        } else {
          rankCount++;
        }
  
        prevMarks = currentMarks;
  
        // Store only students with rank 1, 2, or 3
        if (rank > 3) break;
  
        winners.push({
          name: sortedStudents[i].name,
          eventName: sortedStudents[i].eventName,
          rank,
        });
      }
  
      const baseUrl = await getApiBaseUrl();
      await axios.post(`${baseUrl}/api/winner`, { winners }, { withCredentials: true });
  
      Toast.show({ type: "success", text1: "Results submitted successfully!" });
    } catch (error) {
      Toast.show({ type: "error", text1: "Failed to submit results", text2: error.message });
    } finally {
      setSubmitting(false);
    }
  };
  
  
  

  // Get unique event names
  const eventNames = [...new Set(students.map(student => student.eventName))];

  // Filter students by current event
  const displayStudents = currentEvent 
    ? students.filter(student => student.eventName === currentEvent)
    : students;

  const renderCriteriaInputs = (student) => {
    if (!criteriaData[student.eventName]) return null;
    
    return criteriaData[student.eventName].map((criterion, index) => (
      <View key={index} style={styles.criteriaRow}>
        <Text style={styles.criteriaLabel}>{criterion}</Text>
        <TextInput
          style={styles.criteriaInput}
          keyboardType="numeric"
          value={(marks[student._id]?.[index] || '').toString()}
          onChangeText={(value) => handleMarkChange(student._id, index, value)}
        />
      </View>
    ));
  };

  return (
    <View style={styles.container}>
      <View style={styles.toastContainer}>
        <Toast />
      </View>
      <Text style={styles.title}>Participation Details</Text>
      
      {loading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : (
        <>
          {/* Event selector tabs */}
          {eventNames.length > 1 && (
            <View style={styles.tabContainer}>
              {eventNames.map(eventName => (
                <TouchableOpacity 
                  key={eventName}
                  style={[
                    styles.tab,
                    currentEvent === eventName && styles.activeTab
                  ]}
                  onPress={() => setCurrentEvent(eventName)}
                >
                  <Text style={[
                    styles.tabText,
                    currentEvent === eventName && styles.activeTabText
                  ]}>
                    {eventName}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Students list */}
          <FlatList
            data={displayStudents}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.eventLabel}>Event: <Text style={styles.eventName}>{item.eventName}</Text></Text>
                
                <View style={styles.criteriaContainer}>
                  {renderCriteriaInputs(item)}
                </View>
                
                <View style={styles.totalContainer}>
                  <Text style={styles.totalLabel}>Total:</Text>
                  <Text style={styles.totalValue}>{marks[item._id]?.total || 0}</Text>
                </View>
                
                <TouchableOpacity 
                  style={styles.saveButton} 
                  onPress={() => handleSaveMarks(item._id)}
                >
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            )}
          />

          <TouchableOpacity 
            style={[styles.submitButton, submitting && styles.disabledButton]} 
            onPress={handleSubmitResults}
            disabled={submitting}
          >
            <Text style={styles.submitButtonText}>
              {submitting ? 'Submitting...' : 'Submit Results'}
            </Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20, 
    backgroundColor: '#f5f7fa' 
  },
  title: { 
    fontSize: 26, 
    fontWeight: 'bold', 
    textAlign: 'center', 
    marginBottom: 20,
    color: '#2c3e50'
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 15,
    borderRadius: 8,
    backgroundColor: '#e0e0e0',
    overflow: 'hidden'
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#e0e0e0'
  },
  activeTab: {
    backgroundColor: '#3498db'
  },
  tabText: {
    fontWeight: '500',
    color: '#555'
  },
  activeTabText: {
    color: 'white',
    fontWeight: 'bold'
  },
  card: { 
    backgroundColor: 'white', 
    padding: 18, 
    marginVertical: 10, 
    borderRadius: 12, 
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 3 
  },
  name: { 
    fontSize: 20, 
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5
  },
  eventLabel: {
    fontSize: 15,
    color: '#7f8c8d',
    marginBottom: 15
  },
  eventName: {
    fontWeight: '500',
    color: '#34495e'
  },
  criteriaContainer: {
    marginVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
    paddingTop: 10
  },
  criteriaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  criteriaLabel: {
    flex: 2,
    fontSize: 16,
    color: '#34495e'
  },
  criteriaInput: { 
    flex: 1,
    borderWidth: 1, 
    borderColor: '#cbd5e0', 
    borderRadius: 8, 
    padding: 10,
    backgroundColor: '#f8fafc',
    textAlign: 'center',
    fontSize: 16
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
    paddingTop: 15,
    marginTop: 5
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50'
  },
  totalValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2980b9'
  },
  saveButton: {
    backgroundColor: '#3498db',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 15,
    alignItems: 'center'
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold'
  },
  submitButton: {
    backgroundColor: '#27ae60',
    paddingVertical: 16,
    borderRadius: 8,
    marginTop: 20,
    marginBottom: 30,
    alignItems: 'center'
  },
  disabledButton: {
    backgroundColor: '#95a5a6',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold'
  },
  toastContainer: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    zIndex: 999,
  },
});

export default ParticipationDetails;