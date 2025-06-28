import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from "react-native";
import { BarChart, Grid } from "react-native-svg-charts";
import { getApiBaseUrl } from "../config"; // Adjust path if needed

const ReportComponent = () => {
  const [reports, setReports] = useState({
    monthWiseData: [],
    eventWiseData: [],
    departmentWiseData: [],
    yearWiseData: [],
    topPerformers: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const baseUrl = await getApiBaseUrl();

        const endpoints = [
          "/api/reports/monthly",
          "/api/reports/events",
          "/api/reports/department-wise",
          "/api/reports/year-wise",
          "/api/reports/top-performers",
        ];

        const requests = endpoints.map(endpoint =>
          fetch(`${baseUrl}${endpoint}`).then(res => res.json().catch(() => null))
        );

        const [monthData, eventData, departmentData, yearData, topPerformersData] = await Promise.all(requests);

        setReports({
          monthWiseData: monthData?.monthlyReport || [],
          eventWiseData: eventData?.eventReport || [],
          departmentWiseData: departmentData?.departmentReport || [],
          yearWiseData: yearData?.yearReport || [],
          topPerformers: topPerformersData?.topPerformers || [],
        });

        setLoading(false);
      } catch (error) {
        console.error("Error fetching reports:", error);
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" color="#3182ce" style={styles.loader} />;
  }

  const sections = [
    { title: "Month-wise Report", type: "month" },
    { title: "Event-wise Report", type: "event" },
    { title: "Department-wise Report", type: "department" },
    { title: "Year-wise Report", type: "year" },
    { title: "Top Performers", type: "top" },
  ];

  return (
    <FlatList
      data={sections}
      keyExtractor={(item) => item.type}
      renderItem={({ item }) => (
        <View style={styles.section}>
          <Text style={styles.subHeader}>{item.title}</Text>
          {item.type === "month" && (
            <BarChart
              style={{ height: 200 }}
              data={reports.monthWiseData.map((entry) => entry.eventCount)}
              svg={{ fill: "#3182ce" }}
              contentInset={{ top: 10, bottom: 10 }}
            >
              <Grid />
            </BarChart>
          )}

          {item.type === "event" && (
            <FlatList
              data={reports.eventWiseData}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <View style={styles.listItem}>
                  <Text style={styles.listText}>📅 {new Date(item.date).toDateString()}</Text>
                  <Text style={styles.listText}>🏆 {item.name} - {item.participants} Participants</Text>
                </View>
              )}
              nestedScrollEnabled
            />
          )}

          {item.type === "department" && (
            <FlatList
              data={reports.departmentWiseData}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <View style={styles.listItem}>
                  <Text style={styles.listText}>🏛 {item._id} - {item.totalParticipants} Participants</Text>
                </View>
              )}
              nestedScrollEnabled
            />
          )}

          {item.type === "year" && (
            <FlatList
              data={reports.yearWiseData}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <View style={styles.listItem}>
                  <Text style={styles.listText}>📅 {item._id} - {item.totalParticipants} Participants</Text>
                </View>
              )}
              nestedScrollEnabled
            />
          )}

          {item.type === "top" && (
            <FlatList
              data={reports.topPerformers}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <View style={styles.listItem}>
                  <Text style={styles.listText}>🏅 {item.name} - {item.marks} Marks</Text>
                </View>
              )}
              nestedScrollEnabled
            />
          )}
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 15,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  section: {
    backgroundColor: "#ffffff",
    padding: 15,
    marginBottom: 15,
    borderRadius: 10,
    elevation: 3,
  },
  subHeader: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  listItem: {
    backgroundColor: "#e3f2fd",
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
  },
  listText: {
    fontSize: 16,
    color: "#1565c0",
  },
});

export default ReportComponent;
