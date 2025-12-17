import Session from "../models/Session.js";
import Class from "../models/Class.js";

export const createSession = async (req, res) => {
  try {
    const { classId, startTime, studentId: bodyStudentId } = req.body;
    if (!classId || !startTime) return res.status(400).json({ message: "classId and startTime required" });

    const classData = await Class.findById(classId);
    if (!classData) return res.status(404).json({ message: "Class not found" });

    // Logic: If Tutor, use provided studentId. If Student, use self.
    let targetStudentId = req.user._id;
    if (req.user.role === "tutor") {
      if (!bodyStudentId) return res.status(400).json({ message: "Student ID required for tutor-scheduled sessions" });
      targetStudentId = bodyStudentId;
    }

    const session = await Session.create({
      classId,
      tutorId: classData.tutorId,
      studentId: targetStudentId,
      startTime: new Date(startTime),
      status: "scheduled"
    });

    if (!classData.students.includes(targetStudentId)) {
      classData.students.push(targetStudentId);
      await classData.save();
    }

    res.status(201).json(session);
  } catch (err) {
    console.error("Create session error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const getSessionsForUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    const sessions = await Session.find({
      $or: [{ tutorId: userId }, { studentId: userId }]
    }).populate("classId tutorId studentId", "title name email");
    res.json(sessions);
  } catch (err) {
    console.error("Get user sessions error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const endSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await Session.findById(sessionId);

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    // Optional: specific authorization check (e.g. only tutor or student of this session can end it)
    if (session.tutorId.toString() !== req.user._id.toString() && session.studentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to end this session" });
    }

    session.status = "completed";
    session.endTime = Date.now();
    await session.save();

    res.json({ message: "Session ended", session });
  } catch (err) {
    console.error("End session error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const deleteSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await Session.findById(sessionId);

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    // Authorization: Only the tutor (or maybe student?) can delete. 
    // Usually only Tutor cancels.
    if (session.tutorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this session" });
    }

    await Session.findByIdAndDelete(sessionId);
    res.json({ message: "Session deleted" });
  } catch (err) {
    console.error("Delete session error:", err);
    res.status(500).json({ message: err.message });
  }
};
