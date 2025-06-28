import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Dashboard from './Dashboard';
import '../../assets/css/dashboardcontainer.css';
import { toast } from 'react-toastify';
import EnhancedLoader from '../EnhancedLoader';

const DashboardContainer = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'ongoing', 'upcoming', 'completed'

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        let fetchedEvents = [];
  
        if (filter === 'all') {
          // Fetch all event categories concurrently
          const [ongoingRes, upcomingRes, completedRes] = await Promise.all([
            axios.get('http://localhost:5000/api/events/getOngoing'),
            axios.get('http://localhost:5000/api/events/upcoming'),
            axios.get('http://localhost:5000/api/events/completed'),
          ]);
  
          const ongoingEvents = ongoingRes.data?.ongoingEvents || [];
          const upcomingEvents = upcomingRes.data?.upcomingEvents || [];
          const completedEvents = completedRes.data?.completedEvents?.map(event => ({
            ...event,
            status: 'completed', // Add status flag for completed events
          })) || [];
  
          // Ensure ongoing events are first, followed by upcoming, then completed
          fetchedEvents = [...ongoingEvents, ...upcomingEvents, ...completedEvents];
        } else {
          let url = 'http://localhost:5000/api/events';
          if (filter === 'ongoing') url = 'http://localhost:5000/api/events/getOngoing';
          else if (filter === 'upcoming') url = 'http://localhost:5000/api/events/upcoming';
          else if (filter === 'completed') url = 'http://localhost:5000/api/events/completed';
  
          const response = await axios.get(url);
          fetchedEvents = response.data?.events || response.data?.upcomingEvents || response.data?.ongoingEvents || response.data?.completedEvents || [];
  
          // If filtering completed events, mark them
          if (filter === 'completed') {
            fetchedEvents = fetchedEvents.map(event => ({
              ...event,
              status: 'completed',
            }));
          }
        }
  
        setEvents(fetchedEvents);
      } catch (error) {
        setEvents([]);
        toast.error(`Error fetching events: ${error.message}`, { toastId: 'events-fetch-error' });
      } finally {
        setLoading(false);
      }
    };
  
    fetchEvents();
  }, [filter]);
  
  return (
    <div className="dashboard-container-wrapper" id="dashboard-container-wrapper">
      <h1 className="dashboard-title">Your Events Dashboard</h1>

      <div className="dashboard-filters">
        <button className={`filter-button ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All Events</button>
        <button className={`filter-button ${filter === 'ongoing' ? 'active' : ''}`} onClick={() => setFilter('ongoing')}>Ongoing Events</button>
        <button className={`filter-button ${filter === 'upcoming' ? 'active' : ''}`} onClick={() => setFilter('upcoming')}>Upcoming Events</button>
        <button className={`filter-button ${filter === 'completed' ? 'active' : ''}`} onClick={() => setFilter('completed')}>Completed Events</button>
      </div>

      {loading ? (
        <EnhancedLoader/>
      ) : events.length > 0 ? (
        <div className="dashboard-container">
          {events.map(event => (
            <Dashboard key={event._id} event={event} filter={filter} />
          ))}
        </div>
      ) : (
        <p className="no-events-message">No {filter !== 'all' ? filter : ''} events available</p>
      )}
    </div>
  );
};

export default DashboardContainer;
