// pages/StudentDashboard.jsx
import React, { useEffect, useState } from "react";
import { request } from "../api";
import { useNavigate } from "react-router-dom";

const StudentDashboard = () => {
  const [enrolledClasses, setEnrolledClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();

  useEffect(() => {
    if (user) fetchEnrolledClasses();
  }, []);

  const fetchEnrolledClasses = async () => {
    try {
      setLoading(true);
      const data = await request("/classes/enrolled");
      setEnrolledClasses(data);
    } catch (err) {
      console.error("Error fetching enrolled classes:", err);
    } finally {
      setLoading(false);
    }
  };

  const joinClass = (classId) => {
    // Navigate to video room for this class
    navigate(`/room/${classId}`);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="page">
      <h2>My Enrolled Classes</h2>
      
      {loading ? (
        <p>Loading your classes...</p>
      ) : enrolledClasses.length === 0 ? (
        <div style={{textAlign: 'center', padding: '3rem'}}>
          <p style={{color: 'var(--text-muted)', marginBottom: '1rem'}}>
            You haven't enrolled in any classes yet.
          </p>
          <button 
            onClick={() => navigate('/marketplace')} 
            className="btn btn-primary"
          >
            Browse Marketplace
          </button>
        </div>
      ) : (
        <div className="class-grid">
          {enrolledClasses.map((classItem) => (
            <div key={classItem._id} className="class-card">
              <h3 style={{marginBottom: '1rem', color: 'var(--primary)'}}>{classItem.title}</h3>
              
              <div style={{marginBottom: '1rem'}}>
                <p style={{marginBottom: '0.5rem'}}>
                  <strong>Teacher:</strong> {classItem.tutorId?.name || 'N/A'}
                </p>
                <p style={{marginBottom: '0.5rem'}}>
                  <strong>Subject:</strong> {classItem.subject}
                </p>
                <p style={{marginBottom: '0.5rem'}}>
                  <strong>Duration:</strong> {classItem.duration || 60} minutes
                </p>
                <p style={{marginBottom: '0.5rem'}}>
                  <strong>Created:</strong> {formatDate(classItem.createdAt)}
                </p>
                {classItem.description && (
                  <p style={{marginTop: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem'}}>
                    {classItem.description}
                  </p>
                )}
              </div>

              <button 
                onClick={() => joinClass(classItem._id)} 
                className="btn btn-primary btn-block"
              >
                Join Class
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;