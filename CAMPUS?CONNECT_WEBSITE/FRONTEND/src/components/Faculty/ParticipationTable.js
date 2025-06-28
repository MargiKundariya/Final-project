import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import '../../assets/css/participation.css';
import "react-toastify/dist/ReactToastify.css";
import "../../assets/css/eventdetailstable.css";
import { toast } from 'react-toastify';

const ParticipationTable = ({ students, accessCode }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [studentData, setStudentData] = useState(students || []);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [eventList, setEventList] = useState([]);

  useEffect(() => {
    setStudentData(students);
    extractUniqueEvents();
  }, [students]);

  const extractUniqueEvents = () => {
    const uniqueEvents = [...new Set(students.map(student => student.eventName).filter(Boolean))];
    setEventList(uniqueEvents);
  };

  const filteredStudents = studentData.filter(student => 
    student.eventName?.toLowerCase().trim().includes(searchTerm.trim().toLowerCase()) &&
    (selectedEvent ? student.eventName === selectedEvent : true)
  );

  const showTeamColumns = filteredStudents.some(student => student.team_name && student.team_members?.length);

  const exportToExcel = () => {
    const dataToExport = filteredStudents.length > 0 ? filteredStudents : studentData;
    const cleanedData = dataToExport.map(({ _id, __v, ...rest }) => rest);
    const worksheet = XLSX.utils.json_to_sheet(cleanedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Participation Data');
    XLSX.writeFile(workbook, 'ParticipationData.xlsx');
    toast.success('Exported Participation Data successfully!');
  };

  const exportAttendees = () => {
    const attendees = filteredStudents.filter(student => student.attendance);
    const worksheet = XLSX.utils.json_to_sheet(attendees);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendees');
    XLSX.writeFile(workbook, 'Attendees.xlsx');
    toast.success('Exported Attendees successfully!');
  };

  const toggleAttendance = async (id, currentAttendance) => {
    try {
      const updatedAttendance = !currentAttendance;
      await axios.put(`http://localhost:5000/api/participation/${id}/attendance`, { attendance: updatedAttendance });
      setStudentData(prevStudents => prevStudents.map(student =>
        student._id === id ? { ...student, attendance: updatedAttendance } : student
      ));
      toast.success(`Attendance updated successfully!`);
    } catch (error) {
      console.error('Error toggling attendance:', error.message);
      toast.error('Error updating attendance. Please try again!');
    }
  };

  return (
    <div>
      <h2 className="table-title">Attendance Details</h2>
      <div className="controls-container" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
        <button className="export-button" onClick={exportToExcel}>Export Participant List</button>
        <button className="export-button" onClick={exportAttendees}>Export Attendees</button>
        <input
          type="text"
          className="search-input"
          placeholder="Search by Event Name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button className="search-button" onClick={() => setSearchTerm(searchTerm)}>Search</button>
      </div>
      <div className="dropdown-container" style={{ marginBottom: '10px' }}>
        <select className="event-dropdown" value={selectedEvent} onChange={(e) => setSelectedEvent(e.target.value)}>
          <option value="">All Events</option>
          {eventList.length > 0 ? eventList.map((event, index) => (
            <option key={index} value={event}>{event}</option>
          )) : <option disabled>No events available</option>}
        </select>
      </div>

      <table className="event-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Department</th>
            <th>Year</th>
            <th>Contact Number</th>
            <th>Event Name</th>
            <th>Held On</th>
            {showTeamColumns && <th>Team Name</th>}
            {showTeamColumns && <th>Team Members</th>}
            <th>Marks</th>
            <th>Attendance</th>
          </tr>
        </thead>
        <tbody>
          {filteredStudents.length > 0 ? (
            filteredStudents.map((student, index) => (
              <tr key={index}>
                <td>{student.name}</td>
                <td>{student.department}</td>
                <td>{student.year}</td>
                <td>{student.contactNumber}</td>
                <td>{student.eventName}</td>
                <td>{new Date(student.date).toISOString().split('T')[0]}</td>
                {showTeamColumns && <td>{student.team_name || '-'}</td>}
                {showTeamColumns && <td>{student.team_members?.filter(member => member.status === 'accepted').map(member => member.name).join(', ') || '-'}</td>}
                <td>{student.marks}</td>
                <td>
                  <input
                    type="checkbox"
                    checked={student.attendance}
                    onChange={() => toggleAttendance(student._id, student.attendance)}
                  />
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={showTeamColumns ? "10" : "8"}>No matching records found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ParticipationTable;
