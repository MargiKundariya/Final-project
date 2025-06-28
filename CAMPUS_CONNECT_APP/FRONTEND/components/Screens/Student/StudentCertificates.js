import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  ScrollView, 
  Alert, 
  ActivityIndicator, 
  StyleSheet,
  StatusBar
} from "react-native";
import axios from "axios";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { getApiBaseUrl } from "../config";

const StudentCertificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [baseUrl, setBaseUrl] = useState("");
  const [downloading, setDownloading] = useState(null); // Track which certificate is downloading

  useEffect(() => {
    const fetchBaseUrl = async () => {
      const url = await getApiBaseUrl();
      setBaseUrl(url);
    };
    fetchBaseUrl();
  }, []);

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        if (!baseUrl) return;
        setLoading(true);
        const response = await axios.get(`${baseUrl}/api/certificate`, {
          withCredentials: true,
        });
        setCertificates(response.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch certificates");
      } finally {
        setLoading(false);
      }
    };
    if (baseUrl) fetchCertificates();
  }, [baseUrl]);

  const handleDownload = async (certificate) => {
    try {
      setDownloading(certificate._id);
      const uri = `${baseUrl}${certificate.imageUrl}`;
      const fileName = `${certificate.courseTitle.replace(/\s+/g, '_')}_Certificate.png`;
      const fileUri = FileSystem.documentDirectory + fileName;

      const { uri: downloadedFileUri } = await FileSystem.downloadAsync(uri, fileUri);

      console.log("Downloaded File:", downloadedFileUri);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(downloadedFileUri);
      } else {
        Alert.alert("Download Complete", `File saved at: ${downloadedFileUri}`);
      }
    } catch (err) {
      console.error("Error downloading the file:", err);
      Alert.alert("Download Failed", "Failed to download the certificate. Please try again.");
    } finally {
      setDownloading(null);
    }
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <FontAwesome name="certificate" size={64} color="#DDD" />
      <Text style={styles.emptyText}>No certificates available yet</Text>
      <Text style={styles.emptySubtext}>
        Complete your courses to earn certificates
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A80F0" />
        <Text style={styles.loadingText}>Loading certificates...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <FontAwesome name="exclamation-triangle" size={48} color="#F04A4A" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => {
            setError(null);
            if (baseUrl) {
              fetchCertificates();
            }
          }}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.pageContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
      <View style={styles.header}>
        <Text style={styles.title}>
          <FontAwesome name="certificate" size={24} color="#4A80F0" /> My Certificates
        </Text>
      </View>
      
      <ScrollView 
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {certificates.length === 0 ? (
          renderEmptyState()
        ) : (
          certificates.map((certificate) => (
            <View key={certificate._id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.courseTitle}>{certificate.courseTitle}</Text>
                <View style={styles.dateChip}>
                  <Text style={styles.dateText}>
                    {new Date(certificate.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </Text>
                </View>
              </View>
              
              <View style={styles.recipientContainer}>
                <Ionicons name="person" size={16} color="#666" />
                <Text style={styles.recipientText}>
                  {certificate.recipientName}
                </Text>
              </View>
              
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: `${baseUrl}${certificate.imageUrl}` }}
                  style={styles.image}
                  resizeMode="cover"
                />
              </View>
              
              <TouchableOpacity
                style={styles.downloadButton}
                onPress={() => handleDownload(certificate)}
                disabled={downloading === certificate._id}
              >
                {downloading === certificate._id ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <>
                    <FontAwesome name="download" size={16} color="white" />
                    <Text style={styles.downloadText}>Download Certificate</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  pageContainer: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    paddingTop: 20,
    paddingBottom: 15,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
    elevation: 2,
  },
  container: {
    padding: 16,
    paddingBottom: 30,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    color: "#333333",
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    backgroundColor: "#FFFFFF",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333333",
    flex: 1,
  },
  dateChip: {
    backgroundColor: "#EFF5FF",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  dateText: {
    fontSize: 12,
    color: "#4A80F0",
    fontWeight: "600",
  },
  recipientContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  recipientText: {
    fontSize: 14,
    color: "#666666",
    marginLeft: 6,
  },
  imageContainer: {
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#EEEEEE",
  },
  image: {
    width: "100%",
    height: 200,
    backgroundColor: "#F6F6F6",
  },
  downloadButton: {
    backgroundColor: "#4A80F0",
    flexDirection: "row",
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  downloadText: {
    color: "white",
    fontWeight: "600",
    marginLeft: 8,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    marginTop: 30,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#666666",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999999",
    textAlign: "center",
    marginTop: 8,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8F9FA",
  },
  loadingText: {
    marginTop: 12,
    color: "#666666",
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#F8F9FA",
  },
  errorText: {
    color: "#666666",
    fontSize: 16,
    textAlign: "center",
    marginTop: 12,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#4A80F0",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "white",
    fontWeight: "600",
  },
});

export default StudentCertificates;