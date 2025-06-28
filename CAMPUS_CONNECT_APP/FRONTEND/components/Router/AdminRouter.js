import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation, DrawerActions } from "@react-navigation/native";
import { FontAwesome5 } from "@expo/vector-icons";
import Sidebar from "../Screens/Admin/Sidebar";
import AddEvent from "../Screens/Admin/AddEvent";
import EventDetails from "../Screens/Admin/EventDetails";
import AddFaculty from "../Screens/Admin/AddFaculty";
import CertificateGeneration from "../Screens/Admin/CertificateGeneration";
import FacultyDetailsTable from "../Screens/Admin/FacultyDetailsTable";
import EditEvent from "../Screens/Admin/EditEvent";
import EditFaculty from "../Screens/Admin/EditFaculty";
import AdminDashboard from "../Screens/Admin/AdminDashboard";
import IDCardUpload from "../Screens/Admin/IDCardUpload";
import InvitationForm from "../Screens/Admin/InvitationForm";
import JudgeAdd from "../Screens/Admin/JudgeAdd";
import ParticipationDetails from "../Screens/Admin/ParticipationDetails";
import StudentDetails from "../Screens/Admin/StudentDetails";
import JudgeList from "../Screens/Admin/JudgeList";
import JudgeDetails from "../Screens/Admin/JudgeDetails";
import WinnersTable from "../Screens/Admin/WinnersTable";
import ReportComponent from "../Screens/Admin/ReportComponent";
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

function AdminRouter() {
  return (
    <>

      <Drawer.Navigator
        initialRouteName="AdminDashboard" // Ensuring "AddEvent" is the first screen
        drawerContent={(props) => <Sidebar {...props} />}
        screenOptions={{
          headerShown: true,
          drawerType: "front",
          headerTitle:"",
          headerLeft: () => <HeaderLeft />, // Custom menu button
        }}
      >
        {/* ✅ Make sure all screens exist in the Drawer.Navigator */}
        <Drawer.Screen name="AdminDashboard" component={AdminDashboard}/>
        <Drawer.Screen name="AddEvent" component={AddEvent} />
        <Drawer.Screen name="EventDetails" component={EventDetails} />
        <Drawer.Screen name="AddFaculty" component={AddFaculty} />
        <Drawer.Screen name="CertificateGeneration" component={CertificateGeneration} />
        <Drawer.Screen name="FacultyDetailsTable" component={FacultyDetailsTable} />
        <Drawer.Screen name="EditEvent" component={EditEvent} />
        <Drawer.Screen name="EditFaculty" component={EditFaculty}/>
        <Drawer.Screen name="IDCardUpload" component={IDCardUpload}/>
        <Drawer.Screen name="InvitationForm" component={InvitationForm}/>
        <Drawer.Screen name="JudgeAdd" component={JudgeAdd}/>
        <Drawer.Screen name="ParticipationDetails" component={ParticipationDetails}/>
        <Drawer.Screen name="StudentDetails" component={StudentDetails}/>
        <Drawer.Screen name="JudgeList" component={JudgeList}/>
        <Drawer.Screen name="JudgeDetails" component={JudgeDetails}/>
        <Drawer.Screen name="WinnersTable" component={WinnersTable}/>
        <Drawer.Screen name="Report" component={ReportComponent}/>


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

export default AdminRouter;
