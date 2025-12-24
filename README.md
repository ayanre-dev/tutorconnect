# TutorConnect 

**TutorConnect** is a modern, secure, and real-time tutoring platform designed to facilitate seamless learning between students and tutors. This project emphasizes modern web architecture and **Information Security (Infosec)** principles.

---

##  Key Features

###  Role-Based Experience
- **Tutor Dashboard**: Create courses, manage student enrollments, schedule live sessions, and host video classes.
- **Student Dashboard**: Browse the marketplace, enroll in courses, and join scheduled live tutoring sessions.
- **Course Marketplace**: A searchable library of available courses filtered by subject and price.

###  Live Collaboration
- **Real-Time Video**: Low-latency video/audio streaming powered by **WebRTC** (Simple-Peer).
- **Interactive Chat**: Instant messaging during sessions using **Socket.io**.
- **Responsive UI**: A glassmorphism-inspired design that works across all modern browsers.

---

##  Information Security (Infosec) Highlights
Security is at the core of TutorConnect. Key implementations include:

- **JWT Authentication**: All API requests are secured via **JSON Web Tokens**.
- **Password Protection**: Passwords are never stored in plain text; they are hashed using **bcryptjs** on the backend.
- **Route Guards**: Frontend pages (Dashboards, Classrooms) are protected by a client-side **ProtectedRoute** mechanism.
- **Data Integrity**: Centralized API handlers ensure every sensitive transaction is authenticated.
- **CORS Management**: Backend configurations strictly control which origins can access the API.

---

##  Technical Architecture

### Frontend
- **React 18**: Component-based UI logic.
- **Vite**: Ultra-fast build tool and development server.
- **Context API**: Global state management for user sessions (`AuthContext`).
- **React Router v6**: Dynamic navigation and protected routing.

### Backend
- **Node.js & Express**: Scalable server-side logic and RESTful API.
- **MongoDB & Mongoose**: NoSQL database for flexible data modeling.
- **Socket.io**: Real-time signaling and bidirectional communication.

---

## ⚙️ Quick Start Guide

### 1. Prerequisites
- **Node.js**: v18.x or higher
- **MongoDB**: Local instance or MongoDB Atlas URI
- **ngrok**: Required for remote tunneling (mobile/frontend deployment)

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/yourusername/tutorconnect.git
cd tutorconnect

# Setup Backend
cd backend && npm install
cp .env.example .env  # Update MONGO_URI and JWT_SECRET

# Setup Frontend
cd ../frontend && npm install
```

### 3. Local Development
```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend
cd frontend && npm run dev
```

---

##  Project Structure

```text
Tutorconnect_IS_Project/
├── frontend/                # React SPA
│   ├── src/
│   │   ├── context/        # Auth state (AuthContext)
│   │   ├── pages/          # Layout & Screen components
│   │   ├── components/     # Reusable UI (Navbar, Chat)
│   │   └── api.js          # Centralized API logic
│
├── backend/                # Express API
│   ├── models/            # Database Schemas
│   ├── controllers/        # Business Logic
│   └── server.js          # Socket & Server Entry
```

---

