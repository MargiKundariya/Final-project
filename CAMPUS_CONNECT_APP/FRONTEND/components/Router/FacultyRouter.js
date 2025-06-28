import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation, DrawerActions } from "@react-navigation/native";
import { FontAwesome5 } from "@expo/vector-icons";
import Sidebar from "../Screens/Faculty/Sidebar";
import AddEvent from "../Screens/Faculty/AddEvent";
import EventDetails from "../Screens/Faculty/EventDetails";
import CertificateGeneration from "../Screens/Faculty/CertificateGeneration";
import EditEvent from "../Screens/Faculty/EditEvent";
import FacultyDashboard from "../Screens/Faculty/FacultyDashboard";
import InvitationForm from "../Screens/Faculty/InvitationForm";
import StudentDetails from "../Screens/Faculty/StudentDetails";
import JudgeList from "../Screens/Faculty/JudgeList";
import ParticipationDetails from "../Screens/Faculty/ParticipationDetails";
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

function FacultyRouter() {
  return (
    <>

      <Drawer.Navigator
        initialRouteName="FacultyDashboard" // Ensuring "AddEvent" is the first screen
        drawerContent={(props) => <Sidebar {...props} />}
        screenOptions={{
          headerShown: true,
          drawerType: "front",
          headerTitle:"",
          headerLeft: () => <HeaderLeft />, // Custom menu button
        }}
      >
        {/* ✅ Make sure all screens exist in the Drawer.Navigator */}
        <Drawer.Screen name="FacultyDashboard" component={FacultyDashboard}/>
        <Drawer.Screen name="AddEvent" component={AddEvent} />
        <Drawer.Screen name="EventDetails" component={EventDetails} />
        <Drawer.Screen name="CertificateGeneration" component={CertificateGeneration} />
        <Drawer.Screen name="EditEvent" component={EditEvent} />
        <Drawer.Screen name="InvitationForm" component={InvitationForm}/>
        <Drawer.Screen name="StudentDetails" component={StudentDetails}/>
        <Drawer.Screen name="JudgeList" component={JudgeList}/>
        <Drawer.Screen name="ParticipationDetails" component={ParticipationDetails}/>


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

export default FacultyRouter;
