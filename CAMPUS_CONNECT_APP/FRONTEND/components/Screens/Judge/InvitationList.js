import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Image, TouchableOpacity, ActivityIndicator, Alert, StyleSheet } from "react-native";
import axios from "axios";
import { getApiBaseUrl } from "../config";

const InvitationList = () => {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchInvitations = async () => {
      try {
        const baseUrl = await getApiBaseUrl();
        const response = await axios.get(`${baseUrl}/api/invitations`, {
          withCredentials: true,
        });
        setInvitations(response.data);
      } catch (err) {
        setError("No Invitation Available.");
      } finally {
        setLoading(false);
      }
    };

    fetchInvitations();
  }, []);

  const handleDownload = async (imageUrl) => {
    try {
      Alert.alert("Download", "Downloading invitation...");
      // Additional functionality for file saving can be implemented with react-native-fs or expo-file-system
    } catch (error) {
      Alert.alert("Error", "Error downloading the invitation.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Your Invitations</Text>
      {loading && <ActivityIndicator size="large" color="#007bff" />}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <FlatList
        data={invitations}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image
              source={{ uri: `${item.invitationImage}` }}
              style={styles.image}
            />
            <Text style={styles.eventName}>{item.eventName}</Text>
            <Text style={styles.details}>📅 Date: {item.eventDate}</Text>
            <Text style={styles.details}>⏰ Time: {item.eventTime}</Text>
            <TouchableOpacity
              style={styles.downloadButton}
              onPress={() => handleDownload(item.invitationImage)}
            >
              <Text style={styles.downloadButtonText}>Download Invitation</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f4f4f4",
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 20,
  },
  error: {
    fontSize: 18,
    color: "red",
    textAlign: "center",
  },
  card: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
  eventName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  details: {
    fontSize: 16,
    color: "#555",
    marginVertical: 5,
  },
  downloadButton: {
    backgroundColor: "#007BFF",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginTop: 10,
  },
  downloadButtonText: {
    color: "white",
    fontSize: 14,
  },
});

export default InvitationList;
