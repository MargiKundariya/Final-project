import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { TextInput, Button, Text, RadioButton, Divider, HelperText } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import Axios from 'axios';
import { getApiBaseUrl } from './config';

// Get screen width to calculate field widths
const screenWidth = Dimensions.get('window').width;

const Register = () => {
  const navigation = useNavigation();
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    password: '',
    mno: '',
    gender: 'male',
    id: '',
    division: '',
    otp: '',
    isOtpSent: false,
    isOtpVerified: false,
  });

  const handleChange = (field, value) => {
    setFormData((prevState) => ({ ...prevState, [field]: value }));
  };

  const toggleSecureEntry = () => {
    setSecureTextEntry(!secureTextEntry);
  };

  const handleSubmit = async () => {
    try {
      const BaseUrl = await getApiBaseUrl();
      
      const { firstName, lastName, email, password, mno, id, division, otp, isOtpSent, isOtpVerified } = formData;
      const fullName = `${firstName} ${formData.middleName ? formData.middleName + ' ' : ''}${lastName}`;
  
      if (!firstName || !lastName || !email || !password || !mno || !id || !division) {
        Alert.alert('Missing Information', 'Please fill in all required fields to continue.');
        return;
      }
  
      if (!email.endsWith('@vtcbcsr.edu.in')) {
        Alert.alert('Invalid Email', 'Please use your college email address (@vtcbcsr.edu.in)');
        return;
      }
  
      if (!/^\d{10}$/.test(mno)) {
        Alert.alert('Invalid Mobile Number', 'Please enter a valid 10-digit mobile number.');
        return;
      }
  
      if (!isOtpSent) {
        console.log("🔹 Sending registration request with OTP");
        
        const response = await Axios.post(`${BaseUrl}/api/users/register`, {
          name: fullName,
          email,
          password,
          mobileNumber: mno,
          gender: formData.gender,
          id,
          division,
        });
  
        Alert.alert('Verification Required', response.data.message || 'An OTP has been sent to your email. Please verify to continue.');
        setFormData((prevState) => ({ ...prevState, isOtpSent: true }));
  
      } else if (isOtpSent && !isOtpVerified) {
        console.log("🔹 Verifying OTP...");
        const response = await Axios.post(`${BaseUrl}/api/users/verify-otp`, { email, otp });
  
        Alert.alert('Success', response.data.message || 'Account created successfully!');
        setFormData((prevState) => ({ ...prevState, isOtpVerified: true }));
        navigation.navigate('Dashboard');
      }
    } catch (error) {
      console.error("❌ Registration Error:", error.response?.data || error.message);
      Alert.alert(
        'Registration Failed', 
        error.response?.data?.message || "An error occurred during registration. Please try again."
      );
    }
  };
  
  const getEmailHelperText = () => {
    if (!formData.email) return '';
    return formData.email.endsWith('@vtcbcsr.edu.in') 
      ? 'Valid college email address' 
      : 'Must use @vtcbcsr.edu.in email';
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.sectionTitle}>Personal Information</Text>
      
      {/* Option 1: Stacked name fields for better display */}
      <TextInput
        label="First Name"
        value={formData.firstName}
        onChangeText={(value) => handleChange('firstName', value)}
        style={styles.input}
        mode="outlined"
        outlineColor="#E0E0E0"
        activeOutlineColor="#3F51B5"
      />
      <TextInput
        label="Middle Name"
        value={formData.middleName}
        onChangeText={(value) => handleChange('middleName', value)}
        style={styles.input}
        mode="outlined"
        outlineColor="#E0E0E0"
        activeOutlineColor="#3F51B5"
      />
      <TextInput
        label="Last Name"
        value={formData.lastName}
        onChangeText={(value) => handleChange('lastName', value)}
        style={styles.input}
        mode="outlined"
        outlineColor="#E0E0E0"
        activeOutlineColor="#3F51B5"
      />

        <TextInput
          label="Mobile Number"
          value={formData.mno}
          keyboardType="phone-pad"
          onChangeText={(value) => handleChange('mno', value)}
          style={styles.input}
          mode="outlined"
          outlineColor="#E0E0E0"
          activeOutlineColor="#3F51B5"
          left={<TextInput.Icon icon="phone" color="#7986CB" />}
        />
        <HelperText type="error" visible={formData.mno && !/^\d{10}$/.test(formData.mno)}>
          Mobile number must be 10 digits.
        </HelperText>


      <View style={styles.radioGroup}>
        <Text style={styles.radioLabel}>Gender</Text>
        <RadioButton.Group onValueChange={(value) => handleChange('gender', value)} value={formData.gender}>
          <View style={styles.radioInline}>
            <View style={styles.radioOption}>
              <RadioButton value="male" color="#3F51B5" />
              <Text>Male</Text>
            </View>
            <View style={styles.radioOption}>
              <RadioButton value="female" color="#3F51B5" />
              <Text>Female</Text>
            </View>
          </View>
        </RadioButton.Group>
      </View>

      <Divider style={styles.divider} />
      <Text style={styles.sectionTitle}>Account Information</Text>

      <TextInput
        label="Email"
        value={formData.email}
        keyboardType="email-address"
        autoCapitalize="none"
        onChangeText={(value) => handleChange('email', value)}
        style={styles.input}
        mode="outlined"
        outlineColor="#E0E0E0"
        activeOutlineColor="#3F51B5"
        left={<TextInput.Icon icon="email" color="#7986CB" />}
      />

      <TextInput
        label="Password"
        value={formData.password}
        secureTextEntry={secureTextEntry}
        onChangeText={(value) => handleChange('password', value)}
        style={styles.input}
        mode="outlined"
        outlineColor="#E0E0E0"
        activeOutlineColor="#3F51B5"
        left={<TextInput.Icon icon="lock" color="#7986CB" />}
        right={
          <TextInput.Icon 
            icon={secureTextEntry ? "eye" : "eye-off"} 
            onPress={toggleSecureEntry}
            color="#7986CB"
          />
        }
      />
      <HelperText 
        type={formData.email && !formData.email.endsWith('@vtcbcsr.edu.in') ? "error" : "info"} 
        visible={!!formData.email}
      >
        {getEmailHelperText()}
      </HelperText>

      <Divider style={styles.divider} />
      <Text style={styles.sectionTitle}>College Details</Text>
      
      <View style={styles.rowContainer}>
        <TextInput
          label="ID"
          value={formData.id}
          onChangeText={(value) => handleChange('id', value)}
          style={[styles.input, styles.inputHalf]}
          mode="outlined"
          outlineColor="#E0E0E0"
          activeOutlineColor="#3F51B5"
          left={<TextInput.Icon icon="card-account-details" color="#7986CB" />}
        />
        <TextInput
          label="Division"
          value={formData.division}
          onChangeText={(value) => handleChange('division', value)}
          style={[styles.input, styles.inputHalf]}
          mode="outlined"
          outlineColor="#E0E0E0"
          activeOutlineColor="#3F51B5"
          left={<TextInput.Icon icon="school" color="#7986CB" />}
        />
      </View>

      {formData.isOtpSent && !formData.isOtpVerified && (
        <>
          <Divider style={styles.divider} />
          <Text style={styles.sectionTitle}>Verification</Text>
          <TextInput
            label="Enter OTP"
            value={formData.otp}
            keyboardType="numeric"
            onChangeText={(value) => handleChange('otp', value)}
            style={styles.input}
            mode="outlined"
            outlineColor="#E0E0E0"
            activeOutlineColor="#3F51B5"
            left={<TextInput.Icon icon="shield-key" color="#7986CB" />}
          />
        </>
      )}

      <Button
        mode="contained"
        onPress={handleSubmit}
        style={styles.registerButton}
        labelStyle={styles.buttonLabel}
        buttonColor="#3F51B5"
      >
        {formData.isOtpSent ? 'VERIFY OTP' : 'CREATE ACCOUNT'}
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3F51B5',
    marginBottom: 12,
  },
  input: {
    marginBottom: 10,
    backgroundColor: 'white',
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  inputHalf: {
    width: '49%', // Fixed width percentage instead of flex
    marginBottom: 10,
  },
  divider: {
    marginVertical: 16,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  radioGroup: {
    marginVertical: 12,
  },
  radioLabel: {
    fontSize: 14,
    marginBottom: 8,
    color: '#616161',
  },
  radioInline: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  registerButton: {
    marginTop: 24,
    paddingVertical: 8,
    borderRadius: 30,
    elevation: 2,
  },
  buttonLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});

export default Register;