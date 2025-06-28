import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Image,
  RefreshControl,
} from "react-native";
import * as XLSX from "xlsx";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import Toast from "react-native-toast-message";
import { getApiBaseUrl } from "../config";
import { Ionicons } from "@expo/vector-icons"; // Assuming you're using Expo

const ParticipationDetails = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filterEvent, setFilterEvent] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("");
  const fetchParticipationData = async () => {
    try {
      setLoading(true);
      const baseUrl = await getApiBaseUrl();
      const response = await fetch(`${baseUrl}/api/participation`);
      const data = await response.json();
      
      console.log("Fetched Data:", data); // Debugging output
      
      setStudents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching participation data:", error);
      Toast.show({ 
        type: "error", 
        text1: "Error Loading Data",
        text2: "Please check your connection and try again."
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchParticipationData();
  };

  const handleFileUpload = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
  
      if (res.canceled || !res.assets || !res.assets.length) {
        Toast.show({ type: "info", text1: "No File Selected", text2: "Please select a file to upload." });
        return;
      }
  
      const fileUri = res.assets[0].uri;
      if (!fileUri) throw new Error("Invalid file URI");
  
      setLoading(true);
      
      const fileContent = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
  
      const workbook = XLSX.read(fileContent, { type: "base64" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  
      if (!rawData || rawData.length < 2) {
        throw new Error("Invalid file format or empty data");
      }
  
      const parsedData = rawData.slice(1).map((row) => ({
        name: row[0] || "",
        department: row[1] || "",
        year: row[2] || "",
        contactNumber: row[3] || "",
        eventName: row[4] || "",
        date: row[5] ? XLSX.SSF.format("yyyy-mm-dd", row[5]) : "",
        team_name: row[6] || "",
      }));
  
      // Save data to the backend
      const baseUrl = await getApiBaseUrl();
      const response = await fetch(`${baseUrl}/api/participation/save-participation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsedData),
      });
  
      if (!response.ok) {
        throw new Error("Failed to save data");
      }
  
      // Automatically refresh after saving
      await fetchParticipationData();
  
      Toast.show({ 
        type: "success", 
        text1: "Data Uploaded Successfully", 
        text2: `Added ${parsedData.length} participation records.` 
      });
    } catch (error) {
      console.error("Error uploading file:", error);
      Toast.show({ 
        type: "error", 
        text1: "Upload Failed", 
        text2: error.message || "Error processing the file." 
      });
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchParticipationData();
  }, []);

  const exportToExcel = async () => {
    try {
      if (students.length === 0) {
        Toast.show({ type: "info", text1: "No data", text2: "No participation records to export." });
        return;
      }
      
      setLoading(true);
      const cleanedData = students.map(({ _id, __v, ...rest }) => rest);
      const worksheet = XLSX.utils.json_to_sheet(cleanedData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Participation Data");

      const fileUri = FileSystem.cacheDirectory + "ParticipationData.xlsx";
      const excelFile = XLSX.write(workbook, { type: "base64" });
      await FileSystem.writeAsStringAsync(fileUri, excelFile, { encoding: FileSystem.EncodingType.Base64 });
      
      setLoading(false);
      await Sharing.shareAsync(fileUri);
      
      Toast.show({ 
        type: "success", 
        text1: "Excel Exported", 
        text2: "Your data has been exported successfully." 
      });
    } catch (error) {
      console.error("Error exporting Excel:", error);
      Toast.show({ 
        type: "error", 
        text1: "Export Failed", 
        text2: "Could not generate the Excel file." 
      });
      setLoading(false);
    }
  };

  const exportColumnNames = async () => {
    try {
      if (students.length === 0) {
        Toast.show({ type: "info", text1: "No data", text2: "No columns available to export." });
        return;
      }
      
      setLoading(true);
      const columnNames = Object.keys(students[0]).filter((key) => key !== "_id" && key !== "__v");
      const worksheet = XLSX.utils.aoa_to_sheet([columnNames]);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Column Names");

      const fileUri = FileSystem.cacheDirectory + "ColumnNames.xlsx";
      const excelFile = XLSX.write(workbook, { type: "base64" });
      await FileSystem.writeAsStringAsync(fileUri, excelFile, { encoding: FileSystem.EncodingType.Base64 });
      
      setLoading(false);
      await Sharing.shareAsync(fileUri);
      
      Toast.show({ 
        type: "success", 
        text1: "Column Names Exported", 
        text2: "Template file has been created successfully." 
      });
    } catch (error) {
      console.error("Error exporting column names:", error);
      Toast.show({ 
        type: "error", 
        text1: "Export Failed", 
        text2: "Could not generate the template file." 
      });
      setLoading(false);
    }
  };

  const filteredStudents = students.filter((student) => {
    const matchesSearch = student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          student.eventName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesEvent = !filterEvent || student.eventName?.toLowerCase().includes(filterEvent.toLowerCase());
    const matchesDepartment = !filterDepartment || student.department?.toLowerCase().includes(filterDepartment.toLowerCase());
    
    return matchesSearch && matchesEvent && matchesDepartment;
  });

  const renderStudentCard = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.nameText}>{item.name}</Text>
        <View style={styles.eventBadge}>
          <Text style={styles.eventBadgeText}>{item.eventName}</Text>
        </View>
      </View>
      
      <View style={styles.cardContent}>
        <View style={styles.infoRow}>
          <Ionicons name="school-outline" size={16} color="#555" />
          <Text style={styles.cardLabelText}>Dept:</Text>
          <Text style={styles.cardValueText}>{item.department}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={16} color="#555" />
          <Text style={styles.cardLabelText}>Year:</Text>
          <Text style={styles.cardValueText}>{item.year}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Ionicons name="call-outline" size={16} color="#555" />
          <Text style={styles.cardLabelText}>Contact:</Text>
          <Text style={styles.cardValueText}>{item.contactNumber}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Ionicons name="time-outline" size={16} color="#555" />
          <Text style={styles.cardLabelText}>Date:</Text>
          <Text style={styles.cardValueText}>{item.date ? item.date.split("T")[0] : 'N/A'}</Text>
        </View>
        
        {item.team_name && (
          <View style={styles.infoRow}>
            <Ionicons name="people-outline" size={16} color="#555" />
            <Text style={styles.cardLabelText}>Team:</Text>
            <Text style={styles.cardValueText}>{item.team_name}</Text>
          </View>
        )}
      </View>
    </View>
  );

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="document-text-outline" size={70} color="#DDD" />
      <Text style={styles.emptyText}>No participation records found</Text>
      <Text style={styles.emptySubText}>
        {searchTerm || filterEvent || filterDepartment 
          ? "Try adjusting your search or filters" 
          : "Upload a file to add records"}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#f8f9fa" barStyle="dark-content" />
      <Toast position="bottom" bottomOffset={20} />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Participation Records</Text>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Ionicons name={showFilters ? "options" : "options-outline"} size={22} color="#5B6DCD" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          placeholder="Search by name or event..."
          value={searchTerm}
          onChangeText={setSearchTerm}
          style={styles.input}
          placeholderTextColor="#999"
          clearButtonMode="while-editing"
        />
      </View>

      {showFilters && (
        <View style={styles.filtersContainer}>
          <View style={styles.filterInputContainer}>
            <Text style={styles.filterLabel}>Event</Text>
            <TextInput
              placeholder="Filter by event"
              value={filterEvent}
              onChangeText={setFilterEvent}
              style={styles.filterInput}
              placeholderTextColor="#999"
            />
          </View>
          
          <View style={styles.filterInputContainer}>
            <Text style={styles.filterLabel}>Department</Text>
            <TextInput
              placeholder="Filter by department"
              value={filterDepartment}
              onChangeText={setFilterDepartment}
              style={styles.filterInput}
              placeholderTextColor="#999"
            />
          </View>
        </View>
      )}

      <View style={styles.actionContainer}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.uploadButton]} 
          onPress={handleFileUpload}
        >
          <Ionicons name="cloud-upload-outline" size={18} color="#FFF" />
          <Text style={styles.buttonText}>Upload Data</Text>
        </TouchableOpacity>
        
        <View style={styles.exportButtonsRow}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.exportDataButton]} 
            onPress={exportToExcel}
          >
            <Ionicons name="download-outline" size={18} color="#FFF" />
            <Text style={styles.buttonText}>Export Data</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.exportTemplateButton]} 
            onPress={exportColumnNames}
          >
            <Ionicons name="document-outline" size={18} color="#FFF" />
            <Text style={styles.buttonText}>Get Template</Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading && !refreshing ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#5B6DCD" />
          <Text style={styles.loaderText}>Loading records...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredStudents}
          keyExtractor={(item, index) => item._id || index.toString()}
          renderItem={renderStudentCard}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#5B6DCD"]}
              tintColor="#5B6DCD"
            />
          }
          ListEmptyComponent={renderEmptyList}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  filterButton: {
    padding: 8,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: { 
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: "#333",
  },
  filtersContainer: {
    backgroundColor: "#FFF",
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  filterInputContainer: {
    marginBottom: 8,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
    marginBottom: 4,
  },
  filterInput: {
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
  },
  actionContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  uploadButton: {
    backgroundColor: "#5B6DCD",
    marginBottom: 12,
  },
  exportButtonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  exportDataButton: {
    backgroundColor: "#3CB371",
    flex: 1,
    marginRight: 6,
  },
  exportTemplateButton: {
    backgroundColor: "#4A90E2",
    flex: 1,
    marginLeft: 6,
  },
  buttonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f5f7ff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  nameText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
  },
  eventBadge: {
    backgroundColor: "#5B6DCD",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  eventBadgeText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "500",
  },
  cardContent: {
    padding: 16,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  cardLabelText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#555",
    marginLeft: 6,
    width: 60,
  },
  cardValueText: {
    fontSize: 14,
    color: "#333",
    flex: 1,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loaderText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#555",
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    color: "#888",
    marginTop: 8,
    textAlign: "center",
  },
});

export default ParticipationDetails;