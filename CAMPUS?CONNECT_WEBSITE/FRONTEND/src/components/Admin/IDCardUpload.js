import React, { useState } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../../assets/css/idcard.css';
import EnhancedLoader from '../EnhancedLoader';

const IDCardUpload = () => {
  const [excelFile, setExcelFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  const [generatedCards, setGeneratedCards] = useState([]);
  const [loading, setLoading] = useState(false);

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setExcelFile(file);
      setFileName(file.name);
      setError('');
      toast.info('File selected successfully.', {
        position: toast.POSITION.TOP_RIGHT,
      });
    }
  };

  // Handle file read and parsing
  const handleFileRead = (e) => {
    if (!excelFile) {
      setError('No file selected.');
      toast.error('No file selected.', {
        position: toast.POSITION.TOP_RIGHT,
      });
      return;
    }

    setLoading(true);
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const arrayBuffer = evt.target.result;
        const wb = XLSX.read(arrayBuffer, { type: 'array' });

        if (!wb.SheetNames || wb.SheetNames.length === 0) {
          setError('No sheets found in the Excel file.');
          toast.error('No sheets found in the Excel file.');
          setLoading(false);
          return;
        }

        const sheetName = wb.SheetNames[0];
        const sheet = wb.Sheets[sheetName];
        const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        if (!rawData || rawData.length === 0) {
          setError('No data found in the first sheet.');
          toast.error('No data found in the first sheet.');
          setLoading(false);
          return;
        }

        const headers = rawData[0]; // First row should contain headers
        if (!headers || headers.length === 0) {
          setError('Headers are missing in the Excel sheet.');
          toast.error('Headers are missing in the Excel sheet.');
          setLoading(false);
          return;
        }

        const jsonData = rawData.slice(1).map((row) => {
          return headers.reduce((obj, header, index) => {
            obj[header] = row[index] || ''; 
            return obj;
          }, {});
        });

        if (jsonData.length > 0) {
          const cleanedData = jsonData.map((row) => ({
            Name: row.name ? row.name.trim() : 'Unknown',
            Department: row.department ? row.department.trim() : 'N/A',
            Year: row.year || 'N/A',
            ContactNo: row.contactNumber || 'N/A',
            EventName: row.eventName || 'N/A',
            HeldNo: row.date
              ? new Date(row.date).toISOString().split('T')[0]
              : 'N/A',
          }));

          sendDataToBackend(cleanedData);
        } else {
          setError('No valid data found in the Excel sheet.');
          toast.error('No valid data found in the Excel sheet.');
          setLoading(false);
        }
      } catch (err) {
        setError('Failed to read or parse the Excel file.');
        toast.error('Failed to read or parse the Excel file.');
        console.error('File reading error:', err);
        setLoading(false);
      }
    };

    reader.onerror = (err) => {
      setError('Error reading the file.');
      toast.error('Error reading the file.');
      console.error('FileReader error:', err);
      setLoading(false);
    };

    reader.readAsArrayBuffer(excelFile);
  };

  // Send the extracted data to the backend
  const sendDataToBackend = async (data) => {
    try {
      const response = await axios.post('http://localhost:5000/api/id-cards/generate', data);
      setGeneratedCards(response.data.idCards);
      toast.success('ID Cards generated successfully!');
    } catch (err) {
      setError('Failed to generate ID cards.');
      toast.error('Failed to generate ID cards.');
      console.error('Backend error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="idcard-upload-container">
      <h2 className="idcard-upload-title">Upload Excel to Generate ID Cards</h2>
      
      <div className="upload-form">
        <div className="file-input-container">
          <label 
            className={`file-input-label ${fileName ? 'has-file' : ''}`} 
            htmlFor="excel-file-input"
          >
            <span className="file-icon">📄</span>
            <span>{fileName || 'Choose an Excel file or drag it here'}</span>
          </label>
          <input
            id="excel-file-input"
            className="file-input"
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            disabled={loading}
          />
          {fileName && <div className="file-name">{fileName}</div>}
        </div>
        
        <button 
          className="generate-button" 
          onClick={handleFileRead} 
          disabled={!excelFile || loading}
        >
          {loading ? 'Processing...' : 'Generate ID Cards'}
        </button>
        
        {error && <div className="error-message">{error}</div>}
        
        {loading && (
          <EnhancedLoader/>
        )}
      </div>
      
      {generatedCards.length > 0 && (
        <div className="generated-cards-section">
          <h3 className="cards-title">Generated ID Cards</h3>
          <ul className="cards-list">
            {generatedCards.map((card, index) => (
              <li key={index} className="card-item">
                <p className="card-name">{card.name}</p>
                {card.department && (
                  <p className="card-details">Department: {card.department}</p>
                )}
                {card.year && (
                  <p className="card-details">Year: {card.year}</p>
                )}
                {card.eventName && (
                  <p className="card-details">Event: {card.eventName}</p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default IDCardUpload;