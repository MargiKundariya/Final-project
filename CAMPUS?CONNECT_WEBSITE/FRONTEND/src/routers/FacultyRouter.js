import React from 'react';
import { Route, Routes } from 'react-router-dom';
import FacultyDashboard from '../components/Faculty/FacultyDashboard';
import AddEvent from '../components/Faculty/AddEvent'; // Import AddEvent component
import EditEvent from '../components/Faculty/EditEvent';
import EventDetails from '../components/Faculty/EventDetails';
import CertificateGeneration from '../components/Faculty/CertificateGeneration';
import FacultyProfile from '../components/Faculty/FacultyProfile';
import ParticipationDetails from '../components/Faculty/ParticipationDetails';

import Sidebar from '../components/Faculty/Sidebar';
import 'react-toastify/dist/ReactToastify.css'; // Import Toastify styles

function FacultyRouter() {
  return (
    <div style={{ display: 'flex'}}>
        <Sidebar />
      {/* Main content below the Navbar */}
      <div style={{ flex: 1, padding: '20px 40px 0px 290px' }}>
        <Routes>
          <Route path="dashboard" element={<FacultyDashboard />} />
          <Route path="add-event" element={<AddEvent />} /> {/* AddEvent route */}
          <Route path="/event-details/edit-event/:id" element={<EditEvent />} />
          <Route path="event-details" element={<EventDetails />} />
          <Route path="certificate-generation" element={<CertificateGeneration />} />
          <Route path='profile' element={<FacultyProfile />} />
          <Route path="participations-details" element={<ParticipationDetails />} />
          
          
        </Routes>
        {/* <ToastContainer/> */}
      </div>
    </div>
  );
}

export default FacultyRouter;
