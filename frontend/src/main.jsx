import "./polyfills";
import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Ensure these match your folder exactly
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import VideoRoom from "./pages/VideoRoom";
import LandingPage from "./pages/LandingPage"; // Matches LandingPage.jsx
import Marketplace from "./pages/MarketPlace";  // Matches MarketPlace.jsx
import "./styles.css";

// Separate Navbar component to provide navigation on all pages
const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="logo">TutorConnect</div>
      <div className="links" style={{ display: 'flex', gap: '15px' }}>
        <a href="/">Home</a>
        <a href="/marketplace">Marketplace</a>
        <a href="/login">Login</a>
        <a href="/register">Register</a>
      </div>
    </nav>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <div className="container">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/room/:roomId" element={<VideoRoom />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

createRoot(document.getElementById("root")).render(<App />);