import Class from "../models/Class.js";

export const createClass = async (req, res) => {
  try {
    if (req.user.role !== "tutor") return res.status(403).json({ message: "Only tutors can create classes" });

    const { title, subject, description, price, duration } = req.body;
    const newClass = await Class.create({
      tutorId: req.user._id,
      title,
      subject,
      description,
      price,
      duration
    });

    res.status(201).json(newClass);
  } catch (err) {
    console.error("Create class error:", err);
    res.status(400).json({ message: err.message });
  }
};

export const getClassesByTutor = async (req, res) => {
  try {
    const classes = await Class.find({ tutorId: req.params.tutorId })
      .populate("tutorId", "name email")
      .populate("students", "name email");
    res.json(classes);
  } catch (err) {
    console.error("Get classes error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const getAllClasses = async (req, res) => {
  try {
    const classes = await Class.find().populate("tutorId", "name email");
    res.json(classes);
  } catch (err) {
    console.error("Get all classes error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const enrollInClass = async (req, res) => {
  try {
    const { classId } = req.body;
    const studentId = req.user._id;

    const classData = await Class.findById(classId);
    if (!classData) return res.status(404).json({ message: "Class not found" });

    if (classData.students.includes(studentId)) {
      return res.status(400).json({ message: "Already enrolled" });
    }

    classData.students.push(studentId);
    await classData.save();

    res.status(200).json({ message: "Enrolled successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};