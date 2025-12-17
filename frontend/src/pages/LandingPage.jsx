// pages/LandingPage.jsx
import React from "react";
import { Link } from "react-router-dom";

const LandingPage = () => {
  return (
    <div className="landing">
      <header className="hero">
        <h1>Master Any Subject, Anytime.</h1>
        <p>Connect with expert tutors or manage your own classes with our real-time learning platform.</p>
        <div className="cta-buttons">
          <Link to="/marketplace" className="btn btn-primary">Find a Tutor</Link>
          <Link to="/register" className="btn btn-secondary">Become a Tutor</Link>
        </div>
      </header>
      
      <section className="features">
        <div className="feature-card">
          <h3>For Students</h3>
          <p>Browse a marketplace of classes, enroll instantly, and join live video sessions.</p>
        </div>
        <div className="feature-card">
          <h3>For Tutors</h3>
          <p>Create courses, schedule sessions, and manage your students with a dedicated dashboard.</p>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;