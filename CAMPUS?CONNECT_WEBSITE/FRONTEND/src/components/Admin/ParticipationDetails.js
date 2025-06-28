import React, { useEffect, useState } from 'react';
import axios from 'axios'; // Import Axios for API calls
import ParticipationTable from './ParticipationTable';

const ParticipationDetails = () => {
  const [students, setStudents] = useState([]); // State to store participation records
  const [loading, setLoading] = useState(true); // State to handle loading

  useEffect(() => {
    // Fetch participation data from the backend
    const fetchParticipationData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/participation');
        setStudents(response.data); // Update students state with the data from the backend
      } catch (error) {
        console.error('Error fetching participation data:', error.message);
      } finally {
        setLoading(false); // Stop loading after data fetch
      }
    };

    fetchParticipationData();
  }, []); // Fetch data once when the component mounts

  // Function to save data to the database
  const saveDataToDatabase = async (data) => {
    try {
      const response = await fetch('http://localhost:5000/participation/save-participation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to save data');
      }

      const responseData = await response.json();
      console.log('Data saved successfully:', responseData);
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <ParticipationTable students={students} saveDataToDatabase={saveDataToDatabase} />
    </div>
  );
};

export default ParticipationDetails;
