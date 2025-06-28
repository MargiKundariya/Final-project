import React, { useState, useEffect } from 'react';
import { ScrollView, View, StyleSheet, Image, Dimensions, TouchableOpacity } from 'react-native';
import { Card, Text, Surface, useTheme, Avatar } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import Login from './Login';
import Register from './Register';

const windowWidth = Dimensions.get('window').width;

const LoginRegister = ({ navigation }) => {
  const [isLogin, setIsLogin] = useState(true);
  const theme = useTheme();
  
  const toggleForm = () => setIsLogin(!isLogin);

  return (
    <LinearGradient
      colors={['#0f2005', '#203a89', '#1e373f']} 
      style={styles.gradientBackground}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.headerContainer}>
          <Surface style={styles.logoContainer}>
            <Image
              source={require('../../assets/logo.png')}
              style={styles.logo}
            />
          </Surface>
          <Text variant="headlineMedium" style={styles.brandName}>
            CampusConnect
          </Text>
          <Text style={styles.tagline}>
            Connecting Students, Events, and Opportunities
          </Text>
        </View>

        <Card style={styles.mainCard}>
          <Card.Content style={styles.cardContent}>
            {/* Form Selector Tabs */}
            <View style={styles.tabContainer}>
              <TouchableOpacity 
                style={[styles.tab, isLogin && styles.activeTab]} 
                onPress={() => setIsLogin(true)}
              >
                <Text style={[styles.tabText, isLogin && styles.activeTabText]}>Login</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.tab, !isLogin && styles.activeTab]} 
                onPress={() => setIsLogin(false)}
              >
                <Text style={[styles.tabText, !isLogin && styles.activeTabText]}>Register</Text>
              </TouchableOpacity>
            </View>

            {/* Form Description */}
            <View style={styles.formDescriptionContainer}>
              <Text style={styles.formTitle}>
                {isLogin ? 'Welcome Back!' : 'Join Our Community'}
              </Text>
              <Text style={styles.formDescription}>
                {isLogin 
                  ? 'Sign in to explore events, connect with peers, and stay updated with campus activities.'
                  : 'Create an account to register for events, join clubs, and make the most of your campus experience.'}
              </Text>
            </View>

            {/* The actual form */}
            <View style={styles.formContainer}>
              {isLogin ? <Login navigation={navigation} /> : <Register navigation={navigation} />}
            </View>
          </Card.Content>
        </Card>

        {/* Feature cards */}
        <View style={styles.featureCardsContainer}>
          <Text style={styles.featureTitle}>Why Choose CampusConnect?</Text>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.featureCardsScroll}
          >
            <Card style={styles.featureCard}>
              <Card.Content style={styles.featureCardContent}>
                <Avatar.Icon size={60} icon="calendar-month" style={styles.featureIcon} />
                <Text style={styles.featureCardTitle}>Campus Events</Text>
                <Text style={styles.featureCardText}>Stay updated with all the latest events happening on campus</Text>
              </Card.Content>
            </Card>
            
            <Card style={styles.featureCard}>
              <Card.Content style={styles.featureCardContent}>
                <Avatar.Icon size={60} icon="account-group" style={styles.featureIcon} />
                <Text style={styles.featureCardTitle}>Club Activities</Text>
                <Text style={styles.featureCardText}>Join clubs and participate in various activities</Text>
              </Card.Content>
            </Card>
            
            <Card style={styles.featureCard}>
              <Card.Content style={styles.featureCardContent}>
                <Avatar.Icon size={60} icon="bell-ring" style={styles.featureIcon} />
                <Text style={styles.featureCardTitle}>Notifications</Text>
                <Text style={styles.featureCardText}>Get timely updates about important announcements</Text>
              </Card.Content>
            </Card>
          </ScrollView>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 16,
  },
  headerContainer: {
    alignItems: 'center',
    marginVertical: 24,
  },
  logoContainer: {
    elevation: 8,
    borderRadius: 75,
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 12,
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
  },
  brandName: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  tagline: {
    color: 'white',
    textAlign: 'center',
    marginTop: 4,
    fontSize: 16,
    opacity: 0.9,
  },
  mainCard: {
    borderRadius: 16,
    elevation: 6,
    marginBottom: 24,
    overflow: 'hidden',
  },
  cardContent: {
    padding: 0,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: 'white',
    borderTopWidth: 3,
    borderTopColor: '#4158D0',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#888',
  },
  activeTabText: {
    color: '#4158D0',
    fontWeight: 'bold',
  },
  formDescriptionContainer: {
    padding: 20,
    backgroundColor: 'white',
  },
  formTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  formDescription: {
    color: '#666',
    lineHeight: 20,
  },
  formContainer: {
    padding: 20,
    backgroundColor: 'white',
  },
  featureCardsContainer: {
    marginBottom: 24,
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  featureCardsScroll: {
    paddingHorizontal: 8,
    paddingBottom: 16,
  },
  featureCard: {
    width: windowWidth * 0.7,
    marginHorizontal: 8,
    borderRadius: 12,
    elevation: 4,
  },
  featureCardContent: {
    alignItems: 'center',
    padding: 16,
  },
  featureIcon: {
    backgroundColor: '#4158D0',
    marginBottom: 12,
  },
  featureCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  featureCardText: {
    textAlign: 'center',
    color: '#666',
  },
});

export default LoginRegister;