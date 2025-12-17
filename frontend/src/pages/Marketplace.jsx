// pages/Marketplace.jsx
import React, { useEffect, useState } from "react";
import { request } from "../api";

const Marketplace = () => {
  const [classes, setClasses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));
  const isStudent = user && user.role === "student";

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const data = await request("/classes");
      setClasses(data);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEnroll = async (classId) => {
    if (!window.confirm("Enroll in this course?")) return;
    try {
      await request("/classes/enroll", "POST", { classId });
      alert("Enrolled successfully! Check your dashboard.");
    } catch (err) {
      alert("Error enrolling: " + err.message);
    }
  };

  const filteredClasses = classes.filter((c) =>
    c.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="page">
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h2>Course Marketplace</h2>
        <input
          type="text"
          placeholder="Filter by course name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-bar"
          style={{ maxWidth: '500px', width: '100%', marginTop: '1rem' }}
        />
      </div>

      <div className="sessions-grid">
        {filteredClasses.map((c) => (
          <div key={c._id} className="session-card">
            {/* Title bold at top */}
            <div style={{ borderBottom: '1px solid #444', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>
              <strong>{c.title}</strong>
            </div>

            <div className="session-detail">
              <span>Teacher:</span>
              <span>{c.tutorId?.name || "Unknown"}</span>
            </div>

            <div className="session-detail">
              <span>Subject:</span>
              <span>{c.subject}</span>
            </div>

            <div className="session-detail">
              <span>Price:</span>
              <span style={{ color: 'var(--primary)' }}>${c.price}</span>
            </div>

            {/* Show description if needed, or keep it minimal as requested "Title, Teacher, Subject, Price" */}
            <div className="session-detail" style={{ marginTop: '0.5rem', fontSize: '0.85rem', fontStyle: 'italic' }}>
              {c.description && c.description.substring(0, 50) + (c.description.length > 50 ? "..." : "")}
            </div>

            {isStudent && (
              <button
                onClick={() => handleEnroll(c._id)}
                className="btn btn-primary"
                style={{ marginTop: '1rem', width: '100%' }}
              >
                Enroll Now
              </button>
            )}
          </div>
        ))}
      </div>

      {filteredClasses.length === 0 && <p className="text-center">No courses found.</p>}
    </div>
  );
};

export default Marketplace;