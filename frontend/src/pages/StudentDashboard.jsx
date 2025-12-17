// pages/StudentDashboard.jsx
import React, { useEffect, useState } from "react";
import { request } from "../api";
import { useNavigate } from "react-router-dom";

const StudentDashboard = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();

  useEffect(() => {
    if (user) fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const data = await request(`/sessions/user/${user._id}`);
      // Filter to only show scheduled and ongoing sessions (not completed)
      const activeSessions = data.filter(s => s.status !== "completed" && s.status !== "cancelled");
      setSessions(activeSessions);
    } catch (err) {
      console.error("Error fetching sessions:", err);
    } finally {
      setLoading(false);
    }
  };

  const joinSession = (sessionId) => {
    // Navigate to video room with sessionId (same as tutor)
    navigate(`/room/${sessionId}`);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="page">
      <h2>My Scheduled Sessions</h2>
      
      {loading ? (
        <p>Loading your sessions...</p>
      ) : sessions.length === 0 ? (
        <div style={{textAlign: 'center', padding: '3rem'}}>
          <p style={{color: 'var(--text-muted)', marginBottom: '1rem'}}>
            You don't have any scheduled sessions yet.
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
          {sessions.map((session) => (
            <div key={session._id} className="class-card">
              <h3 style={{marginBottom: '1rem', color: 'var(--primary)'}}>
                {session.classId?.title || 'Class'}
              </h3>
              
              <div style={{marginBottom: '1rem'}}>
                <p style={{marginBottom: '0.5rem'}}>
                  <strong>Tutor:</strong> {session.tutorId?.name || 'N/A'}
                </p>
                <p style={{marginBottom: '0.5rem'}}>
                  <strong>Scheduled:</strong> {formatDate(session.startTime)}
                </p>
                <p style={{marginBottom: '0.5rem'}}>
                  <strong>Status:</strong> 
                  <span style={{
                    marginLeft: '0.5rem',
                    padding: '0.2rem 0.6rem',
                    borderRadius: '4px',
                    fontSize: '0.85rem',
                    backgroundColor: session.status === 'ongoing' ? 'var(--success)' : 'var(--secondary)',
                    color: 'white'
                  }}>
                    {session.status}
                  </span>
                </p>
              </div>

              <button 
                onClick={() => joinSession(session._id)} 
                className="btn btn-primary btn-block"
              >
                {session.status === 'ongoing' ? 'Join Now' : 'Join Class'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;