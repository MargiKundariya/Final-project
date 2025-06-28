import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Animated, Dimensions } from 'react-native';
import EventModal from './EventModal';
import { getApiBaseUrl } from '../config';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const cardWidth = width * 0.85 > 300 ? 300 : width * 0.85;

const Dashboard = ({ event }) => {
  const { name, attachments, description } = event;
  const [showModal, setShowModal] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
// At the top of your component (after state declarations)
const isCompleted = event?.status === 'completed';
  
  // Animation values
  const scaleAnim = useState(new Animated.Value(1))[0];
  const opacityAnim = useState(new Animated.Value(0))[0];
  
  useEffect(() => {
    const fetchImageUrl = async () => {
      setIsLoading(true);
      try {
        const baseUrl = await getApiBaseUrl();
        setImageUrl(attachments ? `${baseUrl}${attachments}` : null);
      } catch (error) {
        console.error('Error fetching image URL:', error);
        setImageUrl(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchImageUrl();
  }, [attachments]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
  
    // Convert to Date object
    const date = new Date(dateString);
  
    // Extract only the date (YYYY-MM-DD)
    return date.toISOString().split('T')[0]; 
  };
  
  
  const handleCardPress = () => {
    // Animate the card on press
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };
  
  const handleMoreInfoPress = () => {
    setShowModal(true);
  };
  
  const handleModalClose = () => {
    setShowModal(false);
    
    // Fade out the overlay when modal closes
    Animated.timing(opacityAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };
  
  const getEventTypeColor = () => {
    // You could determine color based on event type or category
    // This is just a placeholder implementation
    const categories = ['workshop', 'competition', 'seminar', 'cultural'];
    const colors = ['#FF6B6B', '#4ECDC4', '#FFD166', '#6A0572'];
    
    const eventType = event.type || event.category || '';
    const index = categories.findIndex(cat => 
      eventType.toLowerCase().includes(cat.toLowerCase())
    );
    
    return index >= 0 ? colors[index] : '#3A86FF';
  };
  
  const eventColor = getEventTypeColor();
  
  const truncateDescription = (text, maxLength = 60) => {
    if (!text) return '';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };
  
  return (
    <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity 
        activeOpacity={0.9}
        onPress={handleCardPress}
        style={styles.cardContainer}>
        <View style={styles.card}>
  {/* ✔ Completed Badge */}
  {isCompleted && (
    <View style={styles.completedBadge}>
      <Text style={styles.completedBadgeText}>✔ Completed</Text>
    </View>
  )}

  {/* Badge for event type */}
  <View style={[styles.badge, { backgroundColor: eventColor }]}>
    <Text style={styles.badgeText}>{event.type || 'Event'}</Text>
  </View>

          
          {/* Event Image */}
          <View style={styles.imageContainer}>
            <Image
              source={
                imageUrl
                  ? { uri: imageUrl }
                  : require('../../../assets/slide2.jpeg')
              }
              style={styles.image}
              onError={() => setImageUrl(null)}
            />
            
            {/* Gradient overlay for better text readability */}
            <View style={styles.gradient} />
            
            {/* Event title always displayed */}
            <View style={styles.titleContainer}>
              <Text style={styles.eventName}>{name}</Text>
              {description && (
                <Text style={styles.eventDescription}>
                  {truncateDescription(description)}
                </Text>
              )}
            </View>
          </View>
          
          {/* Event details */}
          <View style={styles.detailsContainer}>
          {event.date && (
  <View style={styles.detailRow}>
    <Ionicons name="calendar-outline" size={16} color="#555" />
    <Text style={styles.detailText}>{formatDate(event.date)}</Text>
  </View>
)}
            {event.location && (
              <View style={styles.detailRow}>
                <Ionicons name="location-outline" size={16} color="#555" />
                <Text style={styles.detailText}>{event.location}</Text>
              </View>
            )}
            
            <TouchableOpacity
              style={[styles.button, { backgroundColor: eventColor }]}
              onPress={handleMoreInfoPress}
            >
              <Text style={styles.buttonText}>View Details</Text>
              <Ionicons name="arrow-forward" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
      
      <EventModal event={event} isVisible={showModal} onClose={handleModalClose} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 10,
    alignSelf: 'center',
    width: cardWidth,
  },
  cardContainer: {
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  card: {
    width: '100%',
    height: 320,
    borderRadius: 16,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  badge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    zIndex: 10,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  imageContainer: {
    width: '100%',
    height: '60%',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  titleContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  eventName: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  eventDescription: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  detailsContainer: {
    padding: 16,
    flex: 1,
    justifyContent: 'space-between',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    marginLeft: 8,
    color: '#555',
    fontSize: 14,
  },
  button: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginRight: 6,
  },
  completedBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#22c55e',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    zIndex: 10,
  },
  completedBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  
});

export default Dashboard;