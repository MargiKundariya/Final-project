import React, { useEffect, useState } from 'react';
import EventCards from './EventCards';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../../assets/css/eventcards.css';

function EventDetails() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5000/api/events');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setEvents(data.events);
      } catch (error) {
        console.error('Error fetching events:', error);
        if (!toast.isActive('events-error-toast')) {
          toast.error('Failed to load events. Please try again later.', { toastId: 'events-error-toast' });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const handleEdit = (event) => {
    navigate(`/admin/event-details/edit-event/${event._id}`, { state: { event } });
  };

  const handleDelete = async (event) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this event?');
  
    if (confirmDelete) {
      try {
        const response = await fetch(`http://localhost:5000/api/events/${event._id}`, {
          method: 'DELETE',
        });
  
        if (response.ok) {
          toast.success('Event deleted successfully!', { toastId: 'delete-success-toast' });
          setEvents((prevEvents) => prevEvents.filter((e) => e._id !== event._id));
        } else {
          const errorData = await response.json();
          toast.error(`Error deleting event: ${errorData.message}`, { toastId: 'delete-error-toast' });
        }
      } catch (error) {
        console.error('Error deleting event:', error);
        toast.error('Failed to delete the event. Please try again.', { toastId: 'delete-error-toast' });
      }
    } else {
      // Clear any lingering toasts or error messages (optional)
      toast.dismiss('delete-success-toast');
      toast.dismiss('delete-error-toast');
    }
  };
  

  return (
    <div className="event-details-container">
      {loading ? (
        <div id="event-cards-section" className="loading-container">
          <p>Loading events...</p>
        </div>
      ) : (
        <EventCards events={events} onDelete={handleDelete} onEdit={handleEdit} />
      )}
    </div>
  );
}

export default EventDetails;