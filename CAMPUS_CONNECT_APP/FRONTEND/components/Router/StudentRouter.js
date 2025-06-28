import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation, DrawerActions } from "@react-navigation/native";
import { FontAwesome5 } from "@expo/vector-icons";
import Sidebar from "../Screens/Student/Sidebar";
import Home from "../Screens/Student/Home";
import DashboardContainer from "../Screens/Student/DashboardContainer";
import EventModal from "../Screens/Student/EventModal";
import RegisterForEvent from "../Screens/Student/RegisterForEvent";
import RegisterForBoth from "../Screens/Student/RegisterForBoth";
import ScannerModal from "../Screens/Student/ScannerModal";
import RegisterForTeam from "../Screens/Student/RegisterForTeam";
import IDCardDisplay from "../Screens/Student/IDCardDisplay";
import Profile from "../Screens/Student/Profile";
import StudentCertificates from "../Screens/Student/StudentCertificates";
import Notifications from "../Screens/Student/Notifications";
import FeedbackForm from "../Screens/Student/FeedbackForm";
import ParticipatedEvents from "../Screens/Student/ParticipatedEvents";
const Drawer = createDrawerNavigator();

function HeaderLeft() {
  const navigation = useNavigation();
  return (
    <TouchableOpacity 
      onPress={() => navigation.dispatch(DrawerActions.openDrawer())} 
      style={styles.headerContainer}
    >
      <FontAwesome5 name="bars" size={22} color="#000" style={styles.menuIcon} />
      <Text style={styles.menuText}>Menu</Text>
    </TouchableOpacity>
  );
}

function StudentRouter() {
  return (
    <>

      <Drawer.Navigator
        initialRouteName="Home" // Ensuring "AddEvent" is the first screen
        drawerContent={(props) => <Sidebar {...props} />}
        screenOptions={{
          headerShown: true,
          drawerType: "front",
          headerTitle:"",
          headerLeft: () => <HeaderLeft />, // Custom menu button
        }}
      >
        {/* ✅ Make sure all screens exist in the Drawer.Navigator */}
        <Drawer.Screen name="Home" component={Home} />
        <Drawer.Screen name="DashboardContainer" component={DashboardContainer} />
        <Drawer.Screen name="EventModal" component={EventModal} />
        <Drawer.Screen name="RegisterForEvent" component={RegisterForEvent} />
        <Drawer.Screen name="RegisterForTeam" component={RegisterForTeam} />
        <Drawer.Screen name="RegisterForBoth" component={RegisterForBoth} />

        <Drawer.Screen name="ScannerModal" component={ScannerModal} />
        <Drawer.Screen name="IDCardDisplay" component={IDCardDisplay} />
        <Drawer.Screen name="Profile" component={Profile} />
        <Drawer.Screen name="StudentCertificates" component={StudentCertificates} />
        <Drawer.Screen name="Notifications" component={Notifications} />
        <Drawer.Screen name="FeedbackForm" component={FeedbackForm} />
        <Drawer.Screen name="participatedevent" component={ParticipatedEvents} />

     </Drawer.Navigator>
    </>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 15,
  },
  menuIcon: {
    fontSize: 22,
    marginRight: 12,
  },
  menuText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#000",
    textAlignVertical: "center",
  },
});

export default StudentRouter;
