import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify'; // ✅ Import ToastContainer
import 'react-toastify/dist/ReactToastify.css'; // ✅ Import styles

import LoginRegister from './components/LoginRegister';
import AdminRouter from './routers/AdminRouter';
import FacultyRouter from './routers/FacultyRouter';
import StudentRouter from './routers/StudentRouter';
import JudgeRouter from './routers/JudgeRouter';
import ForgotPassword from './components/ForgotPassword';
import ChangePassword from './components/ChangePassword';

function App() {
  const [event, setEvent] = useState(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/events');
        const data = await response.json();
        setEvent(data);
      } catch (error) {
        console.error('Error fetching event:', error);
      }
    };

    fetchEvent();
  }, []);

  return (
    <Router>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />

      <Routes>
        <Route path="/" element={<LoginRegister />} />
        <Route path="/forgot" element={<ForgotPassword />} />
        <Route path="/change" element={<ChangePassword />} />
        <Route path="/admin/*" element={<AdminRouter />} />
        <Route path="/faculty/*" element={<FacultyRouter />} />
        <Route path="/student/*" element={<StudentRouter />} />
        <Route path="/judge/*" element={<JudgeRouter />} />
      </Routes>
    </Router>
  );
}

export default App;
