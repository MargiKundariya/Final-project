import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Import Axios for making HTTP requests
import FacultyDetailsTable from './FacultyDetailsTable';

const FacultyDetails = () => {
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch faculty data from the backend
  useEffect(() => {
    const fetchFacultyData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/faculty');
        
        // Filter only faculty members with role "Faculty"
        const filteredFaculty = response.data.filter(member => member.role === 'faculty');
        
        setFaculty(filteredFaculty);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching faculty data:', error);
        setLoading(false);
      }
    };

    fetchFacultyData();
  }, []);

  // Handle Delete: Removes a faculty member from the list
  const handleDelete = async (member) => {
    try {
      await axios.delete(`http://localhost:5000/api/faculty/${member._id}`);
      setFaculty((prevFaculty) =>
        prevFaculty.filter((facultyMember) => facultyMember._id !== member._id)
      );
    } catch (error) {
      console.error('Error deleting faculty member:', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <FacultyDetailsTable faculty={faculty} onDelete={handleDelete} />
    </div>
  );
};

export default FacultyDetails;
