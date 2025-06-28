import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { TextInput, Button, Text, Icon } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { getApiBaseUrl } from './config.js';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [baseURL, setBaseURL] = useState(null);
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchBaseUrl = async () => {
      try {
        const url = await getApiBaseUrl();
        setBaseURL(url);
      } catch (error) {
        console.error('Error fetching API Base URL:', error);
        Alert.alert('Connection Error', 'Failed to connect to server. Please try again later.');
      }
    };
    fetchBaseUrl();
  }, []);

  const handleChange = (field, value) => {
    setFormData((prevState) => ({ ...prevState, [field]: value }));
  };

  const toggleSecureEntry = () => {
    setSecureTextEntry(!secureTextEntry);
  };

  const handleSubmit = async () => {
    if (!formData.email || !formData.password) {
      Alert.alert('Missing Information', 'Please fill in all fields to continue.');
      return;
    }
  
    if (!baseURL) {
      Alert.alert('Connection Error', 'Server connection not established. Please try again later.');
      return;
    }
  
    setLoading(true);
  
    try {
      console.log(`🔹 Sending Login Request to: ${baseURL}/api/users/login`);
      
      const response = await axios.post(`${baseURL}/api/users/login`, formData, {
        withCredentials: true,
      });
  
      console.log('✅ Login successful');
      const { role } = response.data;
  
      const roleRoutes = {
        Admin: 'Admin',
        faculty: 'Faculty',
        student: 'Student',
        judge: 'Judge',
      };
  
      if (roleRoutes[role]) {
        navigation.reset({
          index: 0,
          routes: [{ name: roleRoutes[role] }],
        });
      } else {
        console.error('🚨 Invalid role received:', role);
        Alert.alert('Account Error', 'Your account type could not be determined. Please contact support.');
      }
    } catch (error) {
      console.error('❌ Login Error:', error?.response?.data || error.message);
      Alert.alert(
        'Authentication Failed',
        error?.response?.data?.message || 'The email or password you entered is incorrect. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <View style={styles.container}>
      <TextInput
        label="Email Address"
        value={formData.email}
        onChangeText={(value) => handleChange('email', value)}
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
        left={<TextInput.Icon icon="email" color="#7986CB" />}
        mode="outlined"
        outlineColor="#E0E0E0"
        activeOutlineColor="#3F51B5"
      />

      <TextInput
        label="Password"
        value={formData.password}
        onChangeText={(value) => handleChange('password', value)}
        secureTextEntry={secureTextEntry}
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

      <Text style={styles.forgotPassword} onPress={() => navigation.navigate('ForgotPassword')}>
        Forgot Password?
      </Text>

      <Button
        mode="contained"
        onPress={handleSubmit}
        loading={loading}
        disabled={loading}
        style={styles.loginButton}
        labelStyle={styles.buttonLabel}
        buttonColor="#3F51B5"
      >
        {loading ? 'SIGNING IN...' : 'SIGN IN'}
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  input: {
    marginBottom: 16,
    backgroundColor: 'white',
  },
  forgotPassword: {
    textAlign: 'right',
    color: '#3F51B5',
    marginBottom: 24,
    fontWeight: '500',
  },
  loginButton: {
    marginBottom: 24,
    paddingVertical: 8,
    borderRadius: 30,
    elevation: 2,
  },
  buttonLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  socialLoginContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  dividerText: {
    color: '#9E9E9E',
    fontSize: 12,
    marginBottom: 16,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
});

export default Login;