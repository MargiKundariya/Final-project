import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import axios from 'axios';
import { useNavigation, useRoute } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import ScannerModal from './ScannerModal';
import { getApiBaseUrl } from '../config';

const RegisterForBoth = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const { eventName, date: rawDate, scanner } = route.params || {};
  const formattedDate = rawDate
    ? new Date(rawDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
    : '';

  const [apiBaseUrl, setApiBaseUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [participationData, setParticipationData] = useState({
    name: '',
    department: '',
    year: '',
    contactNumber: '',
    team_name: '',
    team_members: [],
  });

  const [newMember, setNewMember] = useState({ name: '', email: '' });
  const [showScannerModal, setShowScannerModal] = useState(false);
  const departmentOptions = ['BCA', 'BBA'];
  const yearOptions = ['1st', '2nd', '3rd'];
  
  const [selectedDepartment, setSelectedDepartment] = useState(departmentOptions[0]);
  const [selectedYear, setSelectedYear] = useState(yearOptions[0]);
  useEffect(() => {
    const fetchUserSession = async () => {
      try {
        const response = await axios.get(`${apiBaseUrl}/api/users/session`);
        const userData = response.data;
  
        setParticipationData((prevState) => ({
          ...prevState,
          name: userData.name || '',
        }));
      } catch (error) {
        console.error('Error fetching user session:', error);
      }
    };
  
    if (apiBaseUrl) {
      fetchUserSession();
    }
  }, [apiBaseUrl]);
  
  
  useEffect(() => {
    setParticipationData((prevState) => ({
      ...prevState,
      department: selectedDepartment,
      year: selectedYear
    }));
  }, [selectedDepartment, selectedYear]);
  
  useEffect(() => {
    const fetchApiBaseUrl = async () => {
      const baseUrl = await getApiBaseUrl();
      setApiBaseUrl(baseUrl);
    };
    fetchApiBaseUrl();
  }, []);

  const validateForm = () => {
    const newErrors = {};
    
    if (!participationData.name.trim()) {
      newErrors.name = 'Leader name is required';
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
    
    if (!participationData.team_name.trim()) {
      newErrors.team_name = 'Team name is required';
    }
    
    if (participationData.team_members.length === 0) {
      newErrors.team_members = 'Add at least one team member';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setParticipationData((prevState) => ({ 
      ...prevState, 
      [field]: value 
    }));
    
    if (errors[field]) {
      setErrors({...errors, [field]: null});
    }
  };

  const handleMemberInputChange = (field, value) => {
    setNewMember((prevState) => ({ 
      ...prevState, 
      [field]: value 
    }));
    
    if (errors.team_members) {
      setErrors({...errors, team_members: null});
    }
  };

  const validateMember = () => {
    const memberErrors = {};
    
    if (!newMember.name.trim()) {
      memberErrors.name = 'Member name is required';
    }
    
    if (!newMember.email.trim()) {
      memberErrors.email = 'Member email is required';
    } else if (!/\S+@\S+\.\S+/.test(newMember.email)) {
      memberErrors.email = 'Please enter a valid email';
    }
    
    return memberErrors;
  };

  const addTeamMember = () => {
    const memberErrors = validateMember();
    
    if (Object.keys(memberErrors).length > 0) {
      setErrors({...errors, member: memberErrors});
      return;
    }
    
    setParticipationData((prevState) => ({
      ...prevState,
      team_members: [...prevState.team_members, newMember],
    }));
    
    setNewMember({ name: '', email: '' });
    setErrors({...errors, member: null});
    
    Toast.show({ 
      type: 'success', 
      text1: 'Team Member Added', 
      text2: `${newMember.name} added to the team`,
      position: 'bottom',
      visibilityTime: 2000
    });
  };

  const removeTeamMember = (index) => {
    Alert.alert(
      "Remove Team Member",
      `Are you sure you want to remove ${participationData.team_members[index].name}?`,
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Remove", 
          onPress: () => {
            setParticipationData((prevState) => ({
              ...prevState,
              team_members: prevState.team_members.filter((_, i) => i !== index),
            }));
            Toast.show({ 
              type: 'info', 
              text1: 'Team Member Removed', 
              position: 'bottom',
              visibilityTime: 2000
            });
          },
          style: "destructive"
        }
      ]
    );
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      await axios.post(`${apiBaseUrl}/api/participation/add`, {
        ...participationData,
        eventName,
        date: rawDate,
      });
      
      Toast.show({ 
        type: 'success', 
        text1: 'Registration Successful!', 
        text2: 'Your team has been registered for the event',
        position: 'bottom'
      });
      
      setShowScannerModal(true);
    } catch (error) {
      Toast.show({ 
        type: 'error', 
        text1: 'Registration Failed', 
        text2: error.response?.data?.message || 'Please try again later',
        position: 'bottom'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigation.navigate('DashboardContainer');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Toast />
        
        <View style={styles.card}>
          <View style={styles.headerContainer}>
            <Text style={styles.heading}>Team Registration</Text>
            <View style={styles.eventInfoContainer}>
              <Text style={styles.eventName}>{eventName || 'Event Name'}</Text>
              <Text style={styles.eventDate}>{formattedDate || 'Event Date'}</Text>
            </View>
          </View>
          
          <View style={styles.formContainer}>
            <Text style={styles.sectionTitle}>Personal information </Text>
            
            <View style={styles.formField}>
              <Text style={styles.label}> Name</Text>
              <TextInput
                style={[styles.input, errors.name && styles.inputError]}
                value={participationData.name}
                editable={false} // Prevents manual editing
                placeholder="Fetching  name..."
                placeholderTextColor="#9CA3AF"
              />

              {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
            </View>

            <View style={styles.formField}>
  <Text style={styles.label}>Department</Text>
  <View style={styles.radioContainer}>
    {departmentOptions.map((dept) => (
      <TouchableOpacity 
        key={dept} 
        style={[styles.radioButton, selectedDepartment === dept && styles.selectedRadio]} 
        onPress={() => setSelectedDepartment(dept)}
      >
        <Text style={[styles.radioText, selectedDepartment === dept && styles.selectedText]}>
          {dept}
        </Text>
      </TouchableOpacity>
    ))}
  </View>
</View>

        <View style={styles.formField}>
          <Text style={styles.label}>Year</Text>
          <View style={styles.radioContainer}>
            {yearOptions.map((year) => (
              <TouchableOpacity 
                key={year} 
                style={[styles.radioButton, selectedYear === year && styles.selectedRadio]} 
                onPress={() => setSelectedYear(year)}
              >
                <Text style={[styles.radioText, selectedYear === year && styles.selectedText]}>
                  {year} 
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
            <View style={styles.formField}>
              <Text style={styles.label}>Contact Number</Text>
              <TextInput 
                style={[styles.input, errors.contactNumber && styles.inputError]} 
                value={participationData.contactNumber} 
                onChangeText={(value) => handleInputChange('contactNumber', value)} 
                keyboardType="phone-pad"
                placeholder="Enter 10-digit mobile number"
                placeholderTextColor="#9CA3AF"
              />
              {errors.contactNumber && <Text style={styles.errorText}>{errors.contactNumber}</Text>}
            </View>
            
            <View style={styles.formField}>
              <Text style={styles.label}>Team Name</Text>
              <TextInput 
                style={[styles.input, errors.team_name && styles.inputError]} 
                value={participationData.team_name} 
                onChangeText={(value) => handleInputChange('team_name', value)}
                placeholder="Enter a unique team name"
                placeholderTextColor="#9CA3AF"
              />
              {errors.team_name && <Text style={styles.errorText}>{errors.team_name}</Text>}
            </View>

            <View style={styles.divider} />
            
            <Text style={styles.sectionTitle}>Team Members</Text>
            {errors.team_members && <Text style={styles.errorText}>{errors.team_members}</Text>}
            
            {participationData.team_members.length > 0 ? (
              <View style={styles.teamMembersList}>
                {participationData.team_members.map((member, index) => (
                  <View key={index} style={styles.teamMemberCard}>
                    <View style={styles.memberInfo}>
                      <Text style={styles.memberName}>{member.name}</Text>
                      <Text style={styles.memberEmail}>{member.email}</Text>
                    </View>
                    <TouchableOpacity 
                      onPress={() => removeTeamMember(index)} 
                      style={styles.removeBtn}
                    >
                      <Text style={styles.removeBtnText}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.emptyTeam}>
                <Text style={styles.emptyTeamText}>No team members added yet</Text>
              </View>
            )}
            
            <View style={styles.addMemberContainer}>
              <View style={styles.formField}>
                <Text style={styles.label}>Member Name</Text>
                <TextInput 
                  style={[styles.input, errors.member?.name && styles.inputError]} 
                  placeholder="Enter member's full name" 
                  value={newMember.name} 
                  onChangeText={(text) => handleMemberInputChange('name', text)}
                  placeholderTextColor="#9CA3AF" 
                />
                {errors.member?.name && <Text style={styles.errorText}>{errors.member.name}</Text>}
              </View>
              
              <View style={styles.formField}>
                <Text style={styles.label}>Member Email</Text>
                <TextInput 
                  style={[styles.input, errors.member?.email && styles.inputError]} 
                  placeholder="Enter member's email address" 
                  value={newMember.email} 
                  onChangeText={(text) => handleMemberInputChange('email', text)} 
                  keyboardType="email-address"
                  placeholderTextColor="#9CA3AF"
                />
                {errors.member?.email && <Text style={styles.errorText}>{errors.member.email}</Text>}
              </View>
              
              <TouchableOpacity 
                style={styles.addMemberButton} 
                onPress={addTeamMember}
              >
                <Text style={styles.addMemberButtonText}>Add Team Member</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.footerContainer}>
            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={handleCancel}
              disabled={isLoading}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.registerButton, isLoading && styles.disabledButton]} 
              onPress={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.registerButtonText}>Register Team</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
        
        {showScannerModal && <ScannerModal scanner={scanner} onClose={() => {
          setShowScannerModal(false);
          navigation.navigate('DashboardContainer');
        }} />}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: '#F3F4F6',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginTop: 12,
    marginBottom: 24,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  formField: {
    marginBottom: 16,
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
  inputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 24,
  },
  teamMembersList: {
    marginTop: 8,
    marginBottom: 16,
  },
  teamMemberCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  memberEmail: {
    fontSize: 14,
    color: '#6B7280',
  },
  removeBtn: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  removeBtnText: {
    color: '#DC2626',
    fontWeight: '600',
    fontSize: 14,
  },
  emptyTeam: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTeamText: {
    color: '#6B7280',
    fontSize: 16,
  },
  addMemberContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginTop: 8,
  },
  addMemberButton: {
    backgroundColor: '#5046E5',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  addMemberButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginRight: 8,
  },
  cancelButtonText: {
    color: '#6B7280',
    fontWeight: '600',
    fontSize: 16,
  },
  registerButton: {
    flex: 1,
    backgroundColor: '#4F46E5',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginLeft: 8,
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  disabledButton: {
    backgroundColor: '#A5B4FC',
  },
  radioContainer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 5
  },
  radioButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#666',
    borderRadius: 5,
    backgroundColor: '#fff'
  },
  selectedRadio: {
    backgroundColor: '#007bff',
    borderColor: '#007bff'
  },
  radioText: {
    fontSize: 14,
    color: '#000'
  },
  selectedText: {
    color: '#fff',
    fontWeight: 'bold'
  }
});

export default RegisterForBoth;