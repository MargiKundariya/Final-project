import React, { useState,useEffect } from "react";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../assets/css/certificate.css";
import axios from "axios";

const CertificateGeneration = () => {
  const [recipientName, setRecipientName] = useState("");
  const [courseTitle, setCourseTitle] = useState("");
  const [date, setDate] = useState("");
  const [rank, setRank] = useState(1);
  const [showCertificate, setShowCertificate] = useState(false);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isWinner, setIsWinner] = useState(true);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [principalName] = useState("Dhruv Chaudhari");
  const [institutionName] = useState("All India School of Designing");
  const [winners, setWinners] = useState([]);
  const [winnerNames, setWinnerNames] = useState([]);
  
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://localhost:5000/api/coordinator", {
          withCredentials: true, // ✅ Ensure session access
        });
  
        console.log("Coordinator API Response:", response.data);
  
        if (Array.isArray(response.data)) {
          // ✅ Remove duplicate event names using Map
          const formattedEvents = Array.from(
            new Map(response.data.map(event => [event.eventName, { name: event.eventName, date: event.date }])).values()
          );
  
          setEvents(formattedEvents);
        } else {
          console.error("Invalid data format from coordinator API.");
        }
      } catch (error) {
        console.error("Error fetching coordinator events:", error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchEvents();
  }, []);
  const fetchWinners = async (eventName) => {
    try {
      const response = await axios.get("http://localhost:5000/api/winners");
      const allWinners = response.data || [];
  
      console.log("All Winners Response:", allWinners); // ✅ Add this
  
      const eventWinners = allWinners.filter(w => w.eventName === eventName);
  
      setWinners(eventWinners);
      setWinnerNames(eventWinners.map(w => w.name)); // Check if 'name' exists
    } catch (error) {
      console.error("Error fetching winners:", error);
      toast.error("Failed to fetch winners");
    }
  };
  
  
  
  
const handleSingleSubmit = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/certificate/create', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipientName,
          courseTitle,
          date,
          rank :Number(rank),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create certificate");
      }

      const data = await response.json();
      setShowCertificate(true);
      setCertificates([data]);

      toast.success("Certificate created successfully");
    } catch (error) {
      toast.error("Error creating certificate");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    
    if (!(file instanceof Blob)) {
      console.error("Selected file is not of type Blob");
      toast.error("Selected file is not valid");
      return;
    }
  
    const reader = new FileReader();
  
    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result);
  
      const workbook = XLSX.read(data, { type: "array" });
  
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
  
      const jsonData = XLSX.utils.sheet_to_json(sheet);
  
      const formattedData = jsonData.map((row) => ({
        recipientName: row.name,
        courseTitle: row.eventName,
        date: new Date(row.date).toLocaleDateString(),
      }));
  
      sendBulkData(formattedData);
    };
  
    reader.onerror = (error) => {
      console.error("Error reading file:", error);
      toast.error("Error reading file");
    };
  
    reader.readAsArrayBuffer(file);
  };
  
  const sendBulkData = async (data) => {
    setLoading(true);
  
    try {
      const response = await fetch('http://localhost:5000/api/bulk', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
  
      if (!response.ok) {
        throw new Error("Failed to upload certificates");
      }
  
      const responseData = await response.json();
      setCertificates(responseData);
  
      toast.success("Bulk certificates created successfully!");
    } catch (error) {
      console.error("Error uploading certificates:", error);
      toast.error("Error uploading certificates");
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (type) => {
    setIsWinner(type === 'winner');
  };

  return (
    <div className="certificate-page">
      <div className="certificate-card">
        <div className="card-header" id="card-header">
          <h2>Generate Certificate</h2>
          <p className="subtitle">Create certificates for winners and participants</p>
        </div>
        
        <div className="tabs">
          <button 
            className={`tab-button ${isWinner ? 'active' : ''}`} 
            onClick={() => handleToggle('winner')}
          >
            Winner Certificate
          </button>
          <button 
            className={`tab-button ${!isWinner ? 'active' : ''}`} 
            onClick={() => handleToggle('participant')}
          >
            Participant Certificate
          </button>
        </div>
        
        <div className="card-content">
          {isWinner ? (
            <div className="winner-form">
             <div className="form-group">
              <label htmlFor="courseTitle">Event Name</label>
              <select
                    id="courseTitle"
                    value={selectedEvent ? selectedEvent.name : ""}
                    onChange={(e) => {
                      const event = events.find(ev => ev.name === e.target.value);
                      setSelectedEvent(event);
                      setCourseTitle(event ? event.name : "");
                      setDate(event && event.date ? event.date.split("T")[0] : "");
                    
                      // ✅ Fetch winners for the selected event
                      if (event?.name) {
                        fetchWinners(event.name);
                      }
                    
                      // ✅ Reset recipient and rank when switching events
                      setRecipientName("");
                      setRank(1);
                    }}
                    
                  >
                    <option value="">Select an Event</option>
                    {Array.isArray(events) && events.length > 0 ? (
                      events.map((event) => (
                        <option key={event.id} value={event.name}>
                          {event.name}
                        </option>
                      ))
                    ) : (
                      <option disabled>No events available</option>
                    )}
                  </select>


              </div>
              <div className="form-group">
                <label htmlFor="recipientName">Recipient Name</label>
                {winnerNames.length > 0 ? (
                  <select
                    id="recipientName"
                    value={recipientName}
                    onChange={(e) => {
                      setRecipientName(e.target.value);

                      // Auto-fill rank based on selection
                      const selectedWinner = winners.find(w => w.name === e.target.value);
                      setRank(selectedWinner?.rank || 1);
                    }}
                  >
                    <option value="">Select Recipient</option>
                    {winnerNames.map((name, idx) => (
                      <option key={idx} value={name}>{name}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    id="recipientName"
                    type="text"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="Enter recipient's name"
                  />
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="date">Date</label>
                  <input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="rank">Rank</label>
                  <select 
                    id="rank"
                    value={rank} 
                    onChange={(e) => setRank(parseInt(e.target.value,10))}
                  >
                    <option value={1}>Rank 1</option>
                    <option value={2}>Rank 2</option>
                    <option value={3}>Rank 3</option>
                  </select>
                </div>
              </div>
              
              <button 
                className="submit-button" 
                onClick={handleSingleSubmit}
              >
                {loading ? "Generating..." : "Generate Certificate"}
              </button>
            </div>
          ) : (
            <div className="participant-form">
              <div className="file-upload-container">
                <div className="upload-instruction">
                  <i className="file-icon">📄</i>
                  <p>Upload Excel file with participant details</p>
                  <span className="file-format">(Format: .xlsx)</span>
                </div>
                
                <label htmlFor="fileUpload" className="file-upload-label">
                  Choose File
                  <input 
                    id="fileUpload"
                    type="file" 
                    accept=".xlsx" 
                    onChange={handleFileUpload}
                    className="file-input"
                  />
                </label>
              </div>
            </div>
          )}
        </div>
        
        {showCertificate && certificates.length > 0 && (
          <div className="certificate-preview">
            <h3>Generated Certificates</h3>
            <div className="certificates-list">
              {certificates.map((cert, index) => (
                <div key={index} className="certificate-item">
                  <p>Certificate for: {cert.recipientName}</p>
                  <p>Event: {cert.courseTitle}</p>
                  <button className="download-button">Download</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CertificateGeneration;