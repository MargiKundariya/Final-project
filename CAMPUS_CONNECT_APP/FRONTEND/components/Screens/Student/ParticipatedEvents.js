import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, ActivityIndicator, StyleSheet, TouchableOpacity, RefreshControl } from "react-native";
import { getApiBaseUrl } from "../config";

const ParticipatedEvents = () => {
  const [participations, setParticipations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [studentName, setStudentName] = useState("");
  const [totalEvents, setTotalEvents] = useState(0);

  const fetchData = async () => {
    try {
      setError(null);
      const baseUrl = await getApiBaseUrl();
  
      // Fetch session
      const sessionResponse = await fetch(`${baseUrl}/api/users/session`, { credentials: "include" });
      const sessionData = await sessionResponse.json();
  
      if (sessionData && sessionData.name) {
        setStudentName(sessionData.name);
  
        const participationRes = await fetch(
          `${baseUrl}/api/participation/user?name=${encodeURIComponent(sessionData.name)}`
        );
        const participationData = await participationRes.json();
  
        if (participationData.success) {
          // ✅ Apply filtering logic
          const filteredParticipations = participationData.participations.filter(event => {
            const studentMember = event.team_members?.find(member => member.name === sessionData.name);
            return !(studentMember && (studentMember.status === "pending" || studentMember.status === "rejected"));
          });
  
          setParticipations(filteredParticipations);
          setTotalEvents(filteredParticipations.length);
        }
      } else {
        setError("User session not found");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load participation data. Pull down to refresh.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";
    const parsedDate = new Date(dateString);
    if (isNaN(parsedDate.getTime())) return "Invalid date";
    return parsedDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4f46e5" />
        <Text style={styles.loadingText}>Loading your events...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#4f46e5"]} />}
    >
      <View style={styles.header}>
        <Text style={styles.pageTitle}>My Events</Text>
        <View style={styles.statsCard}>
          <Text style={styles.statsValue}>{totalEvents}</Text>
          <Text style={styles.statsLabel}>Total Events</Text>
        </View>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchData}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {!error && participations.length === 0 && (
        <View style={styles.emptyStateContainer}>
          <View style={styles.emptyStateIconPlaceholder} />
          <Text style={styles.emptyStateTitle}>No Events Yet</Text>
          <Text style={styles.emptyStateDescription}>
            You haven't participated in any events so far. Check out upcoming events to get started!
          </Text>
        </View>
      )}

{participations.map((event, index) => {
  const isTeamMember = event.team_members?.some(
    member => member.name?.trim().toLowerCase() === studentName.trim().toLowerCase()
  );
  
  return (
    <TouchableOpacity key={event._id || index} style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.eventName}>{event.eventName || "Unnamed Event"}</Text>
        <View style={styles.dateBadge}>
          <Text style={styles.dateText}>{formatDate(event.date).split(' ').slice(0, 2).join(' ')}</Text>
        </View>
      </View>
      
      <View style={styles.divider} />
      
      <View style={styles.cardContent}>
        <View style={styles.detailRow}>
          <Text style={styles.label}>{isTeamMember ? "Added by:" : "Name:"}</Text>
          <Text style={styles.value}>{event.name}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.label}>Date</Text>
          <Text style={styles.value}>{formatDate(event.date)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
})}

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 24,
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
    color: "#6B7280",
  },
  header: {
    marginBottom: 24,
    alignItems: "center",
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 16,
  },
  statsCard: {
    backgroundColor: "#4f46e5",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    width: "50%",
    shadowColor: "#4f46e5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  statsValue: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#ffffff",
  },
  statsLabel: {
    fontSize: 14,
    color: "#E0E7FF",
    marginTop: 4,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    overflow: "hidden",
  },
  cardHeader: {
    padding: 16,
    paddingBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  eventName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    flex: 1,
  },
  dateBadge: {
    backgroundColor: "#EEF2FF",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  dateText: {
    fontSize: 12,
    color: "#4f46e5",
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginHorizontal: 16,
  },
  cardContent: {
    padding: 16,
  },
  detailRow: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: "#1F2937",
    fontWeight: "500",
  },
  emptyStateContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginTop: 16,
  },
  emptyStateIconPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#EEF2FF",
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 8,
  },
  emptyStateDescription: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 24,
  },
  errorContainer: {
    backgroundColor: "#FEF2F2",
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    marginBottom: 16,
    alignItems: "center",
  },
  errorText: {
    color: "#B91C1C",
    fontSize: 16,
    marginBottom: 12,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#DC2626",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
});

export default ParticipatedEvents;