import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { getApiBaseUrl } from "../config.js";
import Toast from "react-native-toast-message";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const EditEvent = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { event } = route.params || {};

  const [formData, setFormData] = useState(event || { coordinators: [] });
  const [apiBaseUrl, setApiBaseUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (event) {
      setFormData(event);
    }
  }, [event]);

  useEffect(() => {
    const fetchApiBaseUrl = async () => {
      const url = await getApiBaseUrl();
      setApiBaseUrl(url);
    };
    fetchApiBaseUrl();
  }, []);
  useEffect(() => {
    if (event) {
      setFormData({
        ...event,
        date: event.date ? event.date.split("T")[0] : "", // Extract only YYYY-MM-DD
      });
    }
  }, [event]);
  
  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleCoordinatorChange = (index, text) => {
    const updatedCoordinators = [...formData.coordinators];
    updatedCoordinators[index] = text;
    setFormData((prev) => ({ ...prev, coordinators: updatedCoordinators }));
  };

  const handleAddCoordinator = () => {
    setFormData((prev) => ({ ...prev, coordinators: [...prev.coordinators, ""] }));
  };

  const handleRemoveCoordinator = (index) => {
    const updatedCoordinators = formData.coordinators.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, coordinators: updatedCoordinators }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name || formData.name.trim() === "") newErrors.name = "Event name is required";
    
    if (!formData.date || formData.date.trim() === "")
      newErrors.date = "Date is required";
    else if (!/^\d{4}-\d{2}-\d{2}$/.test(formData.date))
      newErrors.date = "Date must be in YYYY-MM-DD format";
    
    if (!formData.venue || formData.venue.trim() === "") newErrors.venue = "Venue is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "Please fill in all required fields correctly",
        position: "top",
        visibilityTime: 3000,
      });
      return;
    }

    try {
      setLoading(true);
      
      const response = await fetch(`${apiBaseUrl}/api/events/${formData._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        Toast.show({
          type: "success",
          text1: "Success 🎉",
          text2: "Event updated successfully!",
          position: "top",
          visibilityTime: 2000,
          autoHide: true,
        });

        setTimeout(() => {
          navigation.navigate("EventDetails", { eventId: formData._id });
        }, 2000);
      } else {
        const errorData = await response.json();
        Toast.show({
          type: "error",
          text1: "Error ❌",
          text2: errorData.message || "Failed to update the event.",
          position: "top",
          visibilityTime: 3000,
        });
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error ❌",
        text2: "Failed to update the event. Try again.",
        position: "top",
        visibilityTime: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const renderInput = (label, name, icon, placeholder, keyboardType = "default", multiline = false) => (
    <View style={styles.fieldContainer}>
      <Text style={styles.label}>
        {label} {["name", "date", "venue"].includes(name) && <Text style={styles.requiredStar}>*</Text>}
      </Text>
      <View style={[styles.inputContainer, errors[name] ? styles.inputError : null, multiline ? styles.textAreaContainer : null]}>
        <MaterialCommunityIcons name={icon} size={20} color="#1E3A8A" style={styles.inputIcon} />
        <TextInput
          style={[styles.input, multiline ? styles.textArea : null]}
          value={formData[name] || ""}
          onChangeText={(text) => handleChange(name, text)}
          placeholder={placeholder}
          keyboardType={keyboardType}
          multiline={multiline}
          numberOfLines={multiline ? 4 : 1}
        />
      </View>
      {errors[name] && <Text style={styles.errorText}>{errors[name]}</Text>}
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <MaterialCommunityIcons name="calendar-edit" size={28} color="#1E3A8A" />
        <Text style={styles.title}>Edit Event</Text>
      </View>

      <View style={styles.card}>
        {renderInput("Event Name", "name", "calendar-text", "Enter event name")}
        {renderInput("Date", "date", "calendar", "YYYY-MM-DD")}
        {renderInput("Venue", "venue", "map-marker", "Enter venue location")}
        {renderInput("Description", "description", "text-box", "Describe your event...", "default", true)}

        <Text style={styles.label}>Coordinators</Text>
        {formData.coordinators.map((coordinator, index) => (
          <View key={index} style={styles.coordinatorContainer}>
            <TextInput
              style={styles.input}
              value={coordinator}
              onChangeText={(text) => handleCoordinatorChange(index, text)}
              placeholder="Enter coordinator name"
            />
            <TouchableOpacity onPress={() => handleRemoveCoordinator(index)}>
              <MaterialCommunityIcons name="minus-circle" size={24} color="red" />
            </TouchableOpacity>
          </View>
        ))}
        <TouchableOpacity style={styles.addButton} onPress={handleAddCoordinator}>
          <MaterialCommunityIcons name="plus-circle" size={24} color="green" />
          <Text style={styles.addText}>Add Coordinator</Text>
        </TouchableOpacity>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={() => navigation.goBack()} disabled={loading}>
            <MaterialCommunityIcons name="close" size={20} color="white" />
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleSubmit} disabled={loading}>
            {loading ? <ActivityIndicator color="white" size="small" /> : (
              <>
                <MaterialCommunityIcons name="content-save" size={20} color="white" />
                <Text style={styles.buttonText}>Save Changes</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
      <Toast />
    </ScrollView>
  );
};
const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 16, backgroundColor: "#f0f7ff" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginBottom: 16 },
  title: { fontSize: 24, fontWeight: "bold", color: "#1E3A8A", marginLeft: 8 },
  card: { backgroundColor: "white", borderRadius: 16, padding: 20, shadowColor: "#000", shadowOpacity: 0.1, elevation: 4, marginBottom: 16 },
  label: { fontSize: 16, fontWeight: "600", color: "#333", marginBottom: 6 },
  coordinatorContainer: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  input: { flex: 1, padding: 10, borderWidth: 1, borderColor: "#e0e0e0", borderRadius: 8 },
  addButton: { flexDirection: "row", alignItems: "center", marginTop: 10 },
  addText: { marginLeft: 6, color: "green", fontSize: 16 },
  buttonContainer: { flexDirection: "row", justifyContent: "space-between", marginTop: 8 },
  button: { flex: 1, flexDirection: "row", justifyContent: "center", alignItems: "center", padding: 14, borderRadius: 10 },
  saveButton: { backgroundColor: "#28a745" },
  cancelButton: { backgroundColor: "#6c757d" },
  buttonText: { color: "white", fontSize: 16, fontWeight: "bold", marginLeft: 8 },
});

export default EditEvent;
