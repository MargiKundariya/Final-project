import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import { getApiBaseUrl } from "../config"; 

const Profile = () => {
  const [profile, setProfile] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [image, setImage] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const baseUrl = await getApiBaseUrl();
        const response = await axios.get(`${baseUrl}/api/profile`, { withCredentials: true });
        const fetchedProfile = response.data;
        setProfile(fetchedProfile);
        setFormData(fetchedProfile);
        setImage(fetchedProfile.image || null);
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (key, value) => {
    setFormData({ ...formData, [key]: value });
  };

  const handleSave = async () => {
    try {
      const baseUrl = await getApiBaseUrl();
      const response = await axios.post(`${baseUrl}/api/profile`, formData, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });
      setProfile(response.data);
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving profile:", error);
      Alert.alert("Failed to save profile.");
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "Allow access to your media library to upload images.");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      const selectedImage = result.assets[0].uri; // Fix for accessing image URI
      setImage(selectedImage);
      setFormData({ ...formData, image: selectedImage });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={pickImage}>
          {image ? (
            <Image source={{ uri: image }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {profile.name ? profile.name.charAt(0).toUpperCase() : "A"}
              </Text>
            </View>
          )}
        </TouchableOpacity>
        <Text style={styles.name}>{profile.name || "Default"}</Text>
        <Text style={styles.email}>{profile.email || "Default Email"}</Text>
      </View>
      <View style={styles.infoContainer}>
        <ProfileField label="Full Name" value={formData.name} onChange={(val) => handleChange("name", val)} editable={isEditing} />
        <ProfileField label="Date of Birth" value={formData.dob?.split("T")[0]} onChange={(val) => handleChange("dob", val)} editable={isEditing} />
        <ProfileField label="Phone" value={formData.contact} onChange={(val) => handleChange("contact", val)} editable={isEditing} />
        <ProfileField label="Address" value={formData.address} onChange={(val) => handleChange("address", val)} editable={isEditing} />
        <ProfileField label="Blood Group" value={formData.bloodGroup} onChange={(val) => handleChange("bloodGroup", val)} editable={isEditing} />
        <ProfileField label="Role" value={formData.role} editable={false} />
        <View style={styles.buttonContainer}>
          {!isEditing ? (
            <TouchableOpacity style={styles.editBtn} onPress={() => setIsEditing(true)}>
              <Text style={styles.btnText}>Edit Profile</Text>
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                <Text style={styles.btnText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => { setFormData(profile); setIsEditing(false); }}>
                <Text style={styles.btnText}>Cancel</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </View>
  );
};

const ProfileField = ({ label, value, onChange, editable }) => (
  <View style={styles.field}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={[styles.input, !editable && styles.disabledInput]}
      value={value}
      onChangeText={onChange}
      editable={editable}
    />
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 20 },
  header: { alignItems: "center", marginBottom: 20 },
  avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 2, borderColor: "#1434a4" }, // Fix: Make sure the image is circular
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#1434a4",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: { color: "#fff", fontSize: 24, fontWeight: "bold" },
  name: { fontSize: 20, fontWeight: "bold", color: "#1434a4", marginTop: 10 },
  email: { fontSize: 14, color: "#777" },
  infoContainer: { backgroundColor: "#f9f9f9", padding: 15, borderRadius: 10, elevation: 2 },
  field: { marginBottom: 10 },
  label: { fontSize: 14, fontWeight: "bold", color: "#333" },
  input: { borderBottomWidth: 1, borderColor: "#ccc", padding: 5, fontSize: 16 },
  disabledInput: { backgroundColor: "#e9ecef" },
  buttonContainer: { marginTop: 20, flexDirection: "row", justifyContent: "space-between" },
  editBtn: { backgroundColor: "#1434a4", padding: 10, borderRadius: 5 },
  saveBtn: { backgroundColor: "#28a745", padding: 10, borderRadius: 5 },
  cancelBtn: { backgroundColor: "#dc3545", padding: 10, borderRadius: 5 },
  btnText: { color: "#fff", fontSize: 16, textAlign: "center" },
});

export default Profile;
