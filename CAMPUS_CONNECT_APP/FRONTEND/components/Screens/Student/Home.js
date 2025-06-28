import React from 'react';
import { View, Text, StyleSheet, ImageBackground } from 'react-native';

const Home = () => {
  return (
    <>
      <ImageBackground source={require('../../../assets/slide2.jpeg')} style={styles.backgroundImage}>
        <View style={styles.overlay} />
        <View style={styles.content}>
          <Text style={styles.title}>Welcome to Campus Connect</Text>
          <Text style={styles.description}>
            Campus Connect is your gateway to education, innovation, and collaboration. Join us to
            explore endless opportunities.
          </Text>
        </View>
      </ImageBackground>
    </>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  content: {
    textAlign: 'center',
    paddingHorizontal: 20,
    alignItems: 'center',
    zIndex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default Home;
