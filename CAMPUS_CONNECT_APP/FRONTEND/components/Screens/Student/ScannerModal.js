import React, { useState, useEffect } from 'react';
import { View, Text, Modal, Image, ActivityIndicator, TouchableOpacity, StyleSheet } from 'react-native';
import { getApiBaseUrl } from '../config'; // Import API base URL

const ScannerModal = ({ scanner, onClose, visible }) => {
  const [loading, setLoading] = useState(true);
  const [imageUrl, setImageUrl] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchImageUrl = async () => {
      const baseUrl = await getApiBaseUrl();
      if (scanner && scanner.trim() !== '') {
        setImageUrl(`${baseUrl}/${scanner}`);
        setError(false);
      } else {
        setImageUrl(null);
        setError(true);
      }
    };
    fetchImageUrl();
  }, [scanner]);

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeText}>X</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Event Scanner</Text>

          {loading && !error && <ActivityIndicator size="large" color="#0000ff" />}

          <Image
            source={error ? require('../../../assets/download.png') : { uri: imageUrl }}
            style={styles.scannerImage}
            onLoad={() => setLoading(false)}
            onError={() => {
              setLoading(false);
              setError(true);
            }}
          />

        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  closeBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'red',
    borderRadius: 20,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  scannerImage: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
    marginVertical: 20,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
  },
});

export default ScannerModal;
