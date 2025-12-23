import React, { useEffect, useState } from "react";
import { request } from "../api";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState("upcoming"); // upcoming, past, enrollments
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            let endpoint = "";
            switch (activeTab) {
                case "upcoming":
                    endpoint = "/admin/upcoming-sessions";
                    break;
                case "past":
                    endpoint = "/admin/past-sessions";
                    break;
                case "enrollments":
                    endpoint = "/admin/enrollments";
                    break;
                default:
                    endpoint = "/admin/upcoming-sessions";
            }
            const result = await request(endpoint);
            setData(result);
        } catch (err) {
            console.error(err);
            // alert("Error fetching data: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    // Filter Logic
    const filteredData = data.filter((item) => {
        const search = searchTerm.toLowerCase();
        if (activeTab === "enrollments") {
            return (
                (item.studentName?.toLowerCase().includes(search)) ||
                (item.tutorName?.toLowerCase().includes(search)) ||
                (item.className?.toLowerCase().includes(search)) ||
                (item.subject?.toLowerCase().includes(search))
            );
        } else {
            // Sessions (Upcoming / Past)
            return (
                (item.classId?.title?.toLowerCase().includes(search)) ||
                (item.classId?.subject?.toLowerCase().includes(search)) ||
                (item.tutorId?.name?.toLowerCase().includes(search)) ||
                (item.studentId?.name?.toLowerCase().includes(search))
            );
        }
    });

    const renderContent = () => {
        if (loading) return <p className="text-center">Loading...</p>;
        if (filteredData.length === 0) return <p className="text-center">No records found.</p>;

        if (activeTab === "enrollments") {
            return (
                <div className="sessions-grid">
                    {filteredData.map((item) => (
                        <div key={item._id} className="session-card">
                            <div style={{ borderBottom: '1px solid #444', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>
                                <strong>{item.className}</strong>
                            </div>
                            <div className="session-detail">
                                <span>Student:</span>
                                <span>{item.studentName}</span>
                            </div>
                            <div className="session-detail">
                                <span>Tutor:</span>
                                <span>{item.tutorName}</span>
                            </div>
                            <div className="session-detail">
                                <span>Subject:</span>
                                <span>{item.subject}</span>
                            </div>
                            <div className="session-detail">
                                <span>Price:</span>
                                <span>${item.price}</span>
                            </div>
                        </div>
                    ))}
                </div>
            );
        }

        // Sessions View (Upcoming & Past)
        return (
            <div className="sessions-grid">
                {filteredData.map((session) => (
                    <div key={session._id} className="session-card">
                        <div style={{ borderBottom: '1px solid #444', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>
                            <strong>{session.classId?.title || "Unknown Class"}</strong>
                        </div>

                        <div className="session-detail">
                            <span>Tutor:</span>
                            <span>{session.tutorId?.name || "Unknown"}</span>
                        </div>
                        <div className="session-detail">
                            <span>Student:</span>
                            <span>{session.studentId?.name || "Unknown"}</span>
                        </div>
                        <div className="session-detail">
                            <span>Scheduled:</span>
                            <span>{new Date(session.startTime).toLocaleString()}</span>
                        </div>
                        <div className="session-detail">
                            <span>Status:</span>
                            <span style={{
                                color: session.status === 'completed' ? 'var(--success)' :
                                    session.status === 'cancelled' ? 'var(--danger)' : 'var(--warning)'
                            }}>
                                {session.status}
                            </span>
                        </div>
                        <div className="session-detail">
                            <span>Duration:</span>
                            <span>{session.classId?.duration || 60} min</span>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="page">
            <h2 style={{ textAlign: "center", fontSize: "2.5rem", marginTop: "2rem", marginBottom: "2rem" }}>
                Admin Dashboard
            </h2>

            {/* Tabs */}
            <div style={{ display: "flex", justifyContent: "center", gap: "2rem", marginBottom: "2rem" }}>
                {["upcoming", "past", "enrollments"].map((tab) => (
                    <h3
                        key={tab}
                        onClick={() => { setActiveTab(tab); setSearchTerm(""); }}
                        style={{
                            cursor: "pointer",
                            borderBottom: activeTab === tab ? "2px solid var(--primary)" : "2px solid transparent",
                            paddingBottom: "10px",
                            color: activeTab === tab ? "var(--primary)" : "var(--text-main)",
                            textTransform: "capitalize"
                        }}
                    >
                        {tab === "upcoming" ? "Upcoming Sessions" : tab === "past" ? "Past Sessions" : "Enrollments"}
                    </h3>
                ))}
            </div>

            {/* Search Bar */}
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <input
                    type="text"
                    placeholder="Filter by name, class, subject..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-bar"
                    style={{ maxWidth: '500px', width: '100%' }}
                />
            </div>

            {renderContent()}
        </div>
    );
};

export default AdminDashboard;
