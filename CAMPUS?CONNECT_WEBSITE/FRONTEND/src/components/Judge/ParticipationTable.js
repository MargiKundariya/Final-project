import React, { useState, useEffect } from 'react';
import '../../assets/css/participation.css';
import axios from 'axios';

const ParticipationTable = ({ students }) => {
  const [studentData, setStudentData] = useState(students || []);
  const [criteriaData, setCriteriaData] = useState({});
  const [marks, setMarks] = useState({});
  const [isEditingDisabled, setIsEditingDisabled] = useState(false);
  const [assignedEvents, setAssignedEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');

  useEffect(() => {
    const fetchAssignedEvents = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/judges/assigned-events', { withCredentials: true });
        const events = response.data.events || [];
        setAssignedEvents(events);
        if (events.length > 0) {
          setSelectedEvent(events[0]);
        }
      } catch (error) {
        console.error("Error fetching assigned events:", error.message);
      }
    };

    fetchAssignedEvents();
  }, []);

  useEffect(() => {
    if (!students || students.length === 0) return;

    const fetchEventCriteria = async () => {
      const eventCriteria = {};
      const uniqueEventNames = [...new Set(students.map((student) => student.eventName))];

      for (const eventName of uniqueEventNames) {
        try {
          const response = await axios.get(`http://localhost:5000/api/events/${encodeURIComponent(eventName)}`);
          eventCriteria[eventName] = response.data.event?.criteria || [];
        } catch (error) {
          console.error(`Error fetching criteria for ${eventName}:`, error.message);
        }
      }

      setCriteriaData(eventCriteria);
    };

    fetchEventCriteria();
  }, [students]);

  const handleMarkChange = (studentId, eventName, criterionIndex, value) => {
    if (isEditingDisabled) return;
    const numericValue = Number(value) || 0;

    setMarks((prevMarks) => {
      const updatedMarks = { ...prevMarks };
      if (!updatedMarks[studentId]) updatedMarks[studentId] = {};
      updatedMarks[studentId][criterionIndex] = numericValue;

      const total = (criteriaData[eventName] || []).reduce((sum, _, idx) => sum + (updatedMarks[studentId][idx] || 0), 0);
      updatedMarks[studentId].total = total;

      return updatedMarks;
    });
  };

  const handleSaveMarks = async (studentId) => {
    const studentMarks = marks[studentId] || {};
    const totalMarks = studentMarks.total || 0;

    try {
      await axios.put(
        `http://localhost:5000/api/participation/${studentId}/marks`,
        { marks: totalMarks },
        { withCredentials: true }
      );

      setStudentData((prevData) =>
        prevData.map((student) =>
          student._id === studentId ? { ...student, marks: totalMarks } : student
        )
      );
    } catch (error) {
      console.error("Error saving marks:", error.message);
    }
  };

  const handleSubmitResult = async () => {
    setIsEditingDisabled(true);
    const sortedStudents = [...studentData].sort(
      (a, b) => (marks[b._id]?.total || b.marks || 0) - (marks[a._id]?.total || a.marks || 0)
    );

    let winners = [];
    let actualRank = 1;
    let previousMarks = null;

    sortedStudents.forEach((student) => {
      const totalMarks = marks[student._id]?.total || student.marks || 0;
      if (previousMarks !== null && totalMarks < previousMarks) actualRank++;
      previousMarks = totalMarks;
      
      if (actualRank <= 3) {
        winners.push({
          name: student.team_name || student.name,
          eventName: student.eventName,
          rank: actualRank,
          date: new Date(student.date).toISOString().split('T')[0],
        });
      }
    });

    try {
      await axios.post('http://localhost:5000/api/winners', winners, { withCredentials: true });
      alert('Winners saved successfully!');
    } catch (error) {
      console.error('Error saving winners:', error.message);
    }
  };
  const hasTeamMembers = studentData
  .filter(student => selectedEvent === '' || student.eventName === selectedEvent)
  .some(student => Array.isArray(student.team_members) && student.team_members.length > 0);

  return (
    <div>
      <h2 className="table-title">Participation Details</h2>
      <div className="filter-container">
        <label>Select Event:</label>
        <select value={selectedEvent} onChange={(e) => setSelectedEvent(e.target.value)}>
          {assignedEvents.map((event, index) => (
            <option key={index} value={event}>{event}</option>
          ))}
        </select>
      </div>
      <table className="event-table">
            <thead>
        <tr>
          <th>Name / Team Name</th>
          {hasTeamMembers && <th>Members</th>}
          <th>Department</th>
          <th>Year</th>
          <th>Contact</th>
          <th>Event</th>
          <th>Held On</th>
          {(selectedEvent && criteriaData[selectedEvent]) ? criteriaData[selectedEvent].map((criterion, index) => <th key={index}>{criterion}</th>) : []}
          <th>Total Marks</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
  {studentData.length > 0 ? (
    studentData
      .filter(student => selectedEvent === '' || student.eventName === selectedEvent)
      .map((student) => (
        <tr key={student._id}>
          <td>{student.team_name || student.name}</td>
          {hasTeamMembers && (
            <td>
              {[student.name, ...(student.team_members?.filter(member => member.status === 'accepted').map(member => member.name) || [])].join(", ")}
            </td>
          )}
          <td>{student.department}</td>
          <td>{student.year}</td>
          <td>{student.contactNumber}</td>
          <td>{student.eventName}</td>
          <td>{new Date(student.date).toISOString().split('T')[0]}</td>
          {(criteriaData[student.eventName] || []).map((_, index) => (
            <td key={index}>
              <input
                type="number"
                value={marks[student._id]?.[index] || ''}
                onChange={(e) => handleMarkChange(student._id, student.eventName, index, e.target.value)}
                disabled={isEditingDisabled}
              />
            </td>
          ))}
          <td><input type="number" value={marks[student._id]?.total || student.marks || 0} disabled /></td>
          <td>
            <button
              onClick={() => handleSaveMarks(student._id)}
              style={{ backgroundColor: 'blue', color: 'white', border: 'none' }}
              className="save-btn"
              disabled={isEditingDisabled}
            >
              Save Marks
            </button>
          </td>
        </tr>
      ))
  ) : (
    <tr><td colSpan="10">No students available</td></tr>
  )}
</tbody>

      </table>
      <div className="submit-container">
        <button onClick={handleSubmitResult} className="submit-btn">Submit Result</button>
      </div>
    </div>
  );
};

export default ParticipationTable;
