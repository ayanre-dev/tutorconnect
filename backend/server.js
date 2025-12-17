import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import connectDB from "./db.js";

import userRoutes from "./routes/userRoutes.js";
import classRoutes from "./routes/classRoutes.js";
import sessionRoutes from "./routes/sessionRoutes.js";

dotenv.config();
connectDB();

const app = express();
app.use(express.json());

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  methods: ["GET","POST","PUT","DELETE","OPTIONS"],
  credentials: true
}));

// Routes
app.use("/api/users", userRoutes);
app.use("/api/classes", classRoutes);
app.use("/api/sessions", sessionRoutes);

// Health check
app.get("/api/health", (req, res) => res.json({ status: "ok" }));

// Socket.io / WebRTC Server
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins for testing
    methods: ["GET","POST"]
  }
});


const users = {}; // Room ID -> Array of Socket IDs

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("join-room", (room) => {
    socket.join(room);
    
    // Initialize room if not exists
    if (!users[room]) {
        users[room] = [];
    }

    // Send existing users to the new joiner ONLY
    const usersInRoom = users[room].filter(id => id !== socket.id);
    socket.emit("all-users", usersInRoom);

    // Add new user to room list
    users[room].push(socket.id);

    // Notify others that a user joined (for their UI updates, or late connections if needed)
    socket.to(room).emit("user-joined", { socketId: socket.id });
  });

  socket.on("webrtc-offer", ({ room, offer, to }) => {
    if (to) {
      io.to(to).emit("webrtc-offer", { from: socket.id, offer });
    }
  });

  socket.on("webrtc-answer", ({ room, answer, to }) => {
    if (to) {
      io.to(to).emit("webrtc-answer", { from: socket.id, answer });
    }
  });

  socket.on("webrtc-candidate", ({ room, candidate, to }) => {
    if (to) {
      io.to(to).emit("webrtc-candidate", { from: socket.id, candidate });
    }
  });

  // Chat Event
  socket.on("chat-message", ({ room, message, username }) => {
    // Broadcast to everyone in the room INCLUDING sender (simplifies frontend logic)
    // or just to others if you append locally. Let's broadcast to others for now 
    // and assume sender appends locally, OR use io.to(room) to send to all.
    // Standard pattern: broadcast to others, sender handles own UI.
    socket.to(room).emit("chat-message", { from: socket.id, message, username });
  });

  socket.on("disconnect", () => {
    // Remove user from all rooms they were in
    for (const room in users) {
        if (users[room].includes(socket.id)) {
            users[room] = users[room].filter(id => id !== socket.id);
            // Notify room of disconnection
            socket.to(room).emit("user-disconnected", socket.id);
        }
    }
  });
});


const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});