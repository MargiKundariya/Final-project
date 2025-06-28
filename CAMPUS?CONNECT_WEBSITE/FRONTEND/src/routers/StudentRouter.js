import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Home from '../components/Student/Home';
import EventModal from '../components/Student/EventModal';
import DashboardContainer from '../components/Student/DashboardContainer';
import MainProfile from '../components/Student/MainProfile';
import RegisterForEvent from '../components/Student/RegisterForEvent';
import ScannerModal from '../components/Student/ScannerModal';
import SNavbar from '../components/Student/SNavbar';
import IDCardDisplay from '../components/Student/IDCardDisplay';
import StudentCertificates from '../components/Student/StudentCertificates';
import RegisterForTeam from '../components/Student/RegisterForTeam';
import RegisterForBoth from '../components/Student/RegisterForBoth';
import Notifications from '../components/Student/Notifications';
import { ToastContainer } from 'react-toastify'; // Import ToastContainer
import 'react-toastify/dist/ReactToastify.css'; // Import Toastify CSS
import Footer from '../components/Footer'; // Import the Footer component

function StudentRouter() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <div>
        <SNavbar />
      </div>
      <div style={{ flex: 1, padding: '20px' }}>
        <Routes>
          <Route path="home" element={<Home />} />
          <Route path="dashboardcontainer" element={<DashboardContainer />} />
          <Route path="eventmodal" element={<EventModal />} />
          <Route path="profile" element={<MainProfile />} />
          <Route path="registerforevent" element={<RegisterForEvent />} />
          <Route path="registerforteam" element={<RegisterForTeam />} />
          <Route path="registerforboth" element={<RegisterForBoth />} />
          <Route path="scannerModal" element={<ScannerModal />} />
          <Route path="certificate" element={<StudentCertificates />} />
          <Route path="idcard" element={<IDCardDisplay />} />
          <Route path="notifications" element={<Notifications />} />
        </Routes>
        {/* <ToastContainer /> */}
      </div>
      {/* Add Footer component here */}
      <Footer />
    </div>
  );
}

export default StudentRouter;
