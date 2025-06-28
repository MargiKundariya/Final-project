import React, { useState, useEffect } from 'react';
import axios from 'axios';
import StudentTable from './StudentTable';

const StudentDetails = () => {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    // Fetch students from the backend
    const fetchStudents = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/student/students');
        setStudents(response.data); // Set the fetched students
      } catch (error) {
        console.error('Error fetching students:', error.message); // Log error in the console if needed
      }
    };

    fetchStudents();
  }, []); // Empty dependency array ensures it runs only once on component mount

  return (
    <div>
      <StudentTable students={students} />
    </div>
  );
};

export default StudentDetails;
