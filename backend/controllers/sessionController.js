import Session from "../models/Session.js";
import Class from "../models/Class.js";

export const createSession = async (req, res) => {
  try {
    const { classId, startTime } = req.body;
    if (!classId || !startTime) return res.status(400).json({ message: "classId and startTime required" });

    const classData = await Class.findById(classId);
    if (!classData) return res.status(404).json({ message: "Class not found" });

    const session = await Session.create({
      classId,
      tutorId: classData.tutorId,
      studentId: req.user._id,
      startTime: new Date(startTime),
      status: "scheduled"
    });

    if (!classData.students.includes(req.user._id)) {
      classData.students.push(req.user._id);
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
