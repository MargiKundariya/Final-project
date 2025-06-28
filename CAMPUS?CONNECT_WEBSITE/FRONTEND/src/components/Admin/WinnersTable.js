import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import '../../assets/css/participation.css';

const WinnersTable = () => {
  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [events, setEvents] = useState([]); 
  const [selectedEvent, setSelectedEvent] = useState('');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/events/completed');
        console.log('API Response:', response.data);
  
        const eventList = Array.isArray(response.data.completedEvents)
          ? response.data.completedEvents.map(event => event.name)
          : [];
  
        setEvents(eventList);
  
        if (eventList.length > 0) {
          setSelectedEvent(eventList[0]);
        }
      } catch (error) {
        console.error('Error fetching events:', error);
        setEvents([]);
      }
    };
  
    fetchEvents();
  }, []);
  
  
  useEffect(() => {
    const fetchWinners = async () => {
      setLoading(true);
      try {
        const response = await axios.get('http://localhost:5000/api/winners');
        setWinners(response.data);
      } catch (error) {
        setError('Error fetching winners. Please try again.');
        console.error('Error fetching winners:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWinners();
  }, []);

  const filteredWinners = selectedEvent
    ? winners.filter(winner => winner.eventName === selectedEvent)
    : winners;

  const handleExportToExcel = () => {
    if (filteredWinners.length === 0) {
      alert('No winners data to export.');
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(filteredWinners);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Winners');

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(data, 'Winners_List.xlsx');
  };

  return (
    <div className="winners-container">
      <h2 className="table-title">Winners List</h2>

      {/* Event Filter Dropdown */}
      <div className="filter-container">
        <select value={selectedEvent} onChange={(e) => setSelectedEvent(e.target.value)}>
          {events.length > 0 ? (
            events.map((eventName, index) => (
              <option key={index} value={eventName}>
                {eventName}
              </option>
            ))
          ) : (
            <option disabled>No events found</option>
          )}
        </select>
      </div>

      {/* Export Button */}
      <div className="export-container">
        <button className="export-button" onClick={handleExportToExcel}>
          Export to Excel
        </button>
      </div>

      {/* Handling Loading & Errors */}
      {loading && <p>Loading winners...</p>}
      {error && <p className="error-message">{error}</p>}

      {/* ✅ Display "No winners yet." when there are no filtered winners */}
      {!loading && !error && filteredWinners.length === 0 && (
        <p className="no-winners-message">No winners yet for this event.</p>
      )}

      {/* Winners Table */}
      {!loading && !error && filteredWinners.length > 0 && (
        <table className="event-table">
          <thead>
            <tr>
              <th>Name/Team name</th>
              <th>Event Name</th>
              <th>Rank</th>
              <th>Held On</th>
            </tr>
          </thead>
          <tbody>
            {filteredWinners.map((winner, index) => (
              <tr key={index}>
                <td>{winner.name}</td>
                <td>{winner.eventName}</td>
                <td>{winner.rank}</td>
                <td>{new Date(winner.date).toISOString().split('T')[0]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default WinnersTable;
