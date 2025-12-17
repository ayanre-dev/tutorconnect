// pages/LandingPage.jsx
import React from "react";
import { Link } from "react-router-dom";

const LandingPage = () => {
  return (
    <div className="landing">
      <header className="hero landing-hero text-center">
        <h1 className="landing-title" style={{ marginTop: '4rem' }}>TutorConnect</h1>
        <div className="landing-subtitle">
          <p>Connecting students with expert tutors for a seamless learning experience.</p>
          <p>Find the perfect tutor or manage your own classes with our real-time platform.</p>
        </div>
        <div className="landing-buttons">
          <Link to="/marketplace" className="btn btn-primary btn-lg">Find a Tutor</Link>
          <Link to="/register" className="btn btn-secondary btn-lg">Become a Tutor</Link>
        </div>
      </header>

      <section className="features container">
        <div className="class-grid" style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap', marginTop: '3rem' }}>
          <div className="class-card text-center" style={{ flex: '1 1 300px', maxWidth: '400px' }}>
            <h3>For Students</h3>
            <p>Browse a marketplace of classes, enroll instantly, and join live video sessions.</p>
          </div>
          <div className="class-card text-center" style={{ flex: '1 1 300px', maxWidth: '400px' }}>
            <h3>For Tutors</h3>
            <p>Create courses, schedule sessions, and manage your students with a dedicated dashboard.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;