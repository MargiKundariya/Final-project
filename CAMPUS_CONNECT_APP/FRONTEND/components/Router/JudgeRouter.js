import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation, DrawerActions } from "@react-navigation/native";
import { FontAwesome5 } from "@expo/vector-icons";
import InvitationList from "../Screens/Judge/InvitationList";
import Sidebar from "../Screens/Judge/Sidebar";
import ParticipationDetails from "../Screens/Judge/ParticipationDetails";
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

function JudgeRouter() {
  return (
    <>

      <Drawer.Navigator
        initialRouteName="InvitationList" // Ensuring "AddEvent" is the first screen
        drawerContent={(props) => <Sidebar {...props} />}
        screenOptions={{
          headerShown: true,
          drawerType: "front",
          headerTitle:"",
          headerLeft: () => <HeaderLeft />, // Custom menu button
        }}
      >
        {/* ✅ Make sure all screens exist in the Drawer.Navigator */}
        <Drawer.Screen name="InvitationList" component={InvitationList} />
        <Drawer.Screen name="ParticipationDetails" component={ParticipationDetails} />

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

export default JudgeRouter;
