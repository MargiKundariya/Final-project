import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator, 
  Dimensions, 
  TouchableOpacity,
  RefreshControl
} from "react-native";
import { PieChart } from "react-native-chart-kit";
import Icon from "react-native-vector-icons/FontAwesome5";
import { getApiBaseUrl } from "../config";

const screenWidth = Dimensions.get("window").width;

const FacultyDashboard = () => {
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [completedEvents, setCompletedEvents] = useState(0);
  const [studentCount, setStudentCount] = useState(0);
  const [participationCount, setParticipationCount] = useState(0);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const baseUrl = await getApiBaseUrl();

      const [eventRes, completedRes, statsRes, feedbackRes] = await Promise.all([
        fetch(`${baseUrl}/api/events/upcoming`),
        fetch(`${baseUrl}/api/events/completed`),
        fetch(`${baseUrl}/api/events/stats`),
        fetch(`${baseUrl}/api/feedback`),
      ]);

      const eventData = await eventRes.json();
      const completedData = await completedRes.json();
      const statsData = await statsRes.json();
      const feedbackData = await feedbackRes.json();

      setUpcomingEvents(eventData.upcomingEvents || []);
      setCompletedEvents(completedData.completedEvents?.length || 0);
      setStudentCount(statsData.studentCount || 0);
      setParticipationCount(statsData.participationCount || 0);
      setFeedbacks(feedbackData.feedbacks || []);
    } catch (error) {
      console.error("Error fetching admin dashboard data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  useEffect(() => {
    fetchData();
  }, []);

  const pieData = [
    {
      name: "Students",
      population: studentCount,
      color: "#4361ee",
      legendFontColor: "#333",
      legendFontSize: 13,
    },
    {
      name: "Participation",
      population: participationCount,
      color: "#f72585",
      legendFontColor: "#333",
      legendFontSize: 13,
    },
  ];

  // Stats card for quick visualizations
  const StatsCard = ({ title, value, icon, color }) => (
    <View style={[styles.statsCard, { borderLeftColor: color }]}>
      <View style={styles.statsIconContainer}>
        <Icon name={icon} size={24} color={color} />
      </View>
      <View style={styles.statsContent}>
        <Text style={styles.statsValue}>{value}</Text>
        <Text style={styles.statsTitle}>{title}</Text>
      </View>
    </View>
  );

  // Event card with better formatting
  const EventCard = ({ event }) => (
    <TouchableOpacity style={styles.eventItem}>
      <View style={styles.eventHeader}>
        <Text style={styles.eventTitle}>{event.name}</Text>
        <View style={styles.eventDateBadge}>
          <Text style={styles.eventDateText}>
            {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </Text>
        </View>
      </View>
      <View style={styles.eventDetails}>
        <View style={styles.eventDetailRow}>
          <Icon name="clock" size={14} color="#666" style={styles.detailIcon} />
          <Text style={styles.eventDetailText}>{event.startTime} - {event.endTime}</Text>
        </View>
        <View style={styles.eventDetailRow}>
          <Icon name="map-marker-alt" size={14} color="#666" style={styles.detailIcon} />
          <Text style={styles.eventDetailText}>{event.venue}</Text>
        </View>
        <View style={styles.eventDetailRow}>
          <Icon name="user-tie" size={14} color="#666" style={styles.detailIcon} />
          <Text style={styles.eventDetailText}>{event.coordinators?.join(", ")}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Feedback card with better design
  const FeedbackCard = ({ feedback }) => (
    <View style={styles.feedbackItem}>
      <View style={styles.feedbackHeader}>
        <Icon name="user-circle" size={18} color="#4361ee" />
        <Text style={styles.feedbackUser}>{feedback.name}</Text>
      </View>
      <Text style={styles.feedbackMessage}>"{feedback.message}"</Text>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#4361ee" />
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#4361ee"]} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dashboard</Text>
        <Text style={styles.headerSubtitle}>Event Management Overview</Text>
      </View>

      {/* Stats Summary */}
      <View style={styles.statsContainer}>
        <StatsCard 
          title="Events Completed" 
          value={completedEvents} 
          icon="check-circle" 
          color="#4cc9f0" 
        />
        <StatsCard 
          title="Total Participants" 
          value={participationCount} 
          icon="users" 
          color="#f72585" 
        />
      </View>

      {/* Upcoming Events */}
      <View style={styles.card}>
        <View style={styles.cardTitleContainer}>
          <Icon name="calendar-alt" size={18} color="#4361ee" />
          <Text style={styles.cardTitle}>Upcoming Events</Text>
        </View>
        {upcomingEvents.length > 0 ? (
          upcomingEvents.map((event, index) => (
            <EventCard key={index} event={event} />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Icon name="calendar-times" size={40} color="#ddd" />
            <Text style={styles.emptyStateText}>No upcoming events</Text>
          </View>
        )}
      </View>

      {/* Feedback List */}
      <View style={styles.card}>
        <View style={styles.cardTitleContainer}>
          <Icon name="star" size={18} color="#4361ee" />
          <Text style={styles.cardTitle}>Event Feedback</Text>
        </View>
        {feedbacks.length > 0 ? (
          feedbacks.map((feedback, index) => (
            <FeedbackCard key={index} feedback={feedback} />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Icon name="comment-slash" size={40} color="#ddd" />
            <Text style={styles.emptyStateText}>No feedback available</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#f8f9fa" 
  },
  loader: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center" 
  },
  header: {
    padding: 20,
    paddingBottom: 15
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#222"
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 5
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    marginBottom: 15
  },
  statsCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    width: "48%",
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    borderLeftWidth: 4
  },
  statsIconContainer: {
    marginRight: 12
  },
  statsContent: {
    flex: 1
  },
  statsValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333"
  },
  statsTitle: {
    fontSize: 12,
    color: "#666"
  },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2
  },
  cardTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15
  },
  cardTitle: { 
    fontSize: 16, 
    fontWeight: "bold", 
    color: "#333",
    marginLeft: 8
  },
  eventItem: {
    marginBottom: 12,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    overflow: "hidden"
  },
  eventHeader: {
    padding: 12,
    backgroundColor: "#4361ee",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  eventTitle: { 
    fontWeight: "bold", 
    fontSize: 15, 
    color: "#fff",
    flex: 1
  },
  eventDateBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4
  },
  eventDateText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold"
  },
  eventDetails: {
    padding: 12
  },
  eventDetailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6
  },
  detailIcon: {
    width: 18,
    alignItems: "center",
    marginRight: 8
  },
  eventDetailText: {
    fontSize: 13,
    color: "#666"
  },
  feedbackItem: {
    marginBottom: 10,
    backgroundColor: "#f8f9fa",
    padding: 12,
    borderRadius: 8
  },
  feedbackHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8
  },
  feedbackUser: { 
    fontWeight: "bold", 
    color: "#333",
    marginLeft: 8
  },
  feedbackMessage: { 
    fontStyle: "italic", 
    color: "#666" 
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 30
  },
  emptyStateText: {
    marginTop: 10,
    color: "#999",
    fontSize: 14
  }
});

export default FacultyDashboard;