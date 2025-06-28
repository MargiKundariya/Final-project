import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import Toast from "react-native-toast-message";
import axios from "axios";
import { getApiBaseUrl } from "../config";
import * as XLSX from "xlsx";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const CertificateGeneration = () => {
  const [recipientName, setRecipientName] = useState("");
  const [courseTitle, setCourseTitle] = useState("");
  const [date, setDate] = useState("");
  const [rank, setRank] = useState(1);
  const [isWinner, setIsWinner] = useState(true);
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState("");

  const handleFileUpload = async () => {
    try {
      setLoading(true);
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        copyToCacheDirectory: true,
      });

      if (!result.assets || result.assets.length === 0) {
        Toast.show({ 
          type: "error", 
          text1: "File Selection Failed", 
          text2: "No file selected." 
        });
        setLoading(false);
        return;
      }

      setFileName(result.assets[0].name || "spreadsheet.xlsx");
      const fileUri = result.assets[0].uri;

      const response = await fetch(fileUri);
      const blob = await response.blob();
      const reader = new FileReader();

      reader.onload = async (event) => {
        try {
          const arrayBuffer = event.target.result;
          const workbook = XLSX.read(arrayBuffer, { type: "array" });

          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(sheet);

          if (!jsonData || jsonData.length === 0) {
            Toast.show({ 
              type: "error", 
              text1: "Invalid File", 
              text2: "Empty or incorrectly formatted file." 
            });
            setLoading(false);
            return;
          }

          const formattedData = jsonData.map((row) => ({
            recipientName: row.name,
            courseTitle: row.eventName,
            date: new Date(row.date).toISOString().split("T")[0],
          }));

          const apiUrl = await getApiBaseUrl();
          const responseApi = await axios.post(`${apiUrl}/api/bulk`, formattedData, {
            headers: { "Content-Type": "application/json" },
          });

          if (responseApi.status === 201) {
            Toast.show({ 
              type: "success", 
              text1: "Certificates Generated", 
              text2: `Successfully created ${jsonData.length} certificates.` 
            });
          } else {
            throw new Error("Unexpected API response.");
          }
        } catch (error) {
          console.error("Excel Processing Error:", error);
          Toast.show({ 
            type: "error", 
            text1: "Error", 
            text2: "Failed to process Excel file." 
          });
        } finally {
          setLoading(false);
        }
      };

      reader.readAsArrayBuffer(blob);
    } catch (error) {
      console.error("Bulk Certificate Generation Error:", error);
      Toast.show({ 
        type: "error", 
        text1: "Error", 
        text2: "Failed to generate bulk certificates." 
      });
      setLoading(false);
    }
  };

  const handleGenerateCertificate = async () => {
    if (!recipientName || !courseTitle || !date) {
      Toast.show({ 
        type: "error", 
        text1: "Missing Information", 
        text2: "All fields are required!" 
      });
      return;
    }
    
    try {
      setLoading(true);
      const apiUrl = await getApiBaseUrl();
      const response = await axios.post(`${apiUrl}/api/certificate/create`, {
        recipientName,
        courseTitle,
        date,
        rank,
        type: isWinner ? "winner" : "participant",
      });

      if (response.status === 201) {
        Toast.show({ 
          type: "success", 
          text1: "Success!", 
          text2: "Certificate generated successfully 🎉" 
        });
        // Clear form after successful submission
        setRecipientName("");
        setCourseTitle("");
        setDate("");
      } else {
        Toast.show({ 
          type: "info", 
          text1: "Info", 
          text2: "Request submitted, waiting for confirmation." 
        });
      }
    } catch (error) {
      Toast.show({ 
        type: "error", 
        text1: "Error", 
        text2: "Failed to generate certificate." 
      });
    } finally {
      setLoading(false);
    }
  };

  const renderDateInput = () => {
    // Simple date input with placeholder formatting
    return (
      <View style={styles.dateInputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Date (YYYY-MM-DD)"
          value={date}
          onChangeText={setDate}
          keyboardType="numbers-and-punctuation"
        />
        <MaterialCommunityIcons 
          name="calendar" 
          size={24} 
          color="#1565c0" 
          style={styles.dateIcon} 
        />
      </View>
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <MaterialCommunityIcons name="certificate" size={32} color="#1565c0" />
        <Text style={styles.title}>Certificate Generator</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.segmentedControl}>
          <TouchableOpacity 
            style={[
              styles.segmentButton, 
              isWinner && styles.activeSegment
            ]} 
            onPress={() => setIsWinner(true)}
          >
            <MaterialCommunityIcons 
              name="trophy" 
              size={18} 
              color={isWinner ? "white" : "#1565c0"} 
            />
            <Text style={[
              styles.segmentText, 
              isWinner && styles.activeSegmentText
            ]}>
              Winner
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[
              styles.segmentButton, 
              !isWinner && styles.activeSegment
            ]} 
            onPress={() => setIsWinner(false)}
          >
            <MaterialCommunityIcons 
              name="account-group" 
              size={18} 
              color={!isWinner ? "white" : "#1565c0"} 
            />
            <Text style={[
              styles.segmentText, 
              !isWinner && styles.activeSegmentText
            ]}>
              Participants
            </Text>
          </TouchableOpacity>
        </View>

        {isWinner ? (
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <MaterialCommunityIcons name="account" size={22} color="#1565c0" style={styles.inputIcon} />
              <TextInput 
                style={styles.input} 
                placeholder="Recipient Name" 
                value={recipientName} 
                onChangeText={setRecipientName} 
              />
            </View>
            
            <View style={styles.inputContainer}>
              <MaterialCommunityIcons name="book-open-variant" size={22} color="#1565c0" style={styles.inputIcon} />
              <TextInput 
                style={styles.input} 
                placeholder="Course or Event Title" 
                value={courseTitle} 
                onChangeText={setCourseTitle} 
              />
            </View>
            
            {renderDateInput()}

            <Text style={styles.rankLabel}>Select Winner's Rank:</Text>
            <View style={styles.rankContainer}>
              {[1, 2, 3].map((r) => (
                <TouchableOpacity 
                  key={r} 
                  style={[
                    styles.rankButton, 
                    rank === r && styles.selectedRank
                  ]} 
                  onPress={() => setRank(r)}
                >
                  <Text style={[
                    styles.rankText, 
                    rank === r && styles.selectedRankText
                  ]}>
                    {r === 1 ? "🥇" : r === 2 ? "🥈" : "🥉"} {r}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity 
              style={styles.submitButton} 
              onPress={handleGenerateCertificate}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <>
                  <MaterialCommunityIcons name="certificate" size={20} color="white" style={styles.buttonIcon} />
                  <Text style={styles.submitText}>Generate Certificate</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.uploadContainer}>
            <Text style={styles.uploadInstructions}>
              Upload an Excel file with columns: name, eventName, and date
            </Text>
            
            {fileName ? (
              <View style={styles.fileInfoContainer}>
                <MaterialCommunityIcons name="file-excel" size={24} color="#1565c0" />
                <Text style={styles.fileName}>{fileName}</Text>
              </View>
            ) : null}
            
            <TouchableOpacity 
              style={styles.uploadButton} 
              onPress={handleFileUpload}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <>
                  <MaterialCommunityIcons name="file-upload" size={20} color="white" style={styles.buttonIcon} />
                  <Text style={styles.uploadButtonText}>
                    {fileName ? "Change File" : "Upload Excel File"}
                  </Text>
                </>
              )}
            </TouchableOpacity>
            
            {fileName ? (
              <TouchableOpacity 
                style={styles.processButton} 
                onPress={handleFileUpload}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <>
                    <MaterialCommunityIcons name="certificate-outline" size={20} color="white" style={styles.buttonIcon} />
                    <Text style={styles.uploadButtonText}>Process Certificates</Text>
                  </>
                )}
              </TouchableOpacity>
            ) : null}
          </View>
        )}
      </View>

      <Toast />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flexGrow: 1, 
    padding: 20, 
    backgroundColor: "#f0f7ff" 
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    justifyContent: "center"
  },
  title: { 
    fontSize: 24, 
    fontWeight: "bold", 
    color: "#1565c0", 
    marginLeft: 10
  },
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  segmentedControl: { 
    flexDirection: "row", 
    backgroundColor: "#e6f0ff",
    borderRadius: 8,
    marginBottom: 20,
    overflow: "hidden"
  },
  segmentButton: { 
    flex: 1, 
    flexDirection: "row",
    justifyContent: "center", 
    alignItems: "center",
    paddingVertical: 12,
  },
  activeSegment: { 
    backgroundColor: "#1565c0" 
  },
  segmentText: { 
    color: "#1565c0", 
    fontWeight: "600",
    marginLeft: 6
  },
  activeSegmentText: { 
    color: "white" 
  },
  form: { 
    width: "100%", 
    alignItems: "center", 
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
  },
  inputIcon: {
    padding: 10,
  },
  input: { 
    flex: 1,
    padding: 12,
    fontSize: 16,
  },
  dateInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
  },
  dateIcon: {
    padding: 10,
  },
  rankLabel: {
    alignSelf: "flex-start",
    marginBottom: 8,
    fontSize: 16,
    fontWeight: "500",
    color: "#333"
  },
  rankContainer: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    width: "100%",
    marginBottom: 20 
  },
  rankButton: { 
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderWidth: 1,
    borderColor: "#ddd"
  },
  selectedRank: { 
    backgroundColor: "#e3f2fd",
    borderColor: "#1565c0"
  },
  rankText: { 
    fontSize: 16, 
    fontWeight: "bold",
    color: "#666"
  },
  selectedRankText: { 
    color: "#1565c0" 
  },
  submitButton: { 
    flexDirection: "row",
    width: "100%", 
    backgroundColor: "#1565c0", 
    paddingVertical: 14, 
    borderRadius: 8, 
    alignItems: "center", 
    justifyContent: "center",
    marginTop: 10
  },
  buttonIcon: {
    marginRight: 8
  },
  submitText: { 
    color: "white", 
    fontSize: 16, 
    fontWeight: "bold" 
  },
  uploadContainer: { 
    width: "100%", 
    alignItems: "center", 
    paddingVertical: 15 
  },
  uploadInstructions: {
    textAlign: "center",
    marginBottom: 20,
    color: "#666",
    lineHeight: 20
  },
  fileInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e3f2fd",
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    width: "100%"
  },
  fileName: {
    marginLeft: 10,
    color: "#1565c0",
    fontWeight: "500"
  },
  uploadButton: { 
    flexDirection: "row",
    width: "100%", 
    backgroundColor: "#1565c0", 
    paddingVertical: 14, 
    borderRadius: 8, 
    alignItems: "center", 
    justifyContent: "center" 
  },
  processButton: {
    flexDirection: "row",
    width: "100%", 
    backgroundColor: "#4caf50", 
    paddingVertical: 14, 
    borderRadius: 8, 
    alignItems: "center", 
    justifyContent: "center",
    marginTop: 10
  },
  uploadButtonText: { 
    color: "white", 
    fontSize: 16, 
    fontWeight: "bold" 
  }
});

export default CertificateGeneration;