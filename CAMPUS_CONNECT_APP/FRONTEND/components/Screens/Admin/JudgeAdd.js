import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Image, 
  ScrollView, 
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Toast from 'react-native-toast-message';
import { getApiBaseUrl } from '../config';
import { Ionicons } from '@expo/vector-icons'; // Make sure to install expo/vector-icons

const JudgeAdd = ({ navigation }) => {
  const [formData, setFormData] = useState({
    name: '',
    mobileNumber: '',
    department: '',
    email: '',
    password: '',
    gender: '',
    role: 'judge',
    imageUrl: null,
    details: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const nameRef = useRef();
  const mobileRef = useRef();
  const departmentRef = useRef();
  const emailRef = useRef();
  const passwordRef = useRef();
  const detailsRef = useRef();

  useEffect(() => {
    nameRef.current?.focus();
    
    // Request permissions on component mount
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Toast.show({ 
          type: 'info', 
          text1: 'Permission Required', 
          text2: 'Photo permissions are needed to upload profile images.' 
        });
      }
    })();
  }, []);
  const validateForm = () => {
    let tempErrors = {};
    
    if (!formData.name.trim()) tempErrors.name = 'Name is required';
  
    if (!formData.mobileNumber.trim()) {
      tempErrors.mobileNumber = 'Mobile number is required';
    } else if (!/^[1-9]\d{9}$/.test(formData.mobileNumber)) {
      tempErrors.mobileNumber = 'Enter a valid 10-digit mobile number (should not start with 0)';
    }
    
    if (!formData.department.trim()) tempErrors.department = 'Department is required';
    
    if (!formData.email.trim()) {
      tempErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      tempErrors.email = 'Invalid email format';
    }
    
    if (!formData.password.trim()) {
      tempErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      tempErrors.password = 'Password must be at least 6 characters';
    }
    
    if (!formData.gender) tempErrors.gender = 'Gender selection is required';
    if (!formData.details.trim()) tempErrors.details = 'Details are required';
    
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };
  

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleImagePick = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setFormData((prev) => ({ ...prev, imageUrl: result.assets[0].uri }));
      }
    } catch (error) {
      Toast.show({ 
        type: 'error', 
        text1: 'Image Selection Failed', 
        text2: 'Unable to select image. Please try again.' 
      });
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Toast.show({ 
        type: 'error', 
        text1: 'Validation Error', 
        text2: 'Please correct the errors in the form.' 
      });
      return;
    }

    setIsSubmitting(true);

    let form = new FormData();
    Object.keys(formData).forEach(key => {
      if (key !== 'imageUrl') {
        form.append(key, formData[key]);
      }
    });

    if (formData.imageUrl) {
      let filename = formData.imageUrl.split('/').pop();
      let match = /\.(\w+)$/.exec(filename);
      let type = match ? `image/${match[1]}` : 'image/jpeg';

      form.append('judgephoto', { uri: formData.imageUrl, name: filename, type });
    }

    try {
      const apiBaseUrl = await getApiBaseUrl();
      let response = await fetch(`${apiBaseUrl}/api/faculty/register`, {
        method: 'POST',
        body: form,
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      let result = await response.json();

      if (response.ok) {
        Toast.show({ 
          type: 'success', 
          text1: 'Success', 
          text2: 'Judge registered successfully!' 
        });
        
        // Reset form
        setFormData({
          name: '',
          mobileNumber: '',
          department: '',
          email: '',
          password: '',
          gender: '',
          role: 'judge',
          imageUrl: null,
          details: '',
        });
        
        // Optional: Navigate back or to another screen
        // navigation.goBack();
      } else {
        let errorMessage = typeof result.message === 'string' 
          ? result.message 
          : JSON.stringify(result.message);
          
        Toast.show({ 
          type: 'error', 
          text1: 'Registration Failed', 
          text2: errorMessage || 'Failed to register judge.' 
        });
      }
    } catch (error) {
      console.error('Error:', error);
      Toast.show({ 
        type: 'error', 
        text1: 'Network Error', 
        text2: 'Connection failed. Please check your internet and try again.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const InputField = ({ 
    placeholder, 
    value, 
    onChangeText, 
    keyboardType = 'default', 
    secureTextEntry = false,
    multiline = false,
    ref,
    error,
    onSubmitEditing,
    returnKeyType
  }) => (
    <View style={styles.inputContainer}>
      <TextInput
        style={[
          styles.input, 
          multiline && styles.multilineInput,
          error && styles.inputError
        ]}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        multiline={multiline}
        ref={ref}
        onSubmitEditing={onSubmitEditing}
        returnKeyType={returnKeyType || 'next'}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView 
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.heading}>Add New Judge</Text>
          <Text style={styles.subheading}>Complete the form below to register a judge</Text>
        </View>

        {/* Profile Image Selection */}
        <View style={styles.profileImageContainer}>
          {formData.imageUrl ? (
            <Image source={{ uri: formData.imageUrl }} style={styles.profileImage} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="person" size={40} color="#ccc" />
            </View>
          )}
          <TouchableOpacity style={styles.imagePickerButton} onPress={handleImagePick}>
            <Text style={styles.imagePickerText}>
              {formData.imageUrl ? 'Change Photo' : 'Upload Photo'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Form Fields */}
        <View style={styles.formContainer}>
          <InputField
            placeholder="Full Name"
            value={formData.name}
            onChangeText={(value) => handleChange('name', value)}
            ref={nameRef}
            error={errors.name}
            onSubmitEditing={() => mobileRef.current?.focus()}
          />

          <InputField
            placeholder="Mobile Number"
            value={formData.mobileNumber}
            onChangeText={(value) => handleChange('mobileNumber', value)}
            keyboardType="phone-pad"
            ref={mobileRef}
            error={errors.mobileNumber}
            onSubmitEditing={() => departmentRef.current?.focus()}
          />

          <InputField
            placeholder="Department"
            value={formData.department}
            onChangeText={(value) => handleChange('department', value)}
            ref={departmentRef}
            error={errors.department}
            onSubmitEditing={() => emailRef.current?.focus()}
          />

          <InputField
            placeholder="Email Address"
            value={formData.email}
            onChangeText={(value) => handleChange('email', value)}
            keyboardType="email-address"
            ref={emailRef}
            error={errors.email}
            onSubmitEditing={() => passwordRef.current?.focus()}
          />

          <InputField
            placeholder="Password"
            value={formData.password}
            onChangeText={(value) => handleChange('password', value)}
            secureTextEntry={true}
            ref={passwordRef}
            error={errors.password}
            onSubmitEditing={() => detailsRef.current?.focus()}
          />

          {/* Gender Selection */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Gender</Text>
            <View style={styles.radioGroup}>
              {['Male', 'Female', 'Other'].map((option) => (
                <TouchableOpacity 
                  key={option} 
                  style={styles.radioButton} 
                  onPress={() => handleChange('gender', option)}
                >
                  <View style={[
                    styles.radioOuter, 
                    formData.gender === option && styles.radioSelected
                  ]}>
                    {formData.gender === option && <View style={styles.radioInner} />}
                  </View>
                  <Text style={styles.radioText}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {errors.gender && <Text style={styles.errorText}>{errors.gender}</Text>}
          </View>

          <InputField
            placeholder="Professional Details"
            value={formData.details}
            onChangeText={(value) => handleChange('details', value)}
            multiline={true}
            ref={detailsRef}
            error={errors.details}
            returnKeyType="done"
          />

          {/* Submit Button */}
          <TouchableOpacity 
            style={[styles.button, isSubmitting && styles.buttonDisabled]} 
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.buttonText}>REGISTER JUDGE</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
      <Toast />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  header: {
    marginBottom: 20,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  subheading: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 5,
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  profileImageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 10,
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  imagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  imagePickerButton: {
    backgroundColor: '#6200ee',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  imagePickerText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  inputContainer: {
    marginBottom: 16,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  inputError: {
    borderColor: '#ff3b30',
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  errorText: {
    color: '#ff3b30',
    fontSize: 12,
    marginTop: 4,
  },
  radioGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
    marginBottom: 8,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#6200ee',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: '#6200ee',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#6200ee',
  },
  radioText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
  },
  button: {
    backgroundColor: '#6200ee',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#b39ddb',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default JudgeAdd;