// pages/StudentDashboard.jsx
import React, { useEffect, useState } from "react";
import { request } from "../api";
import { useNavigate } from "react-router-dom";

const StudentDashboard = () => {
  const [sessions, setSessions] = useState([]);
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();

  useEffect(() => {
    if (user) fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const data = await request(`/sessions/${user._id}`);
      setSessions(data);
    } catch (err) {
      console.error(err);
    }
  };

  const joinSession = (sessionId) => {
    navigate(`/room/${sessionId}`);
  };

  return (
    <div className="page">
      <h2>Student Dashboard</h2>
      
      <div className="section">
        <h3>Upcoming Sessions</h3>
        {sessions.length === 0 ? <p>No sessions scheduled.</p> : (
          <table className="table">
            <thead>
              <tr>
                <th>Class</th>
                <th>Tutor</th>
                <th>Time</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s) => (
                <tr key={s._id}>
                  <td>{s.classId?.title}</td>
                  <td>{s.tutorId?.name}</td>
                  <td>{new Date(s.startTime).toLocaleString()}</td>
                  <td>
                    <button onClick={() => joinSession(s._id)} className="btn btn-green">
                      Join Class
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      
      {/* You can add a separate API call to list just Enrolled Classes here if desired */}
    </div>
  );
};

export default StudentDashboard;