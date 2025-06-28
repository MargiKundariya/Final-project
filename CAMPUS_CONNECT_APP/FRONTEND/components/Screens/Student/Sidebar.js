import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useNavigation, DrawerActions } from "@react-navigation/native";
import { FontAwesome5 } from "@expo/vector-icons";
import axios from "axios";
import { getApiBaseUrl } from "../config";

const menuItems = [
  { name: "Home", icon: "home", route: "Home" },
  { name: "Dashboard Container", icon: "tachometer-alt", route: "DashboardContainer" },
  { name: "Id card Display", icon: "id-card", route: "IDCardDisplay" },
  { name: "Profile", icon: "user", route: "Profile" },
  { name: "Certificates", icon: "award", route: "StudentCertificates" },
  { name: "Notification", icon: "bell", route: "Notifications" },
  { name: "Feedback", icon: "comments", route: "FeedbackForm" },
  { name: "Information about Event", icon: "info-circle", route: "participatedevent" },
  { name: "Logout", icon: "sign-out-alt", route: "LoginRegister" },
];

const Sidebar = ({ navigation }) => {
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    const fetchUserEmail = async () => {
      try {
        const baseUrl = await getApiBaseUrl();
        const sessionResponse = await axios.get(`${baseUrl}/api/users/session`, {
          withCredentials: true,
        });
        const email = sessionResponse.data?.email;
        if (!email) {
          console.log("No email found in session API response");
          return;
        }
        fetchNotificationCount(email);
      } catch (error) {
        console.error("Error fetching user session:", error);
      }
    };

    const fetchNotificationCount = async (email) => {
      try {
        const baseUrl = await getApiBaseUrl();
        const response = await axios.get(`${baseUrl}/api/participation/notifications/count?email=${email}`, {
          withCredentials: true,
        });
        setNotificationCount(response.data.count);
      } catch (error) {
        console.error("Error fetching notification count:", error);
      }
    };

    fetchUserEmail();
    const interval = setInterval(fetchUserEmail, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleNavigation = async (route) => {
    if (route === "LoginRegister") {
      try {
        const baseUrl = await getApiBaseUrl();
        const response = await axios.post(`${baseUrl}/api/users/logout`, {}, { withCredentials: true });
        if (response.status === 200) {
          Alert.alert("Success", "Logged out successfully.");
          navigation.navigate("LoginRegister");
        }
      } catch (error) {
        Alert.alert("Error", "Failed to log out. Please try again.");
      }
    } else {
      navigation.navigate(route);
    }
    setTimeout(() => {
      navigation.dispatch(DrawerActions.closeDrawer());
    }, 300);
  };

  return (
    <View style={styles.sidebar}>
      <ScrollView style={styles.navLinks}>
        {menuItems.map((item, index) => (
          <TouchableOpacity key={index} style={styles.link} onPress={() => handleNavigation(item.route)}>
            <FontAwesome5 name={item.icon} size={20} color="#333" />
            <Text style={styles.linkText}>
              {item.name}
              {item.route === "Notifications" && notificationCount > 0 ? ` (${notificationCount})` : ""}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  sidebar: {
    flex: 1,
    backgroundColor: "#fff",
    paddingVertical: 20,
    paddingHorizontal: 15,
  },
  navLinks: {
    marginTop: 10,
  },
  link: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    marginVertical: 6,
    paddingHorizontal: 15,
    borderRadius: 25,
  },
  linkText: {
    marginLeft: 10,
    fontSize: 16,
    color: "#333",
  },
});

export default Sidebar;
