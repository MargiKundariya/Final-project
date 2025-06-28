import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify'; // Import toast from React-Toastify
import 'react-toastify/dist/ReactToastify.css'; // Import Toastify CSS
import '../../assets/css/eventdetailstable.css';

const FacultyDetailsTable = ({ faculty, onDelete }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState(null);

  // Navigate to the edit page with the faculty member's details
  const onEdit = (member) => {
    navigate('/admin/editfaculty', { state: { member } });
    toast.info(`Editing ${member.name}'s details.`);
  };

  // Navigate to the Add Faculty page
  const navigateToAddFaculty = () => {
    navigate('/admin/addfaculty');
  };

  // Show confirmation dialog
  const handleDeleteClick = (member) => {
    setMemberToDelete(member);
    setShowConfirmation(true);
  };

  // Handle confirmation result
  const handleConfirmDelete = () => {
    if (memberToDelete) {
      onDelete(memberToDelete);
      toast.success(`${memberToDelete.name} has been deleted.`);
    }
    setShowConfirmation(false);
    setMemberToDelete(null);
  };

  // Cancel delete operation
  const handleCancelDelete = () => {
    setShowConfirmation(false);
    setMemberToDelete(null);
  };

  // Filter faculty members based on the search term
  const filteredFaculty = faculty.filter((member) =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="table-container">
      <h2 className="table-title">Faculty Details</h2>
      <div className="controls-container">
        <button className="add-faculty" id='addco' onClick={navigateToAddFaculty}>
          Add New Faculty
        </button>
        <div className="search-container">
          <input
            type="text"
            className="search-input"
            placeholder="Search by Name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="search-button">Search</button>
        </div>
      </div>

      <table className="event-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Mobile Number</th>
            <th>Department</th>
            <th>Gender</th>
            <th>Email</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredFaculty.length > 0 ? (
            filteredFaculty.map((member, index) => (
              <tr key={index}>
                <td>{member.name}</td>
                <td>{member.mobileNumber}</td>
                <td>{member.department}</td>
                <td>{member.gender}</td>
                <td>{member.email}</td>
                <td>
                  <div className="button-container">
                    <button className="action-btn" id="eedit-btn" onClick={() => onEdit(member)}>
                      <i className="fas fa-edit"></i>
                    </button>
                    <button className="action-btn" id="delete-btn" onClick={() => handleDeleteClick(member)}>
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6">No matching records found</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Confirmation Dialog */}
      {showConfirmation && (
        <div className="confirmation-overlay">
          <div className="confirmation-dialog">
            <h3>Confirm Deletion</h3>
            <p>Are you sure you want to delete {memberToDelete?.name}?</p>
            <div className="confirmation-buttons">
              <button className="cancel-btn" onClick={handleCancelDelete}>Cancel</button>
              <button className="confirm-btn" onClick={handleConfirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyDetailsTable;