import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet, Dimensions, StatusBar } from 'react-native';
import Modal from 'react-native-modal';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';
import defaultImage from '../../../assets/slide2.jpeg';
import { getApiBaseUrl } from '../config';

const { width } = Dimensions.get('window');

const EventModal = ({ event, isVisible, onClose }) => {
  const navigation = useNavigation();
  const [imageToShow, setImageToShow] = useState(defaultImage);

  const {
    name,
    attachments,
    date,
    venue,
    startTime,
    endTime,
    description,
    criteria,
    participationType,
    coordinators,
  } = event;

  useEffect(() => {
    const fetchImageUrl = async () => {
      const baseUrl = await getApiBaseUrl();
      setImageToShow(attachments ? `${baseUrl}${attachments}` : defaultImage);
    };
    fetchImageUrl();
  }, [attachments]);

  // Format to only display date without time zone
  const formatDate = (dateString) => {
    if (!dateString) return 'Date not available';
    
    const dateObj = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(dateObj.getTime())) return 'Invalid date';
    
    // Format: Month Day, Year (e.g., March 22, 2025)
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return dateObj.toLocaleDateString('en-US', options);
  };

  const handleRegisterClick = () => {
    console.log('Register button clicked for event:', name);

    if (participationType === 'Group') {
      navigation.navigate('RegisterForTeam', { eventName: name, date: date });
    }
    else if(participationType === 'Both'){
      navigation.navigate('RegisterForBoth', { eventName: name, date: date });

    } else {
      navigation.navigate('RegisterForEvent', { eventName: name, date: date });
    }

    Toast.show({ 
      type: 'success', 
      text1: 'Navigating to Registration', 
      text2: 'Preparing registration form...',
      position: 'bottom',
      visibilityTime: 2000
    });
    
    onClose();
  };

  return (
    <Modal 
      isVisible={isVisible} 
      onBackdropPress={onClose} 
      animationIn="fadeInUp" 
      animationOut="fadeOutDown"
      backdropOpacity={0.7}
      style={styles.modal}
    >
      <StatusBar barStyle="light-content" />
      <View style={styles.modalContainer}>
        <View style={styles.headerContainer}>
          <Image source={{ uri: imageToShow }} style={styles.image} />
          <View style={styles.imageOverlay} />
          
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={22} color="#fff" />
          </TouchableOpacity>
          
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{name}</Text>
            <View style={styles.dateVenueContainer}>
              <View style={styles.infoItem}>
                <Ionicons name="calendar-outline" size={16} color="#fff" />
                <Text style={styles.headerInfoText}>{formatDate(date)}</Text>
              </View>
              <View style={styles.infoItem}>
                <Ionicons name="location-outline" size={16} color="#fff" />
                <Text style={styles.headerInfoText}>{venue}</Text>
              </View>
            </View>
          </View>
        </View>

        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.detailsContainer}>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="time-outline" size={20} color="#3498db" />
                <Text style={styles.sectionTitle}>Time</Text>
              </View>
              <View style={styles.timeContainer}>
                <View style={styles.timeItem}>
                  <Text style={styles.timeLabel}>Start</Text>
                  <Text style={styles.timeValue}>{startTime}</Text>
                </View>
                <View style={styles.timeSeparator}>
                  <Ionicons name="arrow-forward" size={16} color="#ccc" />
                </View>
                <View style={styles.timeItem}>
                  <Text style={styles.timeLabel}>End</Text>
                  <Text style={styles.timeValue}>{endTime}</Text>
                </View>
              </View>
            </View>
            
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="information-circle-outline" size={20} color="#3498db" />
                <Text style={styles.sectionTitle}>About</Text>
              </View>
              <Text style={styles.descriptionText}>{description}</Text>
            </View>
            
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="list-outline" size={20} color="#3498db" />
                <Text style={styles.sectionTitle}>Details</Text>
              </View>
              
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Criteria</Text>
                <Text style={styles.detailValue}>{criteria.join(', ')}</Text>
              </View>
              
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Participation</Text>
                <View style={styles.participationBadge}>
                  <Text style={styles.participationText}>{participationType}</Text>
                </View>
              </View>
              
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Coordinators</Text>
                <Text style={styles.detailValue}>{coordinators.join(', ')}</Text>
              </View>
            </View>
          </View>
        </ScrollView>
        
        <View style={styles.footer}>
        <TouchableOpacity 
  style={[
    styles.registerButton,
    ['ended', 'ongoing'].includes(event?.timeStatus?.class) && { opacity: 0.5 }
  ]}
  onPress={handleRegisterClick}
  activeOpacity={['ended', 'ongoing'].includes(event?.timeStatus?.class) ? 1 : 0.8}
  disabled={['ended', 'ongoing'].includes(event?.timeStatus?.class)}
>

            <Ionicons name="checkmark-circle-outline" size={20} color="#fff" style={styles.buttonIcon} />
            <Text style={styles.registerText}>Register Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    margin: 0,
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    width: '100%',
    height: '90%',
    overflow: 'hidden',
  },
  headerContainer: {
    height: 200,
    width: '100%',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  titleContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    zIndex: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  dateVenueContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4,
  },
  headerInfoText: {
    color: '#fff',
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  scrollView: {
    flex: 1,
  },
  detailsContainer: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeItem: {
    flex: 1,
    alignItems: 'center',
  },
  timeSeparator: {
    padding: 8,
  },
  timeLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  timeValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2c3e50',
  },
  descriptionText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#2c3e50',
  },
  detailItem: {
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f2f6',
    paddingBottom: 16,
  },
  detailLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: '#2c3e50',
  },
  participationBadge: {
    backgroundColor: '#3498db',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  participationText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#f1f2f6',
    padding: 16,
  },
  registerButton: {
    backgroundColor: '#3498db',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: '#3498db',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  buttonIcon: {
    marginRight: 8,
  },
  registerText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EventModal;