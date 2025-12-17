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
      const sessionsData = await request(`/sessions/${user._id}`);
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
      await request("/sessions", "POST", sessionForm);
      fetchData(); // Refresh
      alert("Session scheduled!");
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
            <input placeholder="Title" onChange={(e) => setNewClass({...newClass, title: e.target.value})} required />
            <input placeholder="Subject" onChange={(e) => setNewClass({...newClass, subject: e.target.value})} required />
            <input type="number" placeholder="Price" onChange={(e) => setNewClass({...newClass, price: e.target.value})} required />
            <button type="submit" className="btn btn-primary">Create Course</button>
          </form>
        </div>

        {/* Schedule Session Column */}
        <div className="panel">
          <h3>Schedule a Session</h3>
          <form onSubmit={createSession} className="form">
            <select onChange={(e) => setSessionForm({...sessionForm, classId: e.target.value})} required>
              <option value="">Select Course</option>
              {myClasses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
            </select>
            <input type="datetime-local" onChange={(e) => setSessionForm({...sessionForm, startTime: e.target.value})} required />
            <button type="submit" className="btn btn-secondary">Schedule Session</button>
          </form>
        </div>
      </div>

      {/* List Sessions */}
      <div className="section">
        <h3>Upcoming Appointments</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Class</th>
              <th>Student</th>
              <th>Time</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {mySessions.map((s) => (
              <tr key={s._id}>
                <td>{s.classId?.title}</td>
                <td>{s.studentId?.name}</td>
                <td>{new Date(s.startTime).toLocaleString()}</td>
                <td>
                  <button onClick={() => startClass(s._id)} className="btn btn-red">
                    Start Class (Force)
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TutorDashboard;