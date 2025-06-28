import React, { useState, useEffect, useCallback, useMemo } from "react";
import { 
  View, 
  Text, 
  FlatList, 
  ActivityIndicator, 
  TouchableOpacity, 
  StyleSheet,
  TextInput
} from "react-native";
import axios from "axios";
import { getApiBaseUrl } from "../config";
import XLSX from "xlsx";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import Toast from "react-native-toast-message";
import { MaterialIcons } from '@expo/vector-icons';

const WinnersTable = () => {
  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all', 'event', 'rank'

  const fetchWinners = useCallback(async () => {
    try {
      setLoading(true);
      const baseUrl = await getApiBaseUrl();
      const response = await axios.get(`${baseUrl}/api/Winner`, {
        withCredentials: true,
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (Array.isArray(response.data)) {
        // Sort winners by rank (assuming 1st, 2nd, 3rd are better)
        const sortedWinners = [...response.data].sort((a, b) => {
          // First sort by rank (numerically if possible)
          const rankA = parseInt(a.rank) || 999;
          const rankB = parseInt(b.rank) || 999;
          
          if (rankA !== rankB) return rankA - rankB;
          
          // Then sort by date (most recent first)
          return new Date(b.date) - new Date(a.date);
        });
        
        setWinners(sortedWinners);
      } else {
        console.warn("API did not return an array for winners data");
        setWinners([]);
      }
    } catch (error) {
      console.error("❌ Error fetching winners:", error.message);
      Toast.show({
        type: "error",
        text1: "Data Loading Failed",
        text2: "Could not retrieve winners data. Please try again later."
      });
      setWinners([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchWinners();
  }, [fetchWinners]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchWinners();
  }, [fetchWinners]);

  // Filter winners based on search term and filter type
  const filteredWinners = useMemo(() => {
    if (!searchTerm.trim()) return winners;

    const term = searchTerm.toLowerCase();
    return winners.filter(winner => {
      switch (filterType) {
        case 'event':
          return winner.eventName?.toLowerCase().includes(term);
        case 'rank':
          return winner.rank?.toLowerCase().includes(term);
        case 'name':
          return winner.name?.toLowerCase().includes(term);
        default:
          return (
            winner.name?.toLowerCase().includes(term) ||
            winner.eventName?.toLowerCase().includes(term) ||
            winner.rank?.toLowerCase().includes(term)
          );
      }
    });
  }, [winners, searchTerm, filterType]);

  // Get rank color based on the rank value
  const getRankColor = (rank) => {
    const rankLower = String(rank).toLowerCase();
    if (rankLower.includes('1') || rankLower.includes('first') || rankLower === 'i') {
      return '#FFD700'; // Gold
    } else if (rankLower.includes('2') || rankLower.includes('second') || rankLower === 'ii') {
      return '#C0C0C0'; // Silver
    } else if (rankLower.includes('3') || rankLower.includes('third') || rankLower === 'iii') {
      return '#CD7F32'; // Bronze
    }
    return '#6B7280'; // Default gray
  };

  // Format date string to a more readable format
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const handleExportToExcel = async () => {
    if (winners.length === 0) {
      Toast.show({
        type: "info",
        text1: "No Data",
        text2: "There are no winners to export."
      });
      return;
    }

    try {
      // Prepare data with formatted dates for export
      const exportData = winners.map(winner => ({
        ...winner,
        date: formatDate(winner.date)
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Winners");

      const fileName = `Winners_List_${new Date().toISOString().split('T')[0]}.xlsx`;
      const fileUri = FileSystem.documentDirectory + fileName;
      const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "base64" });

      await FileSystem.writeAsStringAsync(fileUri, excelBuffer, { 
        encoding: FileSystem.EncodingType.Base64 
      });

      Toast.show({
        type: "success",
        text1: "Export Successful",
        text2: `Winners list exported as ${fileName}`
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      }
    } catch (error) {
      console.error("❌ Error exporting data:", error);
      Toast.show({
        type: "error",
        text1: "Export Failed",
        text2: "Could not export winners list. Please try again."
      });
    }
  };

  const FilterButton = ({ title, type, icon }) => (
    <TouchableOpacity
      style={[styles.filterButton, filterType === type && styles.activeFilterButton]}
      onPress={() => setFilterType(type)}
    >
      {icon && <MaterialIcons name={icon} size={14} color={filterType === type ? "#1e40af" : "#4b5563"} style={styles.filterIcon} />}
      <Text style={[styles.filterButtonText, filterType === type && styles.activeFilterButtonText]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3f51b5" />
        <Text style={styles.loadingText}>Loading winners data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🏆 Winners List</Text>
      
      {/* Stats Summary */}
      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>
          Total Winners: {winners.length}
        </Text>
      </View>
      
      {/* Search Bar */}
      <TextInput
        style={styles.searchInput}
        placeholder="🔍 Search winners..."
        placeholderTextColor="#888"
        value={searchTerm}
        onChangeText={setSearchTerm}
        clearButtonMode="while-editing"
      />
      
      {/* Filter Options */}
      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Filter by:</Text>
        <View style={styles.filterButtonsRow}>
          <FilterButton title="All" type="all" icon="filter-list" />
          <FilterButton title="Name" type="name" icon="person" />
          <FilterButton title="Event" type="event" icon="event" />
          <FilterButton title="Rank" type="rank" icon="emoji-events" />
        </View>
      </View>
      
      {/* Export Button */}
      <TouchableOpacity 
        style={styles.exportButton} 
        onPress={handleExportToExcel}
      >
        <MaterialIcons name="file-download" size={18} color="white" style={styles.buttonIcon} />
        <Text style={styles.buttonText}>Export to Excel</Text>
      </TouchableOpacity>

      <FlatList
        data={filteredWinners}
        keyExtractor={(item, index) => `${item._id || item.id || index}`}
        refreshing={refreshing}
        onRefresh={onRefresh}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={[styles.rankBadge, { backgroundColor: getRankColor(item.rank) }]}>
                <Text style={styles.rankText}>{item.rank}</Text>
              </View>
              <Text style={styles.name}>{item.name}</Text>
            </View>
            
            <View style={styles.cardContent}>
              <View style={styles.detailRow}>
                <MaterialIcons name="event" size={16} color="#3f51b5" />
                <Text style={styles.detailText}>Event: {item.eventName || 'N/A'}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <MaterialIcons name="calendar-today" size={16} color="#3f51b5" />
                <Text style={styles.detailText}>Date: {formatDate(item.date)}</Text>
              </View>
              
              {item.department && (
                <View style={styles.detailRow}>
                  <MaterialIcons name="business" size={16} color="#3f51b5" />
                  <Text style={styles.detailText}>Department: {item.department}</Text>
                </View>
              )}
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="emoji-events" size={50} color="#d1d5db" />
            <Text style={styles.noDataText}>
              {searchTerm ? 'No matching winners found' : 'No winners yet.'}
            </Text>
            {searchTerm && (
              <TouchableOpacity onPress={() => setSearchTerm('')}>
                <Text style={styles.clearSearch}>Clear Search</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />
      <Toast />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 16, 
    backgroundColor: "#f5f7fa" 
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f7fa"
  },
  loadingText: {
    marginTop: 10,
    color: "#666",
    fontSize: 16
  },
  title: { 
    fontSize: 22, 
    fontWeight: "bold", 
    textAlign: "center", 
    color: "#3f51b5",
    marginBottom: 12,
    marginTop: 10
  },
  statsContainer: {
    backgroundColor: '#e8eaf6',
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center'
  },
  statsText: {
    color: '#3f51b5',
    fontWeight: '600',
    fontSize: 14
  },
  searchInput: {
    height: 46,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: "#fff",
    fontSize: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  filterContainer: {
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 6,
    paddingLeft: 4
  },
  filterButtonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: "#f3f4f6",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  filterIcon: {
    marginRight: 4
  },
  activeFilterButton: {
    backgroundColor: "#e8eaf6",
    borderColor: "#c5cae9",
  },
  filterButtonText: {
    fontSize: 14,
    color: "#4b5563",
  },
  activeFilterButtonText: {
    color: "#3f51b5",
    fontWeight: "600",
  },
  exportButton: { 
    backgroundColor: "#3f51b5", 
    padding: 12, 
    borderRadius: 8, 
    alignItems: "center", 
    marginBottom: 15,
    flexDirection: "row",
    justifyContent: "center",
    elevation: 2
  },
  buttonIcon: {
    marginRight: 8
  },
  buttonText: { 
    color: "#fff", 
    fontSize: 16, 
    fontWeight: "bold" 
  },
  card: { 
    backgroundColor: "#fff", 
    padding: 16, 
    borderRadius: 12, 
    marginBottom: 12, 
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: "#3f51b5",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  rankBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  rankText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2
  },
  name: { 
    fontSize: 18, 
    fontWeight: "bold", 
    color: "#3f51b5",
    flex: 1
  },
  cardContent: {
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    padding: 10,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  detailText: {
    marginLeft: 8,
    fontSize: 15,
    color: "#4b5563",
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: 50,
    padding: 20,
  },
  noDataText: { 
    textAlign: "center", 
    fontSize: 16, 
    marginTop: 12,
    color: "#6b7280",
  },
  clearSearch: {
    color: "#3f51b5",
    textDecorationLine: "underline",
    marginTop: 8
  }
});

export default WinnersTable;