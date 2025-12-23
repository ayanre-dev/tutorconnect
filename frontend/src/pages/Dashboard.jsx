// client/src/pages/Dashboard.jsx
import React from "react";
import StudentDashboard from "./StudentDashboard";
import TutorDashboard from "./TutorDashboard";
import AdminDashboard from "./AdminDashboard";

const Dashboard = () => {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) return <div>Please login to view your dashboard.</div>;

  return (
    <>
      {user.role === "admin" ? (
        <AdminDashboard />
      ) : user.role === "tutor" ? (
        <TutorDashboard />
      ) : (
        <StudentDashboard />
      )}
    </>
  );
};

export default Dashboard;