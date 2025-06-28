import React, { useState, useRef, useEffect } from "react";
import { 
  View, Text, TextInput, StyleSheet, ScrollView, 
  KeyboardAvoidingView, Platform, TouchableOpacity,
  StatusBar, SafeAreaView
} from "react-native";
import { Button, Card, RadioButton } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import Toast from "react-native-toast-message";
import axios from "axios";
import { getApiBaseUrl } from "../config";
import { Ionicons } from "@expo/vector-icons";

const AddFaculty = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobileNumber: "",
    department: "",
    password: "",
    gender: "Male",
    role: "faculty",
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  
  const navigation = useNavigation();
  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const mobileNumberRef = useRef(null);
  const departmentRef = useRef(null);
  const passwordRef = useRef(null);

  useEffect(() => {
    if (nameRef.current) {
      nameRef.current.focus();
    }
  }, []);

  const handleCancel = () => {
    navigation.goBack();
  };

  const handleChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
    
    // Clear error when user types
    if (errors[name]) {
      setErrors({...errors, [name]: null});
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    
    if (!formData.mobileNumber.trim()) {
      newErrors.mobileNumber = "Mobile number is required";
    } else if (!/^\d{10}$/.test(formData.mobileNumber)) {
      newErrors.mobileNumber = "Mobile number should be 10 digits";
    }
    
    if (!formData.department.trim()) {
      newErrors.department = "Department is required";
    }
    
    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "Please check the form for errors",
        position: "top"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const apiUrl = await getApiBaseUrl();
      const response = await axios.post(`${apiUrl}/api/faculty/register`, formData);
      
      if (response.status === 201) {
        Toast.show({
          type: "success",
          text1: "Faculty Added",
          text2: "New faculty member has been added successfully!",
          position: "top"
        });
        
        setFormData({
          name: "",
          email: "",
          mobileNumber: "",
          department: "",
          password: "",
          gender: "Male",
          role: "faculty",
        });
        
        // Optional: Navigate back after success
        // navigation.goBack();
      }
    } catch (error) {
      console.error("Error adding faculty:", error);
      
      Toast.show({
        type: "error",
        text1: "Registration Failed",
        text2: error.response?.data?.message || "Could not add faculty. Please try again.",
        position: "top"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const renderInputField = (field, label, placeholder, options = {}) => {
    const { keyboardType, secureTextEntry, ref, nextRef } = options;
    
    return (
      <View key={field} style={styles.inputGroup}>
        <Text style={styles.label}>
          {label} <Text style={styles.requiredStar}>*</Text>
        </Text>
        <View style={[
          styles.inputContainer,
          errors[field] ? styles.inputError : null
        ]}>
          {field === "email" && (
            <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
          )}
          {field === "name" && (
            <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
          )}
          {field === "mobileNumber" && (
            <Ionicons name="call-outline" size={20} color="#666" style={styles.inputIcon} />
          )}
          {field === "department" && (
            <Ionicons name="business-outline" size={20} color="#666" style={styles.inputIcon} />
          )}
          {field === "password" && (
            <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
          )}
          <TextInput
            ref={ref}
            style={styles.input}
            placeholder={placeholder}
            value={formData[field]}
            onChangeText={(text) => handleChange(field, text)}
            secureTextEntry={secureTextEntry}
            keyboardType={keyboardType || "default"}
            returnKeyType={nextRef ? "next" : "done"}
            onSubmitEditing={() => {
              if (nextRef && nextRef.current) {
                nextRef.current.focus();
              }
            }}
          />
        </View>
        {errors[field] && (
          <Text style={styles.errorText}>{errors[field]}</Text>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#1E3A8A" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoid}
      >
        <ScrollView 
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleCancel}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Add New Faculty</Text>
            <View style={styles.emptySpace} />
          </View>
          
          <View style={styles.formContainer}>
            <View style={styles.formCard}>
              <View style={styles.formHeader}>
                <Ionicons name="person-add-outline" size={28} color="#1E3A8A" />
                <Text style={styles.formTitle}>Faculty Information</Text>
              </View>
              
              {renderInputField(
                "name", 
                "Full Name", 
                "Enter faculty full name",
                { ref: nameRef, nextRef: emailRef }
              )}
              
              {renderInputField(
                "email", 
                "Email Address", 
                "Enter faculty email address",
                { keyboardType: "email-address", ref: emailRef, nextRef: mobileNumberRef }
              )}
              
              {renderInputField(
                "mobileNumber", 
                "Mobile Number", 
                "Enter 10-digit mobile number",
                { keyboardType: "numeric", ref: mobileNumberRef, nextRef: departmentRef }
              )}
              
              {renderInputField(
                "department", 
                "Department", 
                "Enter faculty department",
                { ref: departmentRef, nextRef: passwordRef }
              )}
              
              {renderInputField(
                "password", 
                "Password", 
                "Enter secure password",
                { secureTextEntry: true, ref: passwordRef }
              )}
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Gender</Text>
                <View style={styles.radioWrapper}>
                  <RadioButton.Group 
                    onValueChange={(value) => handleChange("gender", value)} 
                    value={formData.gender}
                  >
                    <View style={styles.radioContainer}>
                      <View style={styles.radioItem}>
                        <RadioButton 
                          value="Male" 
                          color="#1E3A8A"
                        />
                        <Text style={styles.radioLabel}>Male</Text>
                      </View>
                      <View style={styles.radioItem}>
                        <RadioButton 
                          value="Female" 
                          color="#1E3A8A"
                        />
                        <Text style={styles.radioLabel}>Female</Text>
                      </View>
                      <View style={styles.radioItem}>
                        <RadioButton 
                          value="Other" 
                          color="#1E3A8A"
                        />
                        <Text style={styles.radioLabel}>Other</Text>
                      </View>
                    </View>
                  </RadioButton.Group>
                </View>
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Role</Text>
                <View style={styles.roleContainer}>
                  <Ionicons name="briefcase-outline" size={20} color="#666" style={styles.inputIcon} />
                  <TextInput 
                    style={[styles.input, styles.disabledInput]} 
                    value={formData.role} 
                    editable={false} 
                  />
                </View>
              </View>
              
              <View style={styles.buttonGroup}>
                <TouchableOpacity 
                  style={[styles.button, styles.cancelButton]}
                  onPress={handleCancel}
                >
                  <Ionicons name="close-circle-outline" size={20} color="white" />
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[
                    styles.button, 
                    styles.submitButton,
                    isSubmitting ? styles.disabledButton : null
                  ]}
                  onPress={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Text style={styles.buttonText}>Adding...</Text>
                  ) : (
                    <>
                      <Ionicons name="save-outline" size={20} color="white" />
                      <Text style={styles.buttonText}>Save Faculty</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <Toast />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#1E3A8A",
  },
  keyboardAvoid: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    backgroundColor: "#F5F7FA",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#1E3A8A",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  emptySpace: {
    width: 40, // Match the width of the back button for balanced layout
  },
  formContainer: {
    flex: 1,
    padding: 16,
  },
  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  formHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1E3A8A",
    marginLeft: 12,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  requiredStar: {
    color: "#E53935",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
  },
  inputError: {
    borderColor: "#E53935",
    borderWidth: 1,
  },
  inputIcon: {
    padding: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingRight: 12,
    fontSize: 16,
    color: "#333",
  },
  disabledInput: {
    backgroundColor: "#F5F5F5",
    color: "#666",
  },
  errorText: {
    color: "#E53935",
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  radioWrapper: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    padding: 6,
  },
  radioContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  radioItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
  },
  radioLabel: {
    fontSize: 16,
    color: "#333",
    marginLeft: 4,
  },
  roleContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    backgroundColor: "#F5F5F5",
  },
  buttonGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cancelButton: {
    backgroundColor: "#64748B",
    flex: 1,
    marginRight: 8,
  },
  submitButton: {
    backgroundColor: "#1E3A8A",
    flex: 2,
    marginLeft: 8,
  },
  disabledButton: {
    backgroundColor: "#94A3B8",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
});

export default AddFaculty;