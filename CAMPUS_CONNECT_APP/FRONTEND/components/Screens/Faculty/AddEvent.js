import React, { useState, useEffect } from 'react';
import { 
  View, Text, TextInput, ScrollView, StyleSheet, Pressable, 
  Image, KeyboardAvoidingView, Platform, TouchableOpacity 
} from 'react-native';
import { RadioButton } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { MultiSelect } from 'react-native-element-dropdown';
import Toast from 'react-native-toast-message';
import { getApiBaseUrl } from '../config.js';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const AddEvent = () => {
  const navigation = useNavigation();
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    venue: '',
    startTime: '',
    endTime: '',
    description: '',
    participationType: 'Individual',
    criteria: [],
    attachments: null,
    scanner: null,
    coordinators: [],
  });

  const [facultyNames, setFacultyNames] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchFacultyNames = async () => {
      try {
        setLoading(true);
        const baseUrl = await getApiBaseUrl();
        const response = await fetch(`${baseUrl}/api/events/faculty-names`);
        const data = await response.json();
        if (data.success) {
          setFacultyNames(data.facultyNames.map(faculty => faculty.name));
        }
      } catch (error) {
        Toast.show({ 
          type: 'error', 
          text1: 'Error Loading Data', 
          text2: 'Failed to fetch faculty names' 
        });
      } finally {
        setLoading(false);
      }
    };

    fetchFacultyNames();
  }, []);

  const handleChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleAddCriteria = () => {
    setFormData({ ...formData, criteria: [...formData.criteria, ''] });
  };

  const handleRemoveCriteria = (index) => {
    const newCriteria = formData.criteria.filter((_, i) => i !== index);
    setFormData({ ...formData, criteria: newCriteria });
  };

  const handleCriteriaChange = (value, index) => {
    const newCriteria = [...formData.criteria];
    newCriteria[index] = value;
    setFormData({ ...formData, criteria: newCriteria });
  };

  const pickImage = async (type) => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setFormData({ ...formData, [type]: result.assets[0].uri });
    }
  };
  const handleSubmit = async () => {
    const { name, date, venue, startTime, endTime, description } = formData;
    
    if (!name || !date || !venue || !startTime || !endTime || !description) {
      Toast.show({ 
        type: 'error', 
        text1: 'Missing Information', 
        text2: 'Please fill in all required fields' 
      });
      return;
    }
  
    // Get the current system date
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize time to midnight
  
    // Convert user-selected date into a Date object
    const eventDate = new Date(date);
  
    // Check if the selected date is in the past
    if (eventDate <= today) {
      Toast.show({ 
        type: 'error', 
        text1: 'Invalid Date', 
        text2: 'Please select a future date for the event' 
      });
      return;
    }
  
    setLoading(true);
    const form = new FormData();
    form.append('name', formData.name);
    form.append('date', formData.date);
    form.append('venue', formData.venue);
    form.append('startTime', formData.startTime);
    form.append('endTime', formData.endTime);
    form.append('description', formData.description);
    form.append('participationType', formData.participationType);
    
    formData.coordinators.forEach((coordinator) => {
      form.append('coordinators', coordinator);
    });
  
    formData.criteria.forEach((criterion) => {
      form.append('criteria', criterion);
    });
  
    if (formData.attachments) {
      form.append('attachments', {
        uri: formData.attachments,
        name: 'attachment.jpg',
        type: 'image/jpeg',
      });
    }
  
    if (formData.scanner) {
      form.append('scanner', {
        uri: formData.scanner,
        name: 'scanner.jpg',
        type: 'image/jpeg',
      });
    }
  
    try {
      const baseUrl = await getApiBaseUrl();
      const response = await fetch(`${baseUrl}/api/events/add`, {
        method: 'POST',
        body: form,
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Something went wrong');
      }
  
      Toast.show({ 
        type: 'success', 
        text1: 'Event Created', 
        text2: 'Your event has been added successfully!' 
      });
      navigation.navigate('EventDetails');
    } catch (error) {
      Toast.show({ 
        type: 'error', 
        text1: 'Submission Failed', 
        text2: `Error: ${error.message}` 
      });
    } finally {
      setLoading(false);
    }
  };
  

  const renderFilePreview = (uri, type) => {
    if (!uri) return null;
    return (
      <View style={styles.filePreview}>
        <Image source={{ uri }} style={styles.previewImage} />
        <TouchableOpacity 
          style={styles.removeFileBtn} 
          onPress={() => setFormData({ ...formData, [type]: null })}
        >
          <Ionicons name="close-circle" size={24} color="white" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView 
        contentContainerStyle={styles.container} 
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>Create New Event</Text>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionLabel}>Basic Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Event Name *</Text>
            <TextInput 
              placeholder="Enter a name for your event" 
              style={styles.input} 
              value={formData.name} 
              onChangeText={(text) => handleChange('name', text)}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Event Date *</Text>
            <TextInput 
              placeholder="YYYY-MM-DD" 
              style={styles.input} 
              value={formData.date} 
              onChangeText={(text) => handleChange('date', text)}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Venue *</Text>
            <TextInput 
              placeholder="Where will the event be held?" 
              style={styles.input} 
              value={formData.venue} 
              onChangeText={(text) => handleChange('venue', text)}
            />
          </View>

          <View style={styles.timeContainer}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
              <Text style={styles.inputLabel}>Start Time *</Text>
              <TextInput 
                placeholder="HH:MM" 
                style={styles.input} 
                value={formData.startTime} 
                onChangeText={(text) => handleChange('startTime', text)}
              />
            </View>
            
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.inputLabel}>End Time *</Text>
              <TextInput 
                placeholder="HH:MM" 
                style={styles.input} 
                value={formData.endTime} 
                onChangeText={(text) => handleChange('endTime', text)}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Description *</Text>
            <TextInput 
              placeholder="Provide details about the event" 
              style={[styles.input, styles.textArea]} 
              multiline 
              value={formData.description} 
              onChangeText={(text) => handleChange('description', text)}
            />
          </View>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionLabel}>Participation Setup</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Participation Type</Text>
            <RadioButton.Group 
              onValueChange={(value) => handleChange('participationType', value)} 
              value={formData.participationType}
            >
              <View style={styles.radioButtonContainer}>
                <View style={styles.radioOption}>
                  <RadioButton value="Individual" color="#2237ac" />
                  <Text style={styles.radioLabel}>Individual</Text>
                </View>
                
                <View style={styles.radioOption}>
                  <RadioButton value="Group" color="#2237ac" />
                  <Text style={styles.radioLabel}>Group</Text>
                </View>
                
                <View style={styles.radioOption}>
                  <RadioButton value="Both" color="#2237ac" />
                  <Text style={styles.radioLabel}>Both</Text>
                </View>
              </View>
            </RadioButton.Group>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Event Coordinators</Text>
            <MultiSelect
              data={facultyNames.map(name => ({ label: name, value: name }))}
              labelField="label"
              valueField="value"
              placeholder="Select coordinators"
              value={formData.coordinators}
              onChange={(selected) => handleChange('coordinators', selected)}
              style={styles.multiselect}
              selectedTextStyle={styles.selectedTextStyle}
              placeholderStyle={styles.placeholderStyle}
              itemTextStyle={styles.itemTextStyle}
              activeColor="#e6e9ff"
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Judging Criteria</Text>
            {formData.criteria.map((criterion, index) => (
              <View key={index} style={styles.criteriaContainer}>
                <TextInput 
                  placeholder={`Criterion ${index + 1}`} 
                  style={styles.criteriaInput} 
                  value={criterion} 
                  onChangeText={(text) => handleCriteriaChange(text, index)} 
                />
                <TouchableOpacity 
                  onPress={() => handleRemoveCriteria(index)} 
                  style={styles.removeButton}
                >
                  <Ionicons name="trash-outline" size={20} color="#ff3b30" />
                </TouchableOpacity>
              </View>
            ))}
            
            <TouchableOpacity 
              style={styles.addCriteriaButton} 
              onPress={handleAddCriteria}
            >
              <Ionicons name="add-circle-outline" size={20} color="#2237ac" />
              <Text style={styles.addCriteriaText}>Add Criterion</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionLabel}>Event Documents</Text>
          
          <View style={styles.uploadSection}>
            <Text style={styles.inputLabel}>Event Attachments</Text>
            {renderFilePreview(formData.attachments, 'attachments')}
            <TouchableOpacity 
              style={styles.uploadButton} 
              onPress={() => pickImage('attachments')}
            >
              <Ionicons name="cloud-upload-outline" size={20} color="white" />
              <Text style={styles.uploadButtonText}>
                {formData.attachments ? 'Change Attachment' : 'Upload Attachment'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.uploadSection}>
            <Text style={styles.inputLabel}>QR Scanner Document</Text>
            {renderFilePreview(formData.scanner, 'scanner')}
            <TouchableOpacity 
              style={styles.uploadButton} 
              onPress={() => pickImage('scanner')}
            >
              <Ionicons name="cloud-upload-outline" size={20} color="white" />
              <Text style={styles.uploadButtonText}>
                {formData.scanner ? 'Change Scanner' : 'Upload Scanner'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.submitButton} 
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <Text style={styles.submitButtonText}>Creating Event...</Text>
          ) : (
            <>
              <Ionicons name="checkmark-circle-outline" size={20} color="white" />
              <Text style={styles.submitButtonText}>CREATE EVENT</Text>
            </>
          )}
        </TouchableOpacity>

        <Toast />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flexGrow: 1, 
    padding: 0, 
    backgroundColor: '#f8f9fa' 
  },
  header: {
    backgroundColor: '#2237ac',
    padding: 20,
    paddingTop: 40,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    color: 'white', 
    textAlign: 'center' 
  },
  formSection: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionLabel: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#2237ac', 
    marginBottom: 16, 
    borderBottomWidth: 1, 
    borderBottomColor: '#e0e0e0', 
    paddingBottom: 8 
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#444',
    marginBottom: 6,
  },
  input: { 
    borderWidth: 1, 
    borderColor: '#e0e0e0', 
    borderRadius: 8, 
    padding: 12, 
    backgroundColor: '#fff',
    fontSize: 16,
  },
  textArea: { 
    height: 100, 
    textAlignVertical: 'top' 
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  radioButtonContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioLabel: {
    fontSize: 16,
    marginLeft: 4,
  },
  multiselect: { 
    borderWidth: 1, 
    borderColor: '#e0e0e0', 
    borderRadius: 8, 
    padding: 8, 
    backgroundColor: '#fff' 
  },
  selectedTextStyle: {
    fontSize: 14,
  },
  placeholderStyle: {
    color: '#888',
    fontSize: 14,
  },
  itemTextStyle: {
    color: '#333',
    fontSize: 14,
  },
  criteriaContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 12 
  },
  criteriaInput: {
    flex: 1,
    borderWidth: 1, 
    borderColor: '#e0e0e0', 
    borderRadius: 8, 
    padding: 12, 
    backgroundColor: '#fff',
  },
  removeButton: { 
    marginLeft: 10, 
    padding: 8, 
    justifyContent: 'center',
    alignItems: 'center',
  },
  addCriteriaButton: { 
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#2237ac',
    borderRadius: 8,
    justifyContent: 'center',
  },
  addCriteriaText: {
    color: '#2237ac',
    marginLeft: 8,
    fontWeight: '600',
  },
  uploadSection: {
    marginBottom: 20,
  },
  uploadButton: { 
    backgroundColor: '#2237ac', 
    padding: 12, 
    borderRadius: 8, 
    alignItems: 'center', 
    flexDirection: 'row',
    justifyContent: 'center',
  },
  uploadButtonText: { 
    color: '#fff', 
    fontSize: 16, 
    fontWeight: 'bold',
    marginLeft: 8,
  },
  filePreview: {
    height: 120,
    marginBottom: 12,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  removeFileBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 15,
  },
  submitButton: { 
    backgroundColor: '#2237ac', 
    padding: 16, 
    borderRadius: 10, 
    alignItems: 'center', 
    marginHorizontal: 16,
    marginBottom: 40,
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: '#2237ac',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonText: { 
    color: '#fff', 
    fontSize: 16, 
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default AddEvent;