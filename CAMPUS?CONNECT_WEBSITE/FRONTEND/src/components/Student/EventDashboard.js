import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Users, ChevronRight, Heart } from 'lucide-react';

const EventsDashboard = () => {
  // Sample data - in a real app, this would come from an API
  const [events, setEvents] = useState([
    {
      id: 1,
      title: "Tech Conference 2025",
      description: "Join industry leaders to explore emerging technologies and network with professionals.",
      startDate: "2025-03-20T09:00:00",
      endDate: "2025-03-21T17:00:00",
      location: "San Francisco Convention Center",
      category: "Technology",
      attendees: 342,
      isLiked: false,
      isOngoing: true,
      image: "/api/placeholder/600/300"
    },
    {
      id: 2,
      title: "Community Hackathon",
      description: "48-hour coding challenge with prizes for the most innovative solutions.",
      startDate: "2025-03-25T10:00:00",
      endDate: "2025-03-27T10:00:00",
      location: "Downtown Innovation Hub",
      category: "Coding",
      attendees: 156,
      isLiked: true,
      isOngoing: false,
      image: "/api/placeholder/600/300"
    },
    {
      id: 3,
      title: "Design Workshop",
      description: "Hands-on workshop exploring the latest UI/UX trends and best practices.",
      startDate: "2025-04-02T13:00:00",
      endDate: "2025-04-02T17:00:00",
      location: "Creative Design Studio",
      category: "Design",
      attendees: 75,
      isLiked: false,
      isOngoing: false,
      image: "/api/placeholder/600/300"
    },
    {
      id: 4,
      title: "Networking Mixer",
      description: "Casual networking event for tech professionals to connect and share ideas.",
      startDate: "2025-03-19T18:00:00",
      endDate: "2025-03-19T21:00:00",
      location: "Skyline Lounge",
      category: "Networking",
      attendees: 120,
      isLiked: false,
      isOngoing: true,
      image: "/api/placeholder/600/300"
    }
  ]);
  
  const toggleLike = (id) => {
    setEvents(events.map(event => 
      event.id === id ? { ...event, isLiked: !event.isLiked } : event
    ));
  };
  
  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Your Events Dashboard</h1>
        
        {/* Ongoing Events Section */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Ongoing Events</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {events.filter(event => event.isOngoing).map(event => (
              <EventCard 
                key={event.id} 
                event={event} 
                toggleLike={toggleLike} 
                isOngoing={true} 
              />
            ))}
          </div>
          {events.filter(event => event.isOngoing).length === 0 && (
            <p className="text-gray-500 italic">No ongoing events at the moment.</p>
          )}
        </section>
        
        {/* Upcoming Events Section */}
        <section>
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Upcoming Events</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {events.filter(event => !event.isOngoing).map(event => (
              <EventCard 
                key={event.id} 
                event={event} 
                toggleLike={toggleLike} 
                isOngoing={false} 
              />
            ))}
          </div>
          {events.filter(event => !event.isOngoing).length === 0 && (
            <p className="text-gray-500 italic">No upcoming events scheduled.</p>
          )}
        </section>
      </div>
    </div>
  );
};

// Event Card Component
const EventCard = ({ event, toggleLike, isOngoing }) => {
  // Format date function moved inside the component
  const formatDate = (dateString) => {
    const options = { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };
  
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
      <div className="relative">
        <img 
          src={event.image} 
          alt={event.title} 
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-4 right-4">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            isOngoing ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
          }`}>
            {isOngoing ? 'Ongoing' : 'Upcoming'}
          </span>
        </div>
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-800 text-white">
            {event.category}
          </span>
        </div>
      </div>
      
      <div className="p-5">
        <h3 className="text-xl font-bold mb-2">{event.title}</h3>
        <p className="text-gray-600 mb-4 line-clamp-2">{event.description}</p>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-gray-500">
            <Calendar className="w-4 h-4 mr-2" />
            <span className="text-sm">{formatDate(event.startDate)}</span>
          </div>
          <div className="flex items-center text-gray-500">
            <Clock className="w-4 h-4 mr-2" />
            <span className="text-sm">{formatDate(event.endDate)}</span>
          </div>
          <div className="flex items-center text-gray-500">
            <MapPin className="w-4 h-4 mr-2" />
            <span className="text-sm">{event.location}</span>
          </div>
          <div className="flex items-center text-gray-500">
            <Users className="w-4 h-4 mr-2" />
            <span className="text-sm">{event.attendees} attending</span>
          </div>
        </div>
        
        <div className="flex justify-between items-center pt-2 border-t border-gray-100">
          <button 
            onClick={() => toggleLike(event.id)}
            className={`flex items-center ${event.isLiked ? 'text-red-500' : 'text-gray-400'}`}
          >
            <Heart className={`w-5 h-5 mr-1 ${event.isLiked ? 'fill-current' : ''}`} />
            <span className="text-sm">{event.isLiked ? 'Liked' : 'Like'}</span>
          </button>
          
          <button className="flex items-center text-blue-600 hover:text-blue-800">
            <span className="text-sm font-medium">View Details</span>
            <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventsDashboard;