// pages/TutorDashboard.jsx
import React, { useEffect, useState } from "react";
import { request } from "../api";
import { useNavigate } from "react-router-dom";

const TutorDashboard = () => {
  const [myClasses, setMyClasses] = useState([]);
  const [mySessions, setMySessions] = useState([]);
  const [newClass, setNewClass] = useState({ title: "", subject: "", price: 0, duration: 60 });
  const [sessionForm, setSessionForm] = useState({ classId: "", startTime: "", studentId: "" });
  const [availableStudents, setAvailableStudents] = useState([]); // Students for selected course

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
    navigate(`/room/${sessionId}`);
  };

  const handleCourseChange = (e) => {
    const clsId = e.target.value;
    const cls = myClasses.find(c => c._id === clsId);
    setSessionForm({ ...sessionForm, classId: clsId, studentId: "" });
    setAvailableStudents(cls ? cls.students : []);
  };

  return (
    <div className="page">
      <h2 style={{ textAlign: "center", fontSize: "2.5rem", marginTop: "2rem" }}>Tutor Dashboard</h2>

      <div className="dashboard-grid">
        {/* Create Class Column */}
        <div className="panel">
          <h3 style={{ textAlign: "center", fontSize: "1.8rem", marginTop: "2rem" }}>Create New Course</h3>
          <form
            onSubmit={createClass}
            className="form"
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
              flexWrap: "wrap",
              gap: "15px",
            }}
          >
            <input placeholder="Title" onChange={(e) => setNewClass({ ...newClass, title: e.target.value })} required />
            <input placeholder="Subject" onChange={(e) => setNewClass({ ...newClass, subject: e.target.value })} required />
            <input type="number" placeholder="Price" onChange={(e) => setNewClass({ ...newClass, price: e.target.value })} required />
            <button type="submit" className="btn btn-primary">Create Course</button>
          </form>
        </div>

        {/* Schedule Session Column */}
        <div className="panel">
          <h3 style={{ textAlign: "center", fontSize: "1.8rem", marginTop: "2rem" }}>Schedule a Session</h3>
          <form
            onSubmit={createSession}
            className="form"
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
              flexWrap: "wrap",
              gap: "15px",
            }}
          >
            <select onChange={handleCourseChange} required>
              <option value="">Select Course</option>
              {myClasses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
            </select>

            {/* Student Dropdown - Only shows if students exist */}
            <select
              value={sessionForm.studentId}
              onChange={(e) => setSessionForm({ ...sessionForm, studentId: e.target.value })}
              required
              disabled={availableStudents.length === 0}
            >
              <option value="">Select Student</option>
              {availableStudents.map(s => (
                <option key={s._id} value={s._id}>{s.name} ({s.email})</option>
              ))}
            </select>

            <input type="datetime-local" onChange={(e) => setSessionForm({ ...sessionForm, startTime: e.target.value })} required />
            <button type="submit" className="btn btn-secondary">Schedule Session</button>
          </form>
        </div>
      </div>

      {/* Grouped Sessions List */}
      <div className="section">
        <h3 style={{ textAlign: "center", fontSize: "1.8rem", marginTop: "3rem" }}>Upcoming Appointments</h3>

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