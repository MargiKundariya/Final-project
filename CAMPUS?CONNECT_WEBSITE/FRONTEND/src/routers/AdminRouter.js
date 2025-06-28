import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from '../components/Admin/Sidebar'; // Import your Sidebar component
import AdminDashboard from '../components/Admin/AdminDashboard';
import AddEvent from '../components/Admin/AddEvent'; // Import AddEvent component
import EditEvent from '../components/Admin/EditEvent';
import EventDetails from '../components/Admin/EventDetails';
import CertificateGeneration from '../components/Admin/CertificateGeneration';
import FacultyDetails from '../components/Admin/FacultyDetails';
import AddFaculty from '../components/Admin/AddFaculty';
import ParticipationDetails from '../components/Admin/ParticipationDetails';
import StudentDetails from '../components/Admin/StudentDetails';
import FacultyAdd from '../components/Admin/FacultyAdd';
import EditFaculty from '../components/Admin/EditFaculty';
import IDCardUpload from '../components/Admin/IDCardUpload';
import JudgeAdd from '../components/Admin/JudgeAdd';
import JudgeList from '../components/Admin/JudgeList';
import InvitationForm from '../components/Admin/InvitationForm';
import WinnersTable from '../components/Admin/WinnersTable';
import ReportComponent from '../components/Admin/ReportComponent';
import 'react-toastify/dist/ReactToastify.css'; // Import Toastify styles

function AdminRouter() {
  return (
    <div style={{ display: 'flex' }}>
      <Sidebar /> {/* Sidebar will appear on all admin pages */}
      <div style={{ flex: 1, padding: '20px 40px 0px 290px' }}>
        {/* This Outlet will render the specific components based on the route */}
        <Routes>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="add-event" element={<AddEvent />} /> {/* AddEvent route */}
          <Route path="/event-details/edit-event/:id" element={<EditEvent />} />
          <Route path="/editfaculty" element={<EditFaculty />} />
          <Route path="event-details" element={<EventDetails />} />
          <Route path="certificate-generation" element={<CertificateGeneration />} />
          <Route path="faculty-details" element={<FacultyDetails />} />
          <Route path="addfaculty" element={<AddFaculty />} />
          <Route path="participants-details" element={<ParticipationDetails />} />
          <Route path="student-details" element={<StudentDetails />} />
          <Route path="/addfaculty" element={<FacultyAdd />} />
          <Route path="idcard" element={<IDCardUpload />} />
          <Route path="judge" element={<JudgeAdd />} />
          <Route path="judgelist" element={<JudgeList />} />
          <Route path="invitation" element={<InvitationForm />} />
          <Route path="WinnersTable" element={<WinnersTable />} />
          <Route path="reports" element={<ReportComponent/>} />

        </Routes>
        {/* ToastContainer for global toast notifications */}
        {/* <ToastContainer /> */}
      </div>
    </div>
  );
}

export default AdminRouter;
