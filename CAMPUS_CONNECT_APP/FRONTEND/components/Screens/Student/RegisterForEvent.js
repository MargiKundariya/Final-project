import React, { useState,useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform,
  ActivityIndicator 
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import ScannerModal from './ScannerModal';
import { getApiBaseUrl } from '../config';
import Toast from 'react-native-toast-message';

const RegisterForEvent = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const { eventName, date: rawDate, scanner } = route.params || {};
  const formattedDate = rawDate
    ? new Date(rawDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
    : '';

  const [participationData, setParticipationData] = useState({
    name: '',
    department: '',
    year: '',
    contactNumber: '',
  });
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!participationData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!participationData.department.trim()) {
      newErrors.department = 'Department is required';
    }
    
    if (!participationData.year.trim()) {
      newErrors.year = 'Year is required';
    }
    
    if (!participationData.contactNumber.trim()) {
      newErrors.contactNumber = 'Contact number is required';
    } else if (!/^\d{10}$/.test(participationData.contactNumber.trim())) {
      newErrors.contactNumber = 'Please enter a valid 10-digit number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setParticipationData((prevState) => ({
      ...prevState,
      [field]: value,
    }));
    
    // Clear error when typing
    if (errors[field]) {
      setErrors({...errors, [field]: null});
    }
  };

  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const baseUrl = await getApiBaseUrl();
        const response = await axios.get(`${baseUrl}/api/users/session`);
        
        if (response.status === 200 && response.data?.name) {
          setParticipationData((prev) => ({ ...prev, name: response.data.name }));
        }
      } catch (error) {
        console.error('Error fetching user name:', error.response || error.message);
      }
    };
  
    fetchUserName();
  }, []);
  
  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      const baseUrl = await getApiBaseUrl();

      const response = await axios.post(`${baseUrl}/api/participation/addsingle`, {
        ...participationData,
        eventName,
        date: rawDate,
      });

      if (response.status === 201) {
        Toast.show({ 
          type: 'success', 
          text1: 'Registration Successful!', 
          text2: 'You have been registered for the event',
          position: 'bottom'
        });
        setShowScannerModal(true);
      } else {
        Toast.show({ 
          type: 'error', 
          text1: 'Registration Failed', 
          text2: 'Please try again later',
          position: 'bottom'
        });
      }
    } catch (error) {
      console.error('Error registering for event:', error.response || error.message);
      Toast.show({ 
        type: 'error', 
        text1: 'Registration Error', 
        text2: error.response?.data?.message || 'Connection error. Please try again.',
        position: 'bottom'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigation.navigate('DashboardContainer');
  };

  const closeScannerModal = () => {
    setShowScannerModal(false);
    navigation.navigate('DashboardContainer');
  };

  const renderInput = (label, field, placeholder, keyboardType = 'default', editable = true) => (
    <View style={styles.formField}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[
          styles.input, 
          !editable && styles.disabledInput,
          errors[field] && styles.inputError
        ]}
        value={participationData[field] || ''}
        onChangeText={(value) => handleInputChange(field, value)}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        keyboardType={keyboardType}
        editable={editable}
      />
      {errors[field] && <Text style={styles.errorText}>{errors[field]}</Text>}
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <View style={styles.headerContainer}>
            <Text style={styles.heading}>Register for Event</Text>
            <View style={styles.eventInfoContainer}>
              <View style={styles.eventInfo}>
                <Text style={styles.eventName}>{eventName || 'Event Name'}</Text>
                <Text style={styles.eventDate}>{formattedDate || 'Event Date'}</Text>
              </View>
            </View>
          </View>

          <View style={styles.formContainer}>
            {renderInput('Full Name', 'name', 'Enter your full name')}
            <View style={styles.formField}>
  <Text style={styles.label}>Department</Text>
  <View style={styles.radioGroup}>
    {['BBA', 'BCA'].map((dept) => (
      <TouchableOpacity
        key={dept}
        style={[
          styles.radioButton,
          participationData.department === dept && styles.radioSelected
        ]}
        onPress={() => handleInputChange('department', dept)}
      >
        <Text 
          style={[
            styles.radioText, 
            participationData.department === dept && styles.radioTextSelected
          ]}
        >
          {dept}
        </Text>
      </TouchableOpacity>
    ))}
  </View>
  {errors.department && <Text style={styles.errorText}>{errors.department}</Text>}
</View>
<View style={styles.formField}>
  <Text style={styles.label}>Year of Study</Text>
  <View style={styles.radioGroup}>
    {['1st', '2nd', '3rd'].map((year) => (
      <TouchableOpacity
        key={year}
        style={[
          styles.radioButton,
          participationData.year === year && styles.radioSelected
        ]}
        onPress={() => handleInputChange('year', year)}
      >
        <Text 
          style={[
            styles.radioText, 
            participationData.year === year && styles.radioTextSelected
          ]}
        >
          {year}
        </Text>
      </TouchableOpacity>
    ))}
  </View>
  {errors.year && <Text style={styles.errorText}>{errors.year}</Text>}
</View>


            {renderInput('Contact Number', 'contactNumber', 'Enter 10-digit mobile number', 'phone-pad')}
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancel}
              disabled={isSubmitting}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.submitButton, isSubmitting && styles.disabledButton]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.submitButtonText}>Register</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {showScannerModal && <ScannerModal scanner={scanner} onClose={closeScannerModal} />}
        <Toast />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#F3F4F6',
    padding: 16,
  },
  radioGroup: { flexDirection: 'row', gap: 10, marginTop: 6 },
radioButton: { 
  padding: 12, 
  borderWidth: 1, 
  borderColor: '#4F46E5', 
  borderRadius: 8, 
  alignItems: 'center',
  justifyContent: 'center'
},
radioSelected: { backgroundColor: '#4F46E5' },
radioText: { color: '#4F46E5', fontSize: 16, fontWeight: '600' },
radioTextSelected: { color: '#FFFFFF' },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginVertical: 16,
  },
  headerContainer: {
    padding: 20,
    backgroundColor: '#4F46E5',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
  },
  eventInfoContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    padding: 16,
  },
  eventInfo: {
    alignItems: 'center',
  },
  eventName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  eventDate: {
    fontSize: 16,
    color: '#E0E7FF',
  },
  formContainer: {
    padding: 20,
  },
  formField: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
    marginBottom: 6,
  },
  input: {
    width: '100%',
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
  },
  disabledInput: {
    backgroundColor: '#F3F4F6',
    color: '#6B7280',
  },
  inputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    marginTop: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  submitButton: {
    backgroundColor: '#4F46E5',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    flex: 1,
    marginLeft: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#A5B4FC',
  },
});

export default RegisterForEvent;