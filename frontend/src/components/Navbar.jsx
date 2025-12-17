import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to={user ? "/dashboard" : "/"} className="navbar-logo">
          TutorConnect
        </Link>
        <div className="navbar-links">
          {!user ? (
            <>
              <Link to="/" className="nav-link">Home</Link>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/register" className="nav-link btn-register">Register</Link>
            </>
          ) : (
            <>
              {/* Both Student and Tutor see the same options as requested */}
              <Link to="/dashboard" className="nav-link">Dashboard</Link>
              <Link to="/marketplace" className="nav-link">Marketplace</Link>
              <button onClick={logout} className="btn-logout">Logout</button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
