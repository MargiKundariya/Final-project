import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import axios from "axios";
import Toast from "react-native-toast-message";
import { getApiBaseUrl } from "../config.js";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const EditFaculty = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { member } = route.params || {};

  const [formData, setFormData] = useState(member || {});
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (member) {
      setFormData(member);
    }
  }, [member]);

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name?.trim()) {
      newErrors.name = "Name is required";
    }
    
    if (!formData.mobileNumber?.trim()) {
      newErrors.mobileNumber = "Mobile number is required";
    } else if (!/^\d{10}$/.test(formData.mobileNumber.replace(/\s/g, ''))) {
      newErrors.mobileNumber = "Please enter a valid 10-digit mobile number";
    }
    
    if (!formData.email?.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    if (!formData.department?.trim()) {
      newErrors.department = "Department is required";
    }
    
    if (!formData.gender?.trim()) {
      newErrors.gender = "Gender is required";
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
        visibilityTime: 3000,
        position: "top",
      });
      return;
    }
    
    setLoading(true);
    try {
      const apiUrl = await getApiBaseUrl();
      await axios.put(`${apiUrl}/api/faculty/${member._id}`, formData);
      
      Toast.show({
        type: "success",
        text1: "Faculty Updated",
        text2: "The faculty member details have been updated successfully!",
        visibilityTime: 3000,
        position: "top",
      });

      setTimeout(() => {
        navigation.navigate("FacultyDetailsTable");
      }, 2000);
      
    } catch (error) {
      console.error("Error updating faculty:", error.message);
      
      Toast.show({
        type: "error",
        text1: "Update Failed",
        text2: error.response?.data?.message || "Could not update faculty details",
        visibilityTime: 3000,
        position: "top",
      });
    } finally {
      setLoading(false);
    }
  };

  const genderOptions = ["Male", "Female", "Other"];
  
  const InputField = ({ label, icon, value, onChangeText, keyboardType, error, placeholder }) => (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputWrapper, error ? styles.inputError : null]}>
        <Icon name={icon} size={20} color="#6B7280" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType || "default"}
          placeholder={placeholder || `Enter ${label.toLowerCase()}`}
          placeholderTextColor="#9CA3AF"
        />
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Icon name="arrow-left" size={24} color="#4F46E5" />
            </TouchableOpacity>
            <Text style={styles.title}>Edit Faculty Profile</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {formData.name ? formData.name.charAt(0).toUpperCase() : "F"}
                </Text>
              </View>
              <Text style={styles.subtitle}>{formData.name || "Faculty Member"}</Text>
            </View>

            <InputField
              label="Full Name"
              icon="account"
              value={formData.name}
              onChangeText={(text) => handleChange("name", text)}
              error={errors.name}
            />

            <InputField
              label="Mobile Number"
              icon="phone"
              value={formData.mobileNumber}
              onChangeText={(text) => handleChange("mobileNumber", text)}
              keyboardType="numeric"
              error={errors.mobileNumber}
            />

            <InputField
              label="Email Address"
              icon="email"
              value={formData.email}
              onChangeText={(text) => handleChange("email", text)}
              keyboardType="email-address"
              error={errors.email}
            />

            <InputField
              label="Department"
              icon="domain"
              value={formData.department}
              onChangeText={(text) => handleChange("department", text)}
              error={errors.department}
            />

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Gender</Text>
              <View style={styles.genderContainer}>
                {genderOptions.map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.genderOption,
                      formData.gender === option && styles.genderSelected,
                    ]}
                    onPress={() => handleChange("gender", option)}
                  >
                    <Text style={[
                      styles.genderText,
                      formData.gender === option && styles.genderTextSelected,
                    ]}>
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {errors.gender ? <Text style={styles.errorText}>{errors.gender}</Text> : null}
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={[styles.button, styles.cancelButton]} 
                onPress={() => navigation.navigate("FacultyDetailsTable")}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.button, styles.saveButton, loading && styles.disabledButton]} 
                onPress={handleSubmit} 
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <>
                    <Icon name="content-save" size={20} color="#FFFFFF" style={styles.buttonIcon} />
                    <Text style={styles.saveButtonText}>Save Changes</Text>
                  </>
                )}
              </TouchableOpacity>
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
    backgroundColor: "#F3F4F6",
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginLeft: 12,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#4B5563",
    marginTop: 8,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 2.65,
    elevation: 2,
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#4F46E5",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#4B5563",
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 12,
  },
  inputError: {
    borderColor: "#EF4444",
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 46,
    fontSize: 16,
    color: "#1F2937",
  },
  errorText: {
    fontSize: 12,
    color: "#EF4444",
    marginTop: 4,
  },
  genderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  genderOption: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    marginHorizontal: 4,
  },
  genderSelected: {
    backgroundColor: "#EEF2FF",
    borderColor: "#4F46E5",
  },
  genderText: {
    color: "#4B5563",
    fontWeight: "500",
  },
  genderTextSelected: {
    color: "#4F46E5",
    fontWeight: "600",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
  },
  button: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
  saveButton: {
    backgroundColor: "#4F46E5",
    marginLeft: 8,
  },
  cancelButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    marginRight: 8,
  },
  disabledButton: {
    backgroundColor: "#A5B4FC",
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },
  cancelButtonText: {
    color: "#4B5563",
    fontWeight: "600",
    fontSize: 16,
  },
  buttonIcon: {
    marginRight: 8,
  },
});

export default EditFaculty;