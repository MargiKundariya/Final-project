import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  Image, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator,
  StatusBar,
  SafeAreaView
} from "react-native";
import axios from "axios";
import { getApiBaseUrl } from "../config";
import { Ionicons } from "@expo/vector-icons"; // Assuming you're using Expo

const JudgeList = ({ navigation }) => {
  const [judges, setJudges] = useState([]);
  const [selectedJudge, setSelectedJudge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [baseUrl, setBaseUrl] = useState("");

  useEffect(() => {
    const fetchBaseUrl = async () => {
      const url = await getApiBaseUrl();
      setBaseUrl(url);
    };

    const fetchJudges = async () => {
      try {
        const url = await getApiBaseUrl();
        const response = await axios.get(`${url}/api/judges`);
        setJudges(response.data);
      } catch (err) {
        setError("Failed to fetch judges. Please try again.");
        console.error("Error fetching judges:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBaseUrl();
    fetchJudges();
  }, []);

  const renderJudgeCard = ({ item }) => (
    <TouchableOpacity 
      style={styles.card}
      activeOpacity={0.7}
      onPress={() => setSelectedJudge(item)}
    >
      <View style={styles.cardContent}>
        <Image 
          source={{ uri: `${baseUrl}/${item.imageUrl.replace(/\\/g, "/")}` }} 
          style={styles.image} 
        />
        <View style={styles.cardDetails}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.department}>{item.department}</Text>
          <Text style={styles.email}>{item.email}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#4A6FFF" />
        <Text style={styles.loadingText}>Loading judges...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={50} color="#FF4A4A" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => {
            setLoading(true);
            setError(null);
            fetchJudges();
          }}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#f8f9fa" barStyle="dark-content" />
      
      {selectedJudge ? (
        <ScrollView contentContainerStyle={styles.detailsContainer}>
          <View style={styles.detailsHeader}>
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={() => setSelectedJudge(null)}
            >
              <Ionicons name="arrow-back" size={24} color="#4A6FFF" />
              <Text style={styles.backButtonText}>Back to List</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.profileImageContainer}>
            <Image 
              source={{ uri: `${baseUrl}/${selectedJudge.imageUrl.replace(/\\/g, "/")}` }} 
              style={styles.detailsImage} 
            />
          </View>
          
          <Text style={styles.detailsName}>{selectedJudge.name}</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{selectedJudge.department}</Text>
          </View>
          
          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <Ionicons name="mail-outline" size={20} color="#555" />
              <Text style={styles.infoText}>{selectedJudge.email}</Text>
            </View>
            
            <View style={styles.divider} />
            
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.detailsText}>{selectedJudge.details}</Text>
          </View>
        </ScrollView>
      ) : (
        <>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Judges</Text>
          </View>
          
          {judges.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={70} color="#CCCCCC" />
              <Text style={styles.noDataText}>No judges available</Text>
              <Text style={styles.noDataSubtext}>Check back later for updates</Text>
            </View>
          ) : (
            <FlatList
              data={judges}
              keyExtractor={(item) => item._id}
              renderItem={renderJudgeCard}
              contentContainerStyle={styles.listContainer}
              showsVerticalScrollIndicator={false}
            />
          )}
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    padding: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#eaeaea",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  listContainer: {
    padding: 16,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardDetails: {
    flex: 1,
    marginLeft: 16,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#e1e4e8",
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 2,
  },
  department: {
    fontSize: 14,
    color: "#4A6FFF",
    fontWeight: "500",
    marginBottom: 2,
  },
  email: {
    fontSize: 14,
    color: "#666",
  },
  assignButton: {
    marginTop: 12,
    backgroundColor: "#4A6FFF",
    padding: 12,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  assignButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonIcon: {
    marginLeft: 8,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#555",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f8f9fa",
  },
  errorText: {
    fontSize: 16,
    color: "#444",
    textAlign: "center",
    marginVertical: 16,
  },
  retryButton: {
    backgroundColor: "#4A6FFF",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  noDataText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#555",
    marginTop: 16,
  },
  noDataSubtext: {
    fontSize: 14,
    color: "#888",
    marginTop: 8,
  },
  
  // Details view styles
  detailsContainer: {
    backgroundColor: "#fff",
  },
  detailsHeader: {
    padding: 16,
    width: "100%",
    borderBottomWidth: 1,
    borderBottomColor: "#eaeaea",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButtonText: {
    fontSize: 16,
    color: "#4A6FFF",
    marginLeft: 8,
  },
  profileImageContainer: {
    alignItems: "center",
    marginTop: 24,
    marginBottom: 16,
  },
  detailsImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#e1e4e8",
  },
  detailsName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },
  badge: {
    backgroundColor: "rgba(74, 111, 255, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 8,
    alignSelf: "center",
  },
  badgeText: {
    color: "#4A6FFF",
    fontSize: 14,
    fontWeight: "500",
  },
  infoContainer: {
    padding: 24,
    width: "100%",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  infoText: {
    fontSize: 16,
    color: "#555",
    marginLeft: 12,
  },
  divider: {
    height: 1,
    width: "100%",
    backgroundColor: "#eaeaea",
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  detailsText: {
    fontSize: 16,
    color: "#555",
    lineHeight: 24,
  },
  fullWidthButton: {
    backgroundColor: "#4A6FFF",
    paddingVertical: 16,
    marginHorizontal: 24,
    marginBottom: 30,
    marginTop: 16,
    borderRadius: 12,
  },
  fullWidthButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
});

export default JudgeList;