import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../assets/css/edit.css";
import logo from "../../assets/images/editevent.jpg";

const EditEvent = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    ...state?.event,
    coordinators: state?.event?.coordinators || [],
  });
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    // Format date for input field
    if (formData.date) {
      const formattedDate = new Date(formData.date).toISOString().split("T")[0];
      setFormData((prev) => ({ ...prev, date: formattedDate }));
    }

    // Set image preview if event has an image
    if (formData.imagePath) {
      const imageUrl = `http://localhost:5000/${formData.imagePath.startsWith('/') ? formData.imagePath.substring(1) : formData.imagePath}`;
      setImagePreview(imageUrl);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTimeChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCoordinatorChange = (index, value) => {
    const newCoordinators = [...formData.coordinators];
    newCoordinators[index] = value;
    setFormData({ ...formData, coordinators: newCoordinators });
  };

  const handleAddCoordinator = () => {
    setFormData({ ...formData, coordinators: [...formData.coordinators, ""] });
  };

  const handleRemoveCoordinator = (index) => {
    const newCoordinators = formData.coordinators.filter((_, i) => i !== index);
    setFormData({ ...formData, coordinators: newCoordinators });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      
      // Store file in formData for submission
      setFormData((prev) => ({ ...prev, imageFile: file }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Create FormData object for multipart/form-data if there's an image
      const submitData = new FormData();
      
      // Add all form fields
      Object.keys(formData).forEach(key => {
        if (key === 'coordinators') {
          // Handle coordinators array specially
          formData.coordinators.forEach((coordinator, index) => {
            submitData.append(`coordinators[${index}]`, coordinator);
          });
        } else if (key === 'imageFile' && formData.imageFile) {
          // Add image file if it exists
          submitData.append('eventImage', formData.imageFile);
        } else if (key !== 'imageFile') {
          // Add all other fields
          submitData.append(key, formData[key]);
        }
      });

      // Determine if we need to send as FormData or JSON
      const hasImageFile = formData.imageFile !== undefined;
      
      const response = await fetch(`http://localhost:5000/api/events/${formData._id}`, {
        method: "PUT",
        headers: hasImageFile ? undefined : { "Content-Type": "application/json" },
        body: hasImageFile ? submitData : JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success("Event updated successfully!");
        setTimeout(() => navigate("/admin/event-details"), 1500);
      } else {
        const errorData = await response.json();
        toast.error(`Error updating event: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Failed to update the event. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="edit-container">
      <div className="edit-card">
        <div className="edit-header">
          <img src={logo} alt="Edit Event" className="edit-logo" />
          <h2>Edit Event</h2>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-columns">
            <div className="form-column">
              <div className="form-group">
                <label>Event Name <span className="required">*</span></label>
                <input 
                  type="text" 
                  name="name" 
                  value={formData.name || ""} 
                  onChange={handleChange}
                  required
                  className="input-field"
                  placeholder="Enter event name"
                />
              </div>
              
              <div className="form-row">
                <div className="form-group half">
                  <label>Date <span className="required">*</span></label>
                  <input 
                    type="date" 
                    name="date" 
                    value={formData.date || ""} 
                    onChange={handleChange}
                    required
                    className="input-field"
                  />
                </div>
                
                <div className="form-group half">
                  <label>Venue <span className="required">*</span></label>
                  <input 
                    type="text" 
                    name="venue" 
                    value={formData.venue || ""} 
                    onChange={handleChange}
                    required
                    className="input-field"
                    placeholder="Enter venue"
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group half">
                  <label>Start Time</label>
                  <input 
                    type="time" 
                    name="startTime" 
                    value={formData.startTime || ""} 
                    onChange={handleTimeChange}
                    className="input-field"
                  />
                </div>
                
                <div className="form-group half">
                  <label>End Time</label>
                  <input 
                    type="time" 
                    name="endTime" 
                    value={formData.endTime || ""} 
                    onChange={handleTimeChange}
                    className="input-field"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Event Type</label>
                <select 
                  name="participationType" 
                  value={formData.participationType || ""} 
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="">Select type</option>
                  <option value="Individual">Individual</option>
                  <option value="Group">Group</option>
                  <option value="Both">Both</option>
                </select>
              </div>
            </div>
            
            <div className="form-column">
              <div className="form-group">
                <label>Criteria</label>
                <textarea 
                  name="criteria" 
                  value={formData.criteria || ""} 
                  onChange={handleChange}
                  className="input-field textarea-small"
                  placeholder="Enter judging criteria"
                />
              </div>
            </div>
          </div>
          
          <div className="form-group">
            <label>Description <span className="required">*</span></label>
            <textarea 
              name="description" 
              value={formData.description || ""} 
              onChange={handleChange}
              required
              className="input-field textarea-large"
              placeholder="Enter event description and rules"
            />
          </div>

          <div className="form-group">
            <label>Coordinators</label>
            <div className="coordinators-container">
              {formData.coordinators.map((coordinator, index) => (
                <div key={index} className="coordinator-item">
                  <input
                    type="text"
                    value={coordinator}
                    onChange={(e) => handleCoordinatorChange(index, e.target.value)}
                    className="input-field coordinator-input"
                    placeholder="Coordinator name"
                  />
                  <button 
                    type="button" 
                    className="btn-remove"
                    onClick={() => handleRemoveCoordinator(index)}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              ))}
              <button 
                type="button" 
                className="btn-add"
                onClick={handleAddCoordinator}
              >
                <i className="fas fa-plus"></i> Add Coordinator
              </button>
            </div>
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              className="btn-cancel"
              onClick={() => navigate("/admin/event-details")}
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-save"
              disabled={loading}
            >
              {loading ? (
                <span><i className="fas fa-spinner fa-spin"></i> Saving...</span>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditEvent;