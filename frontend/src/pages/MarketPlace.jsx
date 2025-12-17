// pages/Marketplace.jsx
import React, { useEffect, useState } from "react";
import { request } from "../api";

const Marketplace = () => {
  const [classes, setClasses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const data = await request("/classes"); // Hits getAllClasses
      setClasses(data);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEnroll = async (classId) => {
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
      <h2>Course Marketplace</h2>
      <input
        type="text"
        placeholder="Filter by course name..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-bar"
      />
      <div className="grid">
        {filteredClasses.map((c) => (
          <div key={c._id} className="card">
            <h3>{c.title}</h3>
            <p><strong>Subject:</strong> {c.subject}</p>
            <p><strong>Tutor:</strong> {c.tutorId?.name}</p>
            <p>{c.description}</p>
            <p><strong>Price:</strong> ${c.price}</p>
            <button onClick={() => handleEnroll(c._id)} className="btn btn-primary">
              Enroll Now
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Marketplace;