import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator, 
  Alert,
  Image,
  SafeAreaView,
  Platform 
} from "react-native";
import axios from "axios";
import Toast from "react-native-toast-message";
import { getApiBaseUrl } from "../config";
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from '@expo/vector-icons'; // Make sure to install expo/vector-icons

const JudgeDetails = ({ route, navigation }) => {
  const { judge } = route.params;
  const [assignedEvents, setAssignedEvents] = useState(judge.assignedEvents || []);
  const [allEvents, setAllEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const baseUrl = await getApiBaseUrl();
        const response = await axios.get(`${baseUrl}/api/events`);
        setAllEvents(response.data.events);
      } catch (err) {
        setError("Failed to fetch events. Please try again.");
        Toast.show({ 
          type: "error", 
          text1: "Connection Error", 
          text2: "Could not retrieve events. Please check your connection." 
        });
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const handleAssignEvents = async () => {
    if (assignedEvents.length === 0) {
      Alert.alert(
        "No Events Assigned",
        "Are you sure you want to remove all assigned events?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Confirm", onPress: saveAssignedEvents }
        ]
      );
    } else {
      saveAssignedEvents();
    }
  };

  const saveAssignedEvents = async () => {
    try {
      setSaving(true);
      const baseUrl = await getApiBaseUrl();
      await axios.put(`${baseUrl}/api/judges/assign-events/${judge._id}`, { assignedEvents });
      Toast.show({ 
        type: "success", 
        text1: "Success", 
        text2: "Events assigned successfully!" 
      });
    } catch (error) {
      Toast.show({ 
        type: "error", 
        text1: "Error", 
        text2: "Failed to assign events. Please try again." 
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAddEvent = () => {
    if (!selectedEvent) {
      Toast.show({
        type: "info",
        text1: "Selection Required",
        text2: "Please select an event to assign"
      });
      return;
    }
    
    if (!assignedEvents.includes(selectedEvent)) {
      setAssignedEvents([...assignedEvents, selectedEvent]);
      setSelectedEvent(null);
      Toast.show({ 
        type: "success", 
        text1: "Event Added", 
        text2: `${selectedEvent} has been assigned` 
      });
    } else {
      Toast.show({
        type: "info",
        text1: "Already Assigned",
        text2: "This event is already assigned to this judge"
      });
    }
  };

  const handleRemoveEvent = (eventToRemove) => {
    Alert.alert(
      "Remove Event",
      `Are you sure you want to remove "${eventToRemove}" from this judge's assignments?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Remove", 
          style: "destructive",
          onPress: () => {
            setAssignedEvents(assignedEvents.filter((e) => e !== eventToRemove));
            Toast.show({ 
              type: "success", 
              text1: "Event Removed", 
              text2: `${eventToRemove} has been unassigned` 
            });
          } 
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text style={styles.loadingText}>Loading judge details...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={48} color="#ff3b30" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Filter out events that are already assigned
  const availableEvents = allEvents
    .filter(event => !assignedEvents.includes(event.name))
    .map(event => event.name);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Judge Profile Header */}
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            {judge.imageUrl ? (
              <Image 
                source={{ uri: judge.imageUrl }} 
                style={styles.profileImage} 
              />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <Ionicons name="person" size={40} color="#fff" />
              </View>
            )}
            
            <View style={styles.profileInfo}>
              <Text style={styles.judgeName}>{judge.name}</Text>
              <Text style={styles.judgeDepartment}>{judge.department || 'Department not specified'}</Text>
              <View style={styles.contactRow}>
                <Ionicons name="mail-outline" size={14} color="#666" />
                <Text style={styles.contactText}>{judge.email}</Text>
              </View>
              {judge.mobileNumber && (
                <View style={styles.contactRow}>
                  <Ionicons name="call-outline" size={14} color="#666" />
                  <Text style={styles.contactText}>{judge.mobileNumber}</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Assigned Events Section */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="calendar" size={20} color="#6200ee" />
            <Text style={styles.sectionTitle}>Assigned Events</Text>
          </View>

          {assignedEvents.length > 0 ? (
            <View style={styles.eventsList}>
              {assignedEvents.map((event, index) => (
                <View key={index} style={styles.eventItem}>
                  <View style={styles.eventInfo}>
                    <Ionicons name="trophy-outline" size={18} color="#6200ee" />
                    <Text style={styles.eventName}>{event}</Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.removeButton}
                    onPress={() => handleRemoveEvent(event)}
                  >
                    <Ionicons name="close-circle" size={24} color="#ff3b30" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyStateContainer}>
              <Ionicons name="calendar-outline" size={40} color="#ccc" />
              <Text style={styles.emptyStateText}>No events assigned yet</Text>
            </View>
          )}
        </View>

        {/* Assign New Events Section */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="add-circle" size={20} color="#6200ee" />
            <Text style={styles.sectionTitle}>Assign New Event</Text>
          </View>
          
          {availableEvents.length > 0 ? (
            <>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={selectedEvent}
                  onValueChange={(itemValue) => setSelectedEvent(itemValue)}
                  style={styles.picker}
                  itemStyle={styles.pickerItem}
                >
                  <Picker.Item label="Select an event" value={null} />
                  {availableEvents.map((eventName, index) => (
                    <Picker.Item key={index} label={eventName} value={eventName} />
                  ))}
                </Picker>
              </View>

              <TouchableOpacity 
                style={styles.addButton}
                onPress={handleAddEvent}
              >
                <Ionicons name="add" size={20} color="#fff" />
                <Text style={styles.buttonText}>Add Selected Event</Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.emptyStateContainer}>
              <Ionicons name="checkmark-circle" size={40} color="#4cd964" />
              <Text style={styles.emptyStateText}>All available events have been assigned</Text>
            </View>
          )}
        </View>

        {/* Save Button */}
        <TouchableOpacity 
          style={[styles.saveButton, saving && styles.savingButton]}
          onPress={handleAssignEvents}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons name="save" size={20} color="#fff" />
              <Text style={styles.saveButtonText}>Save Assignments</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
      <Toast />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  container: { 
    padding: 16,
    paddingBottom: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: "#f9f9f9",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: "#f9f9f9",
  },
  errorText: {
    fontSize: 16,
    color: "#666",
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: "#6200ee",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  profileCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  profileImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#6200ee",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  judgeName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  judgeDepartment: {
    fontSize: 16,
    color: "#666",
    marginBottom: 8,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  contactText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 6,
  },
  sectionCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 8,
  },
  eventsList: {
    marginBottom: 8,
  },
  eventItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  eventInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  eventName: {
    fontSize: 16,
    color: "#333",
    marginLeft: 8,
    flex: 1,
  },
  removeButton: {
    padding: 4,
  },
  emptyStateContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  emptyStateText: {
    marginTop: 12,
    fontSize: 16,
    color: "#999",
    textAlign: "center",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
    marginBottom: 16,
    overflow: 'hidden'
  },
  picker: {
    ...Platform.select({
      ios: {
        height: 150,
      },
      android: {
        height: 50,
      }
    })
  },
  pickerItem: {
    ...Platform.select({
      ios: {
        height: 120,
      }
    })
  },
  addButton: {
    backgroundColor: "#6200ee",
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 8,
  },
  saveButton: {
    backgroundColor: "#4cd964",
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    marginTop: 8,
  },
  savingButton: {
    backgroundColor: "#8fe5a0",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
});

export default JudgeDetails;