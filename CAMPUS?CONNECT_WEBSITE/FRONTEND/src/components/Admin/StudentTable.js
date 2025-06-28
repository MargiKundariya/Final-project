import React, { useState } from 'react';
import '../../assets/css/student.css';

const StudentTable = ({ students }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredStudents = students.filter((student) =>
    student.id.toString().includes(searchTerm) ||
    student.division.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.mobileNumber.includes(searchTerm)
  );

  return (
    <div id="student-table-container">
      <h2 id="table-title">Student Details</h2>
      {/* <input
        type="text"
        id="student-search"
        placeholder="Search by ID, Name, Division, or Phone Number..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      /> */}
      <div className='search-container'>
      <input
            type="text"
            className="search-input"
            placeholder="Search by Name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="search-button">Search</button>
      </div>
      {filteredStudents.length === 0 ? (
        <div id="no-students-message">No students found</div>
      ) : (
        <table id="student-details-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Division</th>
              <th>Full Name</th>
              <th>Gender</th>
              <th>Phone Number</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map((student) => (
              <tr key={student.id} className="student-row">
                <td>{student.id}</td>
                <td>{student.division}</td>
                <td>{student.name}</td>
                <td>{student.gender}</td>
                <td>{student.mobileNumber}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default StudentTable;