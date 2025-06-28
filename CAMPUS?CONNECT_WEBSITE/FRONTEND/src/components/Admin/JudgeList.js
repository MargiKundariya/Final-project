import React, { useState, useEffect } from "react";
import axios from "axios";
import JudgeDetails from "./JudgeDetails";
import EnhancedLoader from "../EnhancedLoader"; // Import the EnhancedLoader component

const JudgeList = () => {
  const [judges, setJudges] = useState([]);
  const [selectedJudge, setSelectedJudge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/judges")
      .then((response) => {
        console.log("Judges Data:", response.data); // Debugging
        setJudges(response.data);
        setLoading(false);
      })
      .catch((error) => {
        setError("Failed to fetch judges. Please try again.");
        setLoading(false);
        console.error("Error fetching judges:", error);
      });
  }, []);

  if (loading) {
    return <EnhancedLoader />; // 
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div style={{ padding: "20px" }}>

      {!selectedJudge ? (
        <>
        <h1>Judges</h1>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ border: "1px solid #ccc", padding: "10px", backgroundColor: "blue", color: "white" }}>Profile</th>
                <th style={{ border: "1px solid #ccc", padding: "10px", backgroundColor: "blue", color: "white" }}>Name</th>
                <th style={{ border: "1px solid #ccc", padding: "10px", backgroundColor: "blue", color: "white" }}>Email</th>
                <th style={{ border: "1px solid #ccc", padding: "10px", backgroundColor: "blue", color: "white" }}>Department</th>
                <th style={{ border: "1px solid #ccc", padding: "10px", backgroundColor: "blue", color: "white" }}>Details</th>
                <th style={{ border: "1px solid #ccc", padding: "10px", backgroundColor: "blue", color: "white" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {judges.length > 0 ? (
                judges.map((judge) => (
                  <tr key={judge._id}>
                    <td style={{ border: "1px solid #ccc", padding: "10px", textAlign: "center" }}>
                      <img 
                        src={`http://localhost:5000/${judge.imageUrl.replace(/\\/g, "/")}`} 
                        alt={judge.name} 
                        style={{ width: "50px", height: "50px", borderRadius: "50%" }}
                        onError={(e) => { e.target.src = "default-profile.png"; }}
                      />
                    </td>
                    <td style={{ border: "1px solid #ccc", padding: "10px" }}>{judge.name}</td>
                    <td style={{ border: "1px solid #ccc", padding: "10px" }}>{judge.email}</td>
                    <td style={{ border: "1px solid #ccc", padding: "10px" }}>{judge.department}</td>
                    <td style={{ border: "1px solid #ccc", padding: "10px" }}>{judge.details}</td>

                    <td style={{ border: "1px solid #ccc", padding: "10px" }}>
                      <button
                        style={{ padding: "5px 10px", backgroundColor: "#007bff", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}
                        onClick={() => setSelectedJudge(judge)}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center", padding: "10px", color: "red", fontStyle: "italic" }}>
                    No judges available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </>
      ) : (
        <div>
          <button
            style={{ padding: "5px 10px", marginBottom: "20px", backgroundColor: "blue", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}
            onClick={() => setSelectedJudge(null)}
          >
            Back to List
          </button>
          <JudgeDetails judge={selectedJudge} />
        </div>
      )}
    </div>
  );
};

export default JudgeList;
