import React, { useEffect, useState } from "react";
import { 
  View, 
  Image, 
  Text, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator, 
  StyleSheet, 
  SafeAreaView, 
  FlatList,
  Dimensions
} from "react-native";
import axios from "axios";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { Ionicons } from "@expo/vector-icons";
import { getApiBaseUrl } from "../config";

const { width } = Dimensions.get("window");
const cardWidth = width * 0.9;

const IDCardDisplay = () => {
  const [idCards, setIDCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [baseURL, setBaseURL] = useState("");
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    const fetchBaseUrl = async () => {
      const url = await getApiBaseUrl();
      setBaseURL(url);
    };

    fetchBaseUrl();
  }, []);

  useEffect(() => {
    if (!baseURL) return;

    const fetchIDCards = async () => {
      try {
        const response = await axios.get(`${baseURL}/api/id-cards/get`, {
          withCredentials: true,
        });

        if (response.data.idCard && response.data.idCard.length > 0) {
          setIDCards(response.data.idCard);
        } else {
          setError("No ID cards available");
        }
      } catch (err) {
        console.error("Error fetching ID cards:", err.response || err.message);
        setError("Unable to load your ID cards. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchIDCards();
  }, [baseURL]);

  const handleDownload = async (idCard) => {
    try {
      setDownloadingId(idCard._id);
      const uri = `${baseURL}${idCard.filePath}`;
      const fileName = `${idCard.name || 'ID'}_Card.png`;
      const fileUri = FileSystem.documentDirectory + fileName;

      const { uri: downloadedFileUri } = await FileSystem.downloadAsync(uri, fileUri);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(downloadedFileUri);
      } else {
        Alert.alert("Download Complete", `Your ID card has been saved to your device.`);
      }
    } catch (err) {
      console.error("Error downloading the file:", err);
      Alert.alert("Download Failed", "We couldn't download your ID card. Please check your connection and try again.");
    } finally {
      setDownloadingId(null);
    }
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="card-outline" size={80} color="#ccc" />
      <Text style={styles.emptyText}>No ID cards available</Text>
      <Text style={styles.emptySubtext}>Your issued ID cards will appear here</Text>
    </View>
  );

  const renderItem = ({ item }) => (
    <View style={styles.cardContainer}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{item.name || "ID Card"}</Text>
        {item.issueDate && (
          <Text style={styles.issueDate}>
            Issued: {new Date(item.issueDate).toLocaleDateString()}
          </Text>
        )}
      </View>
      
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: `${baseURL}${item.filePath}` }}
          style={styles.image}
          resizeMode="contain"
        />
      </View>
      
      <TouchableOpacity 
        style={styles.downloadButton} 
        onPress={() => handleDownload(item)}
        disabled={downloadingId === item._id}
      >
        {downloadingId === item._id ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <>
            <Ionicons name="download-outline" size={20} color="#fff" />
            <Text style={styles.buttonText}>Download ID Card</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#4361EE" />
        <Text style={styles.loadingText}>Loading your ID cards...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your ID Cards</Text>
      </View>
      
      {error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#FF6B6B" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => {
              setLoading(true);
              setError(null);
              // Re-trigger the useEffect by forcing a baseURL update
              getApiBaseUrl().then(url => setBaseURL(url));
            }}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={idCards}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  header: {
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
  },
  listContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  cardContainer: {
    width: cardWidth,
    backgroundColor: "#fff",
    borderRadius: 16,
    marginVertical: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  issueDate: {
    fontSize: 14,
    color: "#888",
    marginTop: 4,
  },
  imageContainer: {
    padding: 16,
    alignItems: "center",
    backgroundColor: "#f9f9f9",
  },
  image: {
    width: cardWidth - 64,
    height: 400,
    borderRadius: 8,
  },
  downloadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4361EE",
    padding: 16,
    margin: 16,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    marginLeft: 8,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F7FA",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 16,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: "#4361EE",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    marginTop: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#888",
    marginTop: 8,
    textAlign: "center",
  }
});

export default IDCardDisplay;