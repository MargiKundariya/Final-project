import React, { useState } from 'react';
import * as XLSX from 'xlsx'; // Import the xlsx library
import '../../assets/css/participation.css';

const ParticipationTable = ({ students = [], saveDataToDatabase }) => {
  const [searchTerm, setSearchTerm] = useState('');  
  const [studentData, setStudentData] = useState(students); // Maintain local state for students

  // Helper function to format dates
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; // Returns only the date in YYYY-MM-DD format
  };

  // Filter students based on the event name
  const filteredStudents = studentData.filter((student) => {
    const eventName = student.eventName ? String(student.eventName) : ''; // Ensure it's a string
    return eventName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Function to export data to Excel
  const exportToExcel = () => {
    const dataToExport = filteredStudents.length > 0 ? filteredStudents : studentData;

    // Remove unwanted columns (_id and __v) from the data
    const cleanedData = dataToExport.map((student) => {
      const { _id, __v, ...rest } = student;
      return rest;
    });

    // Create a worksheet and a workbook
    const worksheet = XLSX.utils.json_to_sheet(cleanedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Participation Data');

    // Generate and download the Excel file
    XLSX.writeFile(workbook, 'ParticipationData.xlsx');
  };

  // Function to export only column names to Excel
  const exportColumnNames = () => {
    if (studentData.length > 0) {
      const columnNames = Object.keys(studentData[0]).filter(
        (key) => key !== '_id' && key !== '__v' // Exclude _id and __v fields
      );

      const worksheet = XLSX.utils.aoa_to_sheet([columnNames]);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Column Names');

      XLSX.writeFile(workbook, 'ColumnNames.xlsx');
    }
  };

  // Function to handle file upload and send data to backend
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
  
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const binaryString = event.target.result;
        const workBook = XLSX.read(binaryString, { type: 'binary' });
        const sheetName = workBook.SheetNames[0];
        const workSheet = workBook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(workSheet, { header: 1 });
  
        // Assuming the CSV has headers and data starts from row 2
        const parsedData = data.slice(1).map((row) => {
          const excelDate = row[5]; // Assuming the date is in the 6th column
          const formattedDate =
            typeof excelDate === 'number'
              ? XLSX.SSF.format('yyyy-mm-dd', excelDate) // Convert Excel date to standard format
              : excelDate || ''; // If not a number, use the original value or set empty string
  
          return {
            name: row[0] || '', // If no data, set empty string
            department: row[1] || '', // If no data, set empty string
            year: row[2] || '', // If no data, set empty string
            contactNumber: row[3] || '', // If no data, set empty string
            eventName: row[4] || '',
            date: formattedDate, // Use formatted date
            team_name: row[6] || '', // If no data, set empty string
          };
        });
  
        // Update state with parsed data
        setStudentData(prevData => [...prevData, ...parsedData]);  
        // Send data to backend via POST request
        try {
          const response = await fetch('http://localhost:5000/api/participation/save-participation', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(parsedData), // Send the parsed data as JSON
          });
  
          if (response.ok) {
            console.log('Data successfully uploaded!');
          } else {
            console.error('Failed to upload data');
          }
        } catch (error) {
          console.error('Error uploading data:', error);
        }
      };
      reader.readAsBinaryString(file);
    }
  };
  
  return (
    <div>
      <br />
      <h2 className="table-title">Participation Details</h2>
      <div className="controls-container">
        <div className="export-container">
          <button className="export-button" onClick={exportToExcel}>
            Export Participant List
          </button>
          <button className="export-button" onClick={exportColumnNames}>
            Export CSV Format
          </button>
        </div>
        <div className="search-container">
          <input
            type="text"
            className="search-input"
            placeholder="Search by Event Name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="search-button">Search</button>
        </div>
      </div>
      <div class='choose-file'>
      <input
        type="file"
        accept=".xlsx, .xls"
        className="upload-input"
        onChange={handleFileUpload}
      />
      </div>
    
      {/* Table */}
      <table className="event-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Department</th>
            <th>Year</th>
            <th>Contact Number</th>
            <th>Event Name</th>
            <th>Held On</th>
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
                <td>{formatDate(student.date)}</td> {/* Format the date */}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6">No matching records found</td>
            </tr>
          )}
        </tbody>
      </table>
      
    </div>
  );
};

export default ParticipationTable;
