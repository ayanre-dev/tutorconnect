import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import connectDB from "./db.js";

import userRoutes from "./routes/userRoutes.js";
import classRoutes from "./routes/classRoutes.js";
import sessionRoutes from "./routes/sessionRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";

dotenv.config();
connectDB();

const app = express();
app.use(express.json());

app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  methods: ["GET","POST","PUT","DELETE","OPTIONS"],
  credentials: true
}));

app.use("/api/users", userRoutes);
app.use("/api/classes", classRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/payments", paymentRoutes);

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET","POST"]
  }
});

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("join-room", (room) => {
    socket.join(room);
    socket.to(room).emit("user-joined", { socketId: socket.id });
  });

  socket.on("leave-room", (room) => {
    socket.leave(room);
    socket.to(room).emit("user-left", { socketId: socket.id });
  });

  socket.on("webrtc-offer", ({ room, offer, to }) => {
    if (to) {
      io.to(to).emit("webrtc-offer", { from: socket.id, offer });
    } else {
      socket.to(room).emit("webrtc-offer", { from: socket.id, offer });
    }
  });

  socket.on("webrtc-answer", ({ room, answer, to }) => {
    if (to) {
      io.to(to).emit("webrtc-answer", { from: socket.id, answer });
    } else {
      socket.to(room).emit("webrtc-answer", { from: socket.id, answer });
    }
  });

  socket.on("webrtc-candidate", ({ room, candidate, to }) => {
    if (to) {
      io.to(to).emit("webrtc-candidate", { from: socket.id, candidate });
    } else {
      socket.to(room).emit("webrtc-candidate", { from: socket.id, candidate });
    }
  });

  socket.on("chat-message", ({ room, message, user }) => {
    socket.to(room).emit("chat-message", { message, user, from: socket.id, time: new Date() });
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
