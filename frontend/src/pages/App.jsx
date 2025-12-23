import React from "react";
import { BrowserRouter, Routes, Route, Link, useNavigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Marketplace from "./pages/Marketplace";
import StudentDashboard from "./pages/StudentDashboard";
import TutorDashboard from "./pages/TutorDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Room from "./pages/Room";
import "./styles.css";

// Use this Navbar because it has the Login/Logout logic!
const Navbar = () => {
  const navigate = useNavigate();
  // Get user from localStorage to check if logged in
  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="logo">TutorConnect</div>
      <div className="links">
        <Link to="/">Home</Link>
        <Link to="/marketplace">Marketplace</Link>
        {!user ? (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        ) : (
          <>
            <Link to={
              user.role === "admin" ? "/admin-dashboard" :
                user.role === "tutor" ? "/tutor-dashboard" :
                  "/student-dashboard"
            }>
              Dashboard
            </Link>
            <button onClick={handleLogout} className="btn-logout">Logout</button>
          </>
        )}
      </div>
    </nav>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      {/* 1. The Navbar is placed here so it shows on every page */}
      <Navbar />

      <div className="container">
        {/* 2. Routes decide which page component to show below the Navbar */}
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/student-dashboard" element={<StudentDashboard />} />
          <Route path="/tutor-dashboard" element={<TutorDashboard />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/room/:sessionId" element={<Room />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}