import React from 'react';
import '../../assets/css/student.css';

const StudentTable = ({ students }) => {
  return (
    <div>
      <h2 className="table-title">Student Details</h2>
      <table className="student-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Division</th>
            <th>Full name</th>
            <th>Gender</th>
            <th>Phone Number</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student, index) => (
            <tr key={index}>
              <td>{student.id}</td>
              <td>{student.division}</td>
              <td>{student.name}</td>
              <td>{student.gender}</td>
              <td>{student.mobileNumber}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StudentTable;
