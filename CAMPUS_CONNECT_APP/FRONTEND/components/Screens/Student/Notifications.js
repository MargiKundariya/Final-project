import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator, 
  StyleSheet, 
  SafeAreaView,
  RefreshControl
} from "react-native";
import axios from "axios";
import Toast from "react-native-toast-message";
import { getApiBaseUrl } from "../config";

const Notifications = () => {
  const [pendingParticipations, setPendingParticipations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  const fetchData = async () => {
    try {
      const baseUrl = await getApiBaseUrl();
      const response = await axios.get(`${baseUrl}/api/users/session`, { withCredentials: true });
      setUserEmail(response.data.email);
      await fetchPendingParticipations(response.data.email, baseUrl);
    } catch (error) {
      console.error("Error fetching session data:", error);
      Toast.show({
        type: "error",
        text1: "Session Error",
        text2: "Please sign in again to continue.",
        position: "bottom"
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchPendingParticipations = async (email, baseUrl) => {
    try {
      const response = await axios.get(`${baseUrl}/api/participation/pending?email=${email}`, { withCredentials: true });
      setPendingParticipations(response.data);
      return true;
    } catch (error) {
      console.error("Error fetching pending participations:", error);
      return false;
    }
  };

  const handleResponse = async (participationId, status) => {
    try {
      const baseUrl = await getApiBaseUrl();
      await axios.post(
        `${baseUrl}/api/participation/response`,
        { participationId, email: userEmail, status },
        { withCredentials: true }
      );

      setPendingParticipations((prev) => prev.filter((p) => p._id !== participationId));
      Toast.show({
        type: "success",
        text1: status === "accepted" ? "Participation Accepted!" : "Participation Declined",
        text2: status === "accepted" ? "You've been added to the event" : "You've declined this invitation",
        position: "bottom"
      });
    } catch (error) {
      console.error("Error submitting response:", error);
      Toast.show({
        type: "error",
        text1: "Action Failed",
        text2: "Please try again later",
        position: "bottom"
      });
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.notificationHeader}>
        <View style={styles.notificationDot}></View>
        <Text style={styles.notificationType}>Event Invitation</Text>
      </View>
      
      <View style={styles.contentContainer}>
        <Text style={styles.eventName}>{item.eventName}</Text>
        <View style={styles.detailsRow}>
          <Text style={styles.detailsLabel}>From:</Text>
          <Text style={styles.detailsValue}>{item.name}</Text>
        </View>
        {item.description && (
          <View style={styles.detailsRow}>
            <Text style={styles.detailsLabel}>Details:</Text>
            <Text style={styles.detailsValue} numberOfLines={2}>{item.description || "No description provided"}</Text>
          </View>
        )}
      </View>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.rejectButton}
          onPress={() => handleResponse(item._id, "rejected")}
        >
          <Text style={styles.rejectButtonText}>Decline</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.acceptButton}
          onPress={() => handleResponse(item._id, "accepted")}
        >
          <Text style={styles.acceptButtonText}>Accept</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Text style={styles.emptyIconText}>📬</Text>
      </View>
      <Text style={styles.emptyTitle}>All Caught Up!</Text>
      <Text style={styles.emptyText}>You have no pending invitations.</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4361EE" />
        <Text style={styles.loadingText}>Loading notifications...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
      </View>
      
      <FlatList
        data={pendingParticipations}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        ListEmptyComponent={renderEmptyComponent}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={["#4361EE"]}
            tintColor="#4361EE"
          />
        }
      />
      <Toast />
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
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    elevation: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333333",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F7FA",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666666",
  },
  listContainer: {
    padding: 16,
    paddingBottom: 80,
    flexGrow: 1,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  notificationHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  notificationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4361EE",
    marginRight: 8,
  },
  notificationType: {
    fontSize: 14,
    color: "#4361EE",
    fontWeight: "600",
  },
  contentContainer: {
    padding: 16,
    paddingTop: 0,
  },
  eventName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333333",
    marginBottom: 12,
  },
  detailsRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  detailsLabel: {
    fontSize: 14,
    color: "#666666",
    width: 60,
    fontWeight: "500",
  },
  detailsValue: {
    fontSize: 14,
    color: "#333333",
    flex: 1,
  },
  buttonContainer: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
  },
  acceptButton: {
    flex: 1,
    backgroundColor: "#4361EE",
    paddingVertical: 14,
    alignItems: "center",
  },
  acceptButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },
  rejectButton: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingVertical: 14,
    alignItems: "center",
    borderRightWidth: 1,
    borderRightColor: "#EEEEEE",
  },
  rejectButtonText: {
    color: "#666666",
    fontWeight: "600",
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#E8EFFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  emptyIconText: {
    fontSize: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333333",
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: "#666666",
    textAlign: "center",
  }
});

export default Notifications;