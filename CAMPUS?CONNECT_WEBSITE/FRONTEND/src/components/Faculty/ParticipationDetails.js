import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ParticipationTable from './ParticipationTable';

const ParticipationDetails = () => {
  const [students, setStudents] = useState([]); // Filtered participation records
  const [loading, setLoading] = useState(true);
  const [noData, setNoData] = useState(false);
  const [faculty, setFaculty] = useState(null); // Judge details
  const [message, setMessage] = useState(''); // State to store messages

  useEffect(() => {
    const fetchParticipationData = async () => {
      try {
        console.log("🌐 Fetching participation data...");
  
        const response = await axios.get('http://localhost:5000/api/coordinator', {
          withCredentials: true, // ✅ Required to send session cookies
        });
  
        if (!response.data || !Array.isArray(response.data)) {
          console.error("⚠️ Unexpected response format:", response.data);
          setStudents([]);
          return;
        }
  
        console.log("📢 Received Participation Data:", response.data);
        setStudents(response.data);
      } catch (error) {
        console.error("❌ Error fetching participation data:", error.message);
        setStudents([]); // Ensure students is always an array
      } finally {
        setLoading(false);
      }
    };
  
    fetchParticipationData();
  }, []);
  

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {message && <div>{message}</div>}
      {noData ? (
        <div>No participation records available for your assigned events.</div>
      ) : (
        <ParticipationTable students={students} />
      )}
    </div>
  );
};

export default ParticipationDetails;
