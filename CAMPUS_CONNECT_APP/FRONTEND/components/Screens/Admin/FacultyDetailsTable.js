import React, { useState, useEffect } from "react";
import { 
  View, 
  FlatList, 
  Alert, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  StatusBar,
  RefreshControl,
  TextInput,
  ActivityIndicator
} from "react-native";
import { Button, Card, Text, Avatar, Badge, Divider, Chip } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { FontAwesome5 } from "@expo/vector-icons";
import axios from "axios";
import { getApiBaseUrl } from "../config";

const FacultyDetailsTable = () => {
  const navigation = useNavigation();
  const [faculty, setFaculty] = useState([]);
  const [filteredFaculty, setFilteredFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchFacultyData();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredFaculty(faculty);
    } else {
      const filtered = faculty.filter(
        member => 
          member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          member.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
          member.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredFaculty(filtered);
    }
  }, [searchQuery, faculty]);

  const fetchFacultyData = async () => {
    try {
      setLoading(true);
      const apiBaseUrl = await getApiBaseUrl();
      const response = await axios.get(`${apiBaseUrl}/api/faculty`);
      const filteredFaculty = response.data.filter((member) => member.role === "faculty");
      setFaculty(filteredFaculty);
      setFilteredFaculty(filteredFaculty);
    } catch (error) {
      console.error("Error fetching faculty data:", error);
      Alert.alert(
        "Error",
        "Failed to load faculty data. Please try again.",
        [{ text: "OK" }]
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchFacultyData();
  };

  const handleEdit = (member) => {
    navigation.navigate("EditFaculty", { member });
  };

  const handleDelete = async (member) => {
    Alert.alert(
      "Delete Faculty", 
      `Are you sure you want to delete ${member.name}?`, 
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          onPress: async () => {
            try {
              const apiBaseUrl = await getApiBaseUrl();
              await axios.delete(`${apiBaseUrl}/api/faculty/${member._id}`);
              setFaculty((prev) => prev.filter((m) => m._id !== member._id));
              Alert.alert("Success", "Faculty member deleted successfully");
            } catch (error) {
              console.error("Error deleting faculty member:", error);
              Alert.alert("Error", "Failed to delete faculty member");
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarBgColor = (name) => {
    const colors = ['#4CAF50', '#2196F3', '#9C27B0', '#F44336', '#FF9800', '#009688'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    hash = Math.abs(hash);
    return colors[hash % colors.length];
  };

  const renderFacultyCard = ({ item }) => (
    <Card style={styles.card} elevation={3}>
      <View style={styles.cardHeader}>
        <Avatar.Text 
          size={60} 
          label={getInitials(item.name)}
          style={[styles.avatar, { backgroundColor: getAvatarBgColor(item.name) }]}
        />
        <View style={styles.headerInfo}>
          <Text variant="titleLarge" style={styles.title}>{item.name}</Text>
          <Chip 
            icon={() => <FontAwesome5 name="building" size={14} color="#2237ac" />}
            style={styles.departmentChip}
            textStyle={{ color: "#2237ac" }}
          >
            {item.department}
          </Chip>
        </View>
      </View>
      
      <Divider style={styles.divider} />
      
      <Card.Content style={styles.cardContent}>
        <View style={styles.infoRow}>
          <View style={styles.iconContainer}>
            <FontAwesome5 name="mobile-alt" size={16} color="#2237ac" />
          </View>
          <Text style={styles.infoText}>{item.mobileNumber}</Text>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.iconContainer}>
            <FontAwesome5 name="venus-mars" size={16} color="#2237ac" />
          </View>
          <Text style={styles.infoText}>{item.gender}</Text>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.iconContainer}>
            <FontAwesome5 name="envelope" size={16} color="#2237ac" />
          </View>
          <Text style={styles.infoText}>{item.email}</Text>
        </View>
      </Card.Content>

      <Card.Actions style={styles.buttonContainer}>
        <Button 
          mode="contained" 
          onPress={() => handleEdit(item)} 
          style={styles.editButton}
          icon={({size, color}) => <FontAwesome5 name="edit" size={size-4} color={color} />}
          contentStyle={styles.buttonContent}
        >
          Edit
        </Button>
        <Button 
          mode="contained" 
          onPress={() => handleDelete(item)} 
          style={styles.deleteButton}
          icon={({size, color}) => <FontAwesome5 name="trash-alt" size={size-4} color={color} />}
          contentStyle={styles.buttonContent}
        >
          Delete
        </Button>
      </Card.Actions>
    </Card>
  );

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <FontAwesome5 name="user-slash" size={60} color="#ccc" />
      <Text style={styles.emptyText}>No faculty members found</Text>
      {searchQuery ? (
        <Button 
          mode="contained" 
          onPress={() => setSearchQuery("")}
          style={styles.clearSearchButton}
        >
          Clear Search
        </Button>
      ) : (
        <Button 
          mode="contained" 
          onPress={onRefresh}
          style={styles.refreshButton}
        >
          Refresh
        </Button>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#F5F5F5" barStyle="dark-content" />
      <View style={styles.container}>
        <View style={styles.searchContainer}>
          <FontAwesome5 name="search" size={16} color="#888" style={styles.searchIcon} />
          <TextInput 
            style={styles.searchInput} 
            placeholder="Search by name, department or email..."
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
            <Text style={styles.loadingText}>Loading faculty data...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredFaculty}
            keyExtractor={(item) => item._id}
            renderItem={renderFacultyCard}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={renderEmptyList}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={["#2237ac"]}
              />
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#F5F5F5",
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
  listContent: {
    flexGrow: 1,
    paddingBottom: 16,
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
    elevation: 3,
    borderColor: "#E0E0E0",
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: "row",
    padding: 16,
    alignItems: "center",
  },
  avatar: {
    marginRight: 16,
  },
  headerInfo: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1E3A8A",
    marginBottom: 8,
  },
  departmentChip: {
    backgroundColor: "#EEF2FF",
    alignSelf: "flex-start",
  },
  divider: {
    backgroundColor: "#E0E0E0",
    height: 1,
  },
  cardContent: {
    paddingTop: 16,
    paddingBottom: 8,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  iconContainer: {
    width: 32,
    alignItems: "center",
  },
  infoText: {
    fontSize: 16,
    color: "#444",
    flex: 1,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 8,
  },
  buttonContent: {
    paddingVertical: 6,
  },
  editButton: {
    backgroundColor: "#28a745",
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
  },
  deleteButton: {
    backgroundColor: "#D32F2F",
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    color: "#666",
    marginTop: 16,
    marginBottom: 16,
  },
  clearSearchButton: {
    backgroundColor: "#2237ac",
    borderRadius: 8,
  },
  refreshButton: {
    backgroundColor: "#2237ac",
    borderRadius: 8,
  },
});

export default FacultyDetailsTable;