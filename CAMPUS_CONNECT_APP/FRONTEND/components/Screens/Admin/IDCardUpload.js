import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Image,
  SafeAreaView,
  ScrollView,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import * as XLSX from "xlsx";
import axios from "axios";
import Toast from "react-native-toast-message";
import { getApiBaseUrl } from "../config.js";
import { Ionicons } from "@expo/vector-icons";

const IDCardUpload = () => {
  const [generatedCards, setGeneratedCards] = useState([]);
  const [excelFile, setExcelFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState("");

  // Step 1: File Selection
  const handleFileSelection = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        copyToCacheDirectory: true,
      });
      
      if (result.canceled || !result.assets || result.assets.length === 0) {
        Toast.show({ type: "error", text1: "File Selection Failed", text2: "No file selected." });
        return;
      }

      setExcelFile(result.assets[0].uri);
      setFileName(result.assets[0].name);
      Toast.show({ type: "success", text1: "File Selected", text2: result.assets[0].name });
    } catch (error) {
      Toast.show({ type: "error", text1: "File Selection Error", text2: error.message });
    }
  };

  // Step 2: Read and Parse Excel File
  const handleFileRead = async () => {
    if (!excelFile) {
      Toast.show({ type: "error", text1: "No File Selected", text2: "Please select an Excel file first." });
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(excelFile);
      const arrayBuffer = await response.arrayBuffer();
      const wb = XLSX.read(arrayBuffer, { type: "array" });
      
      if (!wb.SheetNames || wb.SheetNames.length === 0) {
        throw new Error("No sheets found in the Excel file.");
      }

      const sheet = wb.Sheets[wb.SheetNames[0]];
      const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      if (!rawData || rawData.length < 2) {
        throw new Error("No valid data found in the Excel sheet.");
      }

      const headers = rawData[0];
      const jsonData = rawData.slice(1).map((row) =>
        headers.reduce((obj, header, index) => {
          obj[header] = row[index] || "";
          return obj;
        }, {})
      );

      const formattedData = jsonData.map((row) => ({
        Name: row.name ? row.name.trim() : "Unknown",
        Department: row.department ? row.department.trim() : "N/A",
        Year: row.year || "N/A",
        ContactNo: row.contactNumber || "N/A",
        EventName: row.eventName || "N/A",
        HeldNo: row.date ? new Date(row.date).toISOString().split("T")[0] : "N/A",
      }));

      sendDataToBackend(formattedData);
    } catch (error) {
      Toast.show({ type: "error", text1: "File Read Error", text2: error.message });
      setLoading(false);
    }
  };

  // Step 3: Send Data to Backend
  const sendDataToBackend = async (data) => {
    try {
      const apiUrl = await getApiBaseUrl();
      const response = await axios.post(`${apiUrl}/api/id-cards/generate`, data);

      if (!response.data || !response.data.idCards || response.data.idCards.length === 0) {
        throw new Error("No ID cards returned from API");
      }

      setGeneratedCards(response.data.idCards);
      Toast.show({ type: "success", text1: "ID Cards Generated", text2: `Created ${response.data.idCards.length} ID cards` });
    } catch (error) {
      Toast.show({ type: "error", text1: "ID Generation Failed", text2: error.message });
    } finally {
      setLoading(false);
    }
  };

  const renderCard = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{item.Name}</Text>
      </View>
      <View style={styles.cardBody}>
        <Image
          source={{ uri: item.photoUrl || "https://via.placeholder.com/100" }}
          style={styles.cardImage}
        />
        <View style={styles.cardDetails}>
          <Text style={styles.cardDetailItem}>
            <Text style={styles.cardDetailLabel}>Department: </Text>
            {item.Department}
          </Text>
          <Text style={styles.cardDetailItem}>
            <Text style={styles.cardDetailLabel}>Year: </Text>
            {item.Year}
          </Text>
          <Text style={styles.cardDetailItem}>
            <Text style={styles.cardDetailLabel}>Contact: </Text>
            {item.ContactNo}
          </Text>
          <Text style={styles.cardDetailItem}>
            <Text style={styles.cardDetailLabel}>Event: </Text>
            {item.EventName}
          </Text>
          <Text style={styles.cardDetailItem}>
            <Text style={styles.cardDetailLabel}>Date: </Text>
            {item.HeldNo}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>ID Card Generator</Text>
            <Text style={styles.subtitle}>Upload Excel file to create ID cards</Text>
          </View>
          
          <View style={styles.uploadSection}>
            <View style={styles.fileInfoContainer}>
              <Ionicons name="document-outline" size={24} color="#666" />
              <Text style={styles.fileInfo} numberOfLines={1} ellipsizeMode="middle">
                {fileName || "No file selected"}
              </Text>
            </View>
            
            <View style={styles.buttonRow}>
              <TouchableOpacity 
                style={[styles.button, styles.selectButton]} 
                onPress={handleFileSelection}
              >
                <Ionicons name="cloud-upload-outline" size={20} color="white" />
                <Text style={styles.buttonText}>Select File</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.button, styles.generateButton, !excelFile && styles.disabledButton]} 
                onPress={handleFileRead} 
                disabled={loading || !excelFile}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Ionicons name="create-outline" size={20} color="white" />
                    <Text style={styles.buttonText}>Generate Cards</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
          
        </View>
      </ScrollView>
      <Toast />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { 
    flex: 1, 
    backgroundColor: "#f8f9fa" 
  },
  scrollContainer: {
    flexGrow: 1,
  },
  container: { 
    flex: 1, 
    padding: 16,
  },
  header: {
    marginBottom: 24,
    alignItems: "center",
  },
  title: { 
    fontSize: 24, 
    fontWeight: "bold", 
    color: "#333",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginTop: 4,
  },
  uploadSection: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 24,
  },
  fileInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#f1f3f5",
    borderRadius: 8,
    marginBottom: 16,
  },
  fileInfo: {
    marginLeft: 8,
    fontSize: 14,
    color: "#333",
    flex: 1,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 8,
    flex: 1,
  },
  selectButton: {
    backgroundColor: "#5c7cfa",
    marginRight: 8,
  },
  generateButton: {
    backgroundColor: "#20c997",
    marginLeft: 8,
  },
  disabledButton: {
    backgroundColor: "#adb5bd",
  },
  buttonText: { 
    color: "white", 
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 8,
  },
  cardsContainer: {
    flex: 1,
  },
  resultHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  resultCount: {
    fontSize: 14,
    color: "#666",
    backgroundColor: "#e9ecef",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  cardsList: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: "hidden",
  },
  cardHeader: {
    backgroundColor: "#4263eb",
    padding: 12,
  },
  cardTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  cardBody: {
    padding: 16,
    flexDirection: "row",
  },
  cardImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: "#e9ecef",
  },
  cardDetails: {
    flex: 1,
    marginLeft: 16,
  },
  cardDetailItem: {
    fontSize: 14,
    marginBottom: 6,
    color: "#495057",
  },
  cardDetailLabel: {
    fontWeight: "bold",
    color: "#343a40",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyStateText: {
    marginTop: 16,
    fontSize: 16,
    color: "#adb5bd",
    textAlign: "center",
  },
});

export default IDCardUpload;