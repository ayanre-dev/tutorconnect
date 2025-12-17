// pages/TutorDashboard.jsx
import React, { useEffect, useState } from "react";
import { request } from "../api";
import { useNavigate } from "react-router-dom";

const TutorDashboard = () => {
  const [myClasses, setMyClasses] = useState([]);
  const [mySessions, setMySessions] = useState([]);
  const [newClass, setNewClass] = useState({ title: "", subject: "", price: 0, duration: 60 });
  const [sessionForm, setSessionForm] = useState({ classId: "", startTime: "" });

  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, []);

  const fetchData = async () => {
    try {
      const classesData = await request(`/classes/tutor/${user._id}`);
      setMyClasses(classesData);
      const sessionsData = await request(`/sessions/user/${user._id}`);
      setMySessions(sessionsData);
    } catch (err) {
      console.error(err);
    }
  };

  const createClass = async (e) => {
    e.preventDefault();
    try {
      await request("/classes/create", "POST", newClass);
      fetchData(); // Refresh
      alert("Class created!");
    } catch (err) {
      alert(err.message);
    }
  };

  const createSession = async (e) => {
    e.preventDefault();
    try {
      await request("/sessions/create", "POST", sessionForm);
      fetchData(); // Refresh
      alert("Session scheduled!");
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (sessionId) => {
    if (!window.confirm("Are you sure you want to cancel this class?")) return;
    try {
      await request(`/sessions/${sessionId}`, "DELETE");
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const startClass = (sessionId) => {
    // This is the "Force Start" logic. 
    // You could add an API call here to set status to 'ongoing'
    navigate(`/room/${sessionId}`);
  };

  return (
    <div className="page">
      <h2>Tutor Dashboard</h2>

      <div className="dashboard-grid">
        {/* Create Class Column */}
        <div className="panel">
          <h3>Create New Course</h3>
          <form onSubmit={createClass} className="form">
            <input placeholder="Title" onChange={(e) => setNewClass({ ...newClass, title: e.target.value })} required />
            <input placeholder="Subject" onChange={(e) => setNewClass({ ...newClass, subject: e.target.value })} required />
            <input type="number" placeholder="Price" onChange={(e) => setNewClass({ ...newClass, price: e.target.value })} required />
            <button type="submit" className="btn btn-primary">Create Course</button>
          </form>
        </div>

        {/* Schedule Session Column */}
        <div className="panel">
          <h3>Schedule a Session</h3>
          <form onSubmit={createSession} className="form">
            <select onChange={(e) => setSessionForm({ ...sessionForm, classId: e.target.value })} required>
              <option value="">Select Course</option>
              {myClasses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
            </select>
            <input type="datetime-local" onChange={(e) => setSessionForm({ ...sessionForm, startTime: e.target.value })} required />
            <button type="submit" className="btn btn-secondary">Schedule Session</button>
          </form>
        </div>
      </div>

      {/* Grouped Sessions List */}
      <div className="section">
        <h3>Upcoming Appointments</h3>

        {myClasses.map((cls) => {
          // Filter sessions: match class AND exclude completed
          const classSessions = mySessions.filter(s =>
            ((s.classId?._id === cls._id) || (s.classId === cls._id)) &&
            s.status !== "completed"
          );

          if (classSessions.length === 0) return null;

          return (
            <div key={cls._id} className="class-section">
              <div className="class-header">
                <strong>{cls.title}</strong>
              </div>

              <div className="sessions-grid">
                {classSessions.map((s) => (
                  <div key={s._id} className="session-card">
                    <div className="session-detail">
                      <span>Student:</span>
                      <strong>{s.studentId?.name || "Unknown"}</strong>
                    </div>

                    {/* Course field removed */}

                    <div className="session-detail">
                      <span>Duration:</span>
                      <span>{cls.duration || 60} min</span>
                    </div>

                    <div className="session-detail">
                      <span>Created:</span>
                      <span>{new Date(s.createdAt).toLocaleDateString()}</span>
                    </div>

                    <div className="session-detail">
                      <span>Scheduled:</span>
                      <span>{new Date(s.startTime).toLocaleString()}</span>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', marginTop: '1rem', borderTop: '1px solid #444', paddingTop: '1rem' }}>
                      <button
                        onClick={() => startClass(s._id)}
                        className="btn btn-primary"
                        style={{ flex: 1, padding: '8px', fontSize: '0.9rem' }}
                      >
                        Start Class
                      </button>
                      <button
                        onClick={() => handleDelete(s._id)}
                        className="btn btn-danger"
                        style={{ flex: 1, padding: '8px', fontSize: '0.9rem' }}
                      >
                        Cancel Class
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {mySessions.length === 0 && <p className="text-center">No upcoming sessions scheduled.</p>}
      </div>
    </div>
  );
};

export default TutorDashboard;