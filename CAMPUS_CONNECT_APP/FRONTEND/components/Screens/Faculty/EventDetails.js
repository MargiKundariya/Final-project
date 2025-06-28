import React, { useEffect, useState } from "react";
import { 
  View, FlatList, Alert, StyleSheet, TextInput, Image, TouchableOpacity, SafeAreaView, StatusBar
} from "react-native";
import { Button, Card, Text, ActivityIndicator, Divider, Chip } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { FontAwesome5 } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { getApiBaseUrl } from "../config";

const EventDetails = () => {
  const navigation = useNavigation();
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [apiBaseUrl, setApiBaseUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const url = await getApiBaseUrl();
      setApiBaseUrl(url);
      
      const response = await fetch(`${url}/api/events`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setEvents(data.events);
      setFilteredEvents(data.events);
    } catch (error) {
      console.error("Error fetching events:", error);
      Toast.show({
        type: "error",
        text1: "Failed to load events",
        text2: "Please check your connection and try again",
        position: "top",
        visibilityTime: 3000,
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    const filtered = events.filter(event => 
      event.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredEvents(filtered);
  }, [searchQuery, events]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchEvents();
  };

  const handleEdit = (event) => {
    navigation.navigate("EditEvent", { event });
  };

  const handleDelete = async (event) => {
    Alert.alert("Delete Event", "Are you sure you want to delete this event?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        onPress: async () => {
          try {
            const response = await fetch(`${apiBaseUrl}/api/events/${event._id}`, {
              method: "DELETE",
            });
            if (response.ok) {
              setEvents(events.filter((e) => e._id !== event._id));
              setFilteredEvents(filteredEvents.filter((e) => e._id !== event._id));

              Toast.show({
                type: "success",
                text1: "Event Deleted",
                text2: "The event has been removed successfully.",
                position: "top",
                visibilityTime: 3000,
              });
            } else {
              Alert.alert("Error", "Failed to delete event.");
            }
          } catch (error) {
            console.error("Error deleting event:", error);
            Alert.alert("Error", "Failed to delete event. Please try again.");
          }
        },
        style: "destructive",
      },
    ]);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderEventCard = ({ item }) => {
    const attachmentUrl = item.attachments
      ? `${apiBaseUrl}${item.attachments.startsWith("/") ? item.attachments : "/" + item.attachments}`
      : null;

    const scannerUrl = item.scanner
      ? `${apiBaseUrl}${item.scanner.startsWith("/") ? item.scanner : "/" + item.scanner}`
      : null;

    return (
      <Card style={styles.card} elevation={3}>
        {attachmentUrl && (
          <Card.Cover
            source={{ uri: attachmentUrl }}
            style={styles.attachmentImage}
          />
        )}

        <Card.Content style={styles.cardContent}>
          <Text variant="headlineSmall" style={styles.eventTitle}>{item.name}</Text>
          
          <View style={styles.dateVenueContainer}>
            <Chip 
              icon={() => <FontAwesome5 name="calendar-alt" size={14} color="#2237ac" />}
              style={styles.chip}
            >
              {formatDate(item.date)}
            </Chip>
            <Chip 
              icon={() => <FontAwesome5 name="clock" size={14} color="#2237ac" />}
              style={styles.chip}
            >
              {item.startTime} - {item.endTime}
            </Chip>
          </View>

          <View style={styles.infoRow}>
            <FontAwesome5 name="map-marker-alt" size={16} color="#2237ac" />
            <Text style={styles.infoText}>{item.venue}</Text>
          </View>

          <Divider style={styles.divider} />
          
          <Text style={styles.descriptionTitle}>About this event</Text>
          <Text style={styles.descriptionText}>{item.description}</Text>

          {/* Criteria Section */}
          {item.criteria?.length > 0 && (
            <View style={styles.listContainer}>
              <Text style={styles.sectionTitle}>Criteria</Text>
              {item.criteria.map((criterion, index) => (
                <View key={index} style={styles.listItemContainer}>
                  <FontAwesome5 name="check-circle" size={14} color="#28a745" style={styles.listIcon} />
                  <Text style={styles.listItem}>{criterion}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Coordinators Section */}
          {item.coordinators?.length > 0 && (
            <View style={styles.listContainer}>
              <Text style={styles.sectionTitle}>Coordinators</Text>
              {item.coordinators.map((coordinator, index) => (
                <View key={index} style={styles.listItemContainer}>
                  <FontAwesome5 name="user" size={14} color="#2237ac" style={styles.listIcon} />
                  <Text style={styles.listItem}>{coordinator}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Scanner Section */}
        </Card.Content>

        <Card.Actions style={styles.buttonContainer}>
          <Button 
            mode="contained" 
            onPress={() => handleEdit(item)} 
            style={styles.editButton}
            icon={() => <FontAwesome5 name="edit" size={16} color="#FFF" />}
            contentStyle={styles.buttonContent}
          >
            Edit
          </Button>
          <Button 
            mode="contained" 
            onPress={() => handleDelete(item)} 
            style={styles.deleteButton}
            icon={() => <FontAwesome5 name="trash" size={16} color="#FFF" />}
            contentStyle={styles.buttonContent}
          >
            Delete
          </Button>
        </Card.Actions>
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#F9F9F9" barStyle="dark-content" />
      <View style={styles.container}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <FontAwesome5 name="search" size={16} color="#888" style={styles.searchIcon} />
          <TextInput 
            style={styles.searchInput} 
            placeholder="Search events..."
            placeholderTextColor="#888"
            value={searchQuery} 
            onChangeText={setSearchQuery} 
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")} style={styles.clearButton}>
              <FontAwesome5 name="times-circle" size={16} color="#888" />
            </TouchableOpacity>
          )}
        </View>

        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2237ac" />
            <Text style={styles.loadingText}>Loading events...</Text>
          </View>
        ) : filteredEvents.length === 0 ? (
          <View style={styles.emptyContainer}>
            <FontAwesome5 name="calendar-times" size={60} color="#ccc" />
            <Text style={styles.emptyText}>No events found</Text>
            <Button 
              mode="contained" 
              onPress={handleRefresh}
              style={styles.refreshButton}
            >
              Refresh
            </Button>
          </View>
        ) : (
          <FlatList
            data={filteredEvents}
            keyExtractor={(item) => item._id}
            renderItem={renderEventCard}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        )}
      </View>
      <Toast />
    </SafeAreaView>
  );
};

// Styles
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F9F9F9",
  },
  container: { 
    flex: 1, 
    padding: 16, 
    backgroundColor: "#F9F9F9" 
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 50,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: "#fff",
    marginBottom: 16,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  clearButton: {
    padding: 4,
  },
  listContent: {
    paddingBottom: 16,
  },
  card: { 
    backgroundColor: "#FFF", 
    borderRadius: 16, 
    marginBottom: 16, 
    overflow: "hidden",
  },
  cardContent: {
    paddingVertical: 16,
  },
  attachmentImage: {
    height: 200,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  eventTitle: { 
    fontSize: 22, 
    fontWeight: "bold", 
    color: "#1E3A8A", 
    marginBottom: 12 
  },
  dateVenueContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 8,
  },
  chip: {
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: "#EEF2FF",
  },
  infoRow: { 
    flexDirection: "row", 
    alignItems: "center", 
    marginVertical: 8 
  },
  infoText: { 
    fontSize: 16, 
    color: "#333", 
    marginLeft: 8, 
    fontWeight: "500" 
  },
  divider: {
    marginVertical: 16,
    height: 1,
    backgroundColor: "#E0E0E0",
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1E3A8A",
    marginBottom: 8,
  },
  descriptionText: { 
    fontSize: 16, 
    color: "#444", 
    lineHeight: 24,
  },
  sectionTitle: { 
    fontSize: 18, 
    fontWeight: "bold", 
    color: "#1E3A8A", 
    marginTop: 16,
    marginBottom: 8,
  },
  listContainer: {
    marginTop: 8,
  },
  listItemContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  listIcon: {
    marginRight: 8,
  },
  listItem: { 
    fontSize: 16, 
    color: "#444",
    lineHeight: 22,
  },
  scannerContainer: {
    marginTop: 16,
    alignItems: "center",
  },
  scannerImage: {
    width: 150,
    height: 150,
    borderRadius: 12,
    resizeMode: "cover",
    marginTop: 10,
  },
  buttonContainer: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    marginTop: 8,
    marginBottom: 8, 
    paddingHorizontal: 8,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  editButton: { 
    backgroundColor: "#28a745", 
    borderRadius: 8,
    elevation: 2,
    flex: 1,
    marginRight: 8,
  },
  deleteButton: { 
    backgroundColor: "#D32F2F", 
    borderRadius: 8,
    elevation: 2,
    flex: 1,
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    color: "#666",
    marginBottom: 16,
  },
  refreshButton: {
    backgroundColor: "#2237ac",
    borderRadius: 8,
  },
});

export default EventDetails;