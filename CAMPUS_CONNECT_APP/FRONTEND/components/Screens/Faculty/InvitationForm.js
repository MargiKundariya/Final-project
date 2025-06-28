import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Image, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator,
  SafeAreaView,
  Dimensions
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import axios from "axios";
import Toast from "react-native-toast-message";
import { getApiBaseUrl } from "../config";
import { Ionicons } from "@expo/vector-icons";

const screenWidth = Dimensions.get('window').width;

const InvitationForm = () => {
  const [formData, setFormData] = useState({
    judgeName: "",
    departmentName: "",
    eventName: "",
    eventDate: "",
    eventTime: "",
  });

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [invitationImage, setInvitationImage] = useState(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const baseUrl = await getApiBaseUrl();
        const response = await axios.get(`${baseUrl}/api/events`);
        
        if (response.data.success && Array.isArray(response.data.events)) {
          setEvents(response.data.events);
          setError(null);
        } else {
          throw new Error("Invalid response format");
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const handleEventChange = (eventName) => {
    const selectedEvent = events.find((event) => event.name === eventName);
    if (selectedEvent) {
      // Format the event date to YYYY-MM-DD (removing any time zone or extra data)
      const formattedDate = selectedEvent.date.split("T")[0]; 
  
      setFormData({
        ...formData,
        eventName: selectedEvent.name,
        eventDate: formattedDate, // Only YYYY-MM-DD
        eventTime: selectedEvent.startTime,
      });
    }
  };
  
  const handleSubmit = async () => {
    if (!formData.eventName) {
      Toast.show({
        type: "error",
        text1: "Missing Event",
        text2: "Please select an event before generating an invitation.",
        visibilityTime: 3000,
      });
      return;
    }

    if (!formData.judgeName.trim()) {
      Toast.show({
        type: "error",
        text1: "Missing Information",
        text2: "Please enter the judge's name.",
        visibilityTime: 3000,
      });
      return;
    }

    // Simulate API call
    setGenerating(true);
    
    // Simulate network delay
    setTimeout(() => {
      setInvitationImage("https://via.placeholder.com/600x400.png?text=Official+Invitation");
      setGenerating(false);
      
      Toast.show({
        type: "success",
        text1: "Invitation Ready",
        text2: "Your invitation has been generated successfully!",
        visibilityTime: 3000,
      });
    }, 1500);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    
    const date = new Date(dateString);
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4361ee" />
        <Text style={styles.loadingText}>Loading events...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.heading}>Create Invitation</Text>
          <Text style={styles.subheading}>Generate official invitations for judges and guests</Text>
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={24} color="#ef476f" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.formCard}>
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Guest Information</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                <Ionicons name="person" size={16} color="#4361ee" /> Judge Name
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Enter the full name of the judge"
                placeholderTextColor="#adb5bd"
                value={formData.judgeName}
                onChangeText={(text) => setFormData({ ...formData, judgeName: text })}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                <Ionicons name="business" size={16} color="#4361ee" /> Department
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Enter department or organization"
                placeholderTextColor="#adb5bd"
                value={formData.departmentName}
                onChangeText={(text) => setFormData({ ...formData, departmentName: text })}
              />
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Event Details</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                <Ionicons name="calendar" size={16} color="#4361ee" /> Select Event
              </Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.eventName}
                  onValueChange={(value) => handleEventChange(value)}
                  style={styles.picker}
                  dropdownIconColor="#4361ee"
                >
                  <Picker.Item label="Select an event" value="" color="#adb5bd" />
                  {events.map((event, index) => (
                    <Picker.Item key={index} label={event.name} value={event.name} />
                  ))}
                </Picker>
              </View>
            </View>

            <View style={styles.detailsRow}>
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>
                  <Ionicons name="today" size={16} color="#4361ee" /> Date
                </Text>
                <View style={[styles.input, styles.readOnlyInput]}>
                  <Text style={styles.readOnlyText}>
                    {formData.eventDate ? formatDate(formData.eventDate) : "Select an event"}
                  </Text>
                </View>
              </View>

              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>
                  <Ionicons name="time" size={16} color="#4361ee" /> Time
                </Text>
                <View style={[styles.input, styles.readOnlyInput]}>
                  <Text style={styles.readOnlyText}>
                    {formData.eventTime || "Select an event"}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <TouchableOpacity 
            style={[
              styles.submitButton, 
              (!formData.eventName || !formData.judgeName) && styles.disabledButton
            ]} 
            onPress={handleSubmit}
            disabled={generating || !formData.eventName || !formData.judgeName}
          >
            {generating ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <>
                <Ionicons name="create-outline" size={20} color="#ffffff" />
                <Text style={styles.submitButtonText}>Generate Invitation</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {invitationImage && (
          <View style={styles.invitationCard}>
            <View style={styles.inviteHeaderRow}>
              <Text style={styles.inviteTitle}>Your Invitation</Text>
              <View style={styles.inviteActions}>
                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons name="share-outline" size={20} color="#4361ee" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons name="download-outline" size={20} color="#4361ee" />
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.inviteImageContainer}>
              <Image 
                source={{ uri: invitationImage }} 
                style={styles.inviteImage}
                resizeMode="contain"
              />
            </View>
            <View style={styles.inviteDetails}>
              <Text style={styles.inviteDetailRow}>
                <Text style={styles.inviteDetailLabel}>For: </Text>
                <Text style={styles.inviteDetailValue}>{formData.judgeName}</Text>
              </Text>
              <Text style={styles.inviteDetailRow}>
                <Text style={styles.inviteDetailLabel}>Department: </Text>
                <Text style={styles.inviteDetailValue}>{formData.departmentName || "N/A"}</Text>
              </Text>
              <Text style={styles.inviteDetailRow}>
                <Text style={styles.inviteDetailLabel}>Event: </Text>
                <Text style={styles.inviteDetailValue}>{formData.eventName}</Text>
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
      <Toast />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6c757d",
  },
  header: {
    marginBottom: 24,
    alignItems: "center",
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#212529",
    marginBottom: 4,
  },
  subheading: {
    fontSize: 15,
    color: "#6c757d",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff3f5",
    borderWidth: 1,
    borderColor: "#ef476f",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    flex: 1,
    marginLeft: 8,
    color: "#ef476f",
    fontSize: 14,
  },
  formCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 24,
  },
  formSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#343a40",
    marginBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: "#e9ecef",
    marginVertical: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  detailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  halfWidth: {
    width: "48%",
  },
  label: {
    flexDirection: "row",
    alignItems: "center",
    fontSize: 14,
    fontWeight: "500",
    color: "#495057",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#dee2e6",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: "#212529",
  },
  pickerContainer: {
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#dee2e6",
    borderRadius: 8,
    overflow: "hidden",
  },
  picker: {
    height: 45,
  },
  readOnlyInput: {
    backgroundColor: "#e9ecef",
    justifyContent: "center",
  },
  readOnlyText: {
    color: "#6c757d",
    fontSize: 15,
  },
  submitButton: {
    backgroundColor: "#4361ee",
    borderRadius: 8,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  disabledButton: {
    backgroundColor: "#adb5bd",
  },
  submitButtonText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 16,
    marginLeft: 8,
  },
  invitationCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inviteHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  inviteTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#212529",
  },
  inviteActions: {
    flexDirection: "row",
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f8f9fa",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  inviteImageContainer: {
    width: "100%",
    height: 250,
    backgroundColor: "#f8f9fa",
    justifyContent: "center",
    alignItems: "center",
  },
  inviteImage: {
    width: "90%",
    height: "90%",
    borderRadius: 4,
  },
  inviteDetails: {
    padding: 16,
  },
  inviteDetailRow: {
    marginBottom: 8,
    fontSize: 15,
  },
  inviteDetailLabel: {
    fontWeight: "bold",
    color: "#495057",
  },
  inviteDetailValue: {
    color: "#212529",
  }
});

export default InvitationForm;