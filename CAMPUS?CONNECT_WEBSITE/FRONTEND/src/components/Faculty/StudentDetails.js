import React, { useState, useEffect } from 'react';
import axios from 'axios';
import StudentTable from './StudentTable';
import { ToastContainer, toast } from 'react-toastify';  // Import ToastContainer and toast
import 'react-toastify/dist/ReactToastify.css';  // Import the CSS for toasts

const StudentDetails = () => {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    // Fetch students from the backend
    const fetchStudents = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/student/students');
        setStudents(response.data); // Set the fetched students
        toast.success('Student data fetched successfully!');  // Show success toast
      } catch (error) {
        console.error('Error fetching students:', error.message);
        toast.error('Failed to fetch student data.');  // Show error toast
      }
    };

    fetchStudents();
  }, []); // Empty dependency array ensures it runs only once on component mount

  return (
    <div>
      <StudentTable students={students} />
      {/* <ToastContainer /> Add ToastContainer to render toasts */}
    </div>
  );
};

export default StudentDetails;
