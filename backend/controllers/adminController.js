import User from "../models/User.js";
import Session from "../models/Session.js";
import Class from "../models/Class.js";

export const getUpcomingSessions = async (req, res) => {
    try {
        const now = new Date();
        // Upcoming: startTime > now OR status is 'scheduled' (and not completed/cancelled)
        // We'll rely on time predominantly as status might not always be updated perfectly
        const sessions = await Session.find({
            $or: [
                { startTime: { $gt: now }, status: { $ne: "cancelled" } },
                { status: "scheduled" }
            ]
        })
            .populate("tutorId", "name email")
            .populate("studentId", "name email")
            .populate("classId", "title subject")
            .sort({ startTime: 1 }); // Ascending order (soonest first)

        res.json(sessions);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const getPastSessions = async (req, res) => {
    try {
        const now = new Date();
        // Past: endTime < now OR status is 'completed'
        const sessions = await Session.find({
            $or: [
                { endTime: { $lt: now } },
                { status: "completed" }
            ]
        })
            .populate("tutorId", "name email")
            .populate("studentId", "name email")
            .populate("classId", "title subject")
            .sort({ startTime: -1 }); // Descending order (most recent first)

        res.json(sessions);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const getAllEnrollments = async (req, res) => {
    try {
        // We need to find all classes that have students enrolled
        // Then flatten the data to show: Student Name, Class Name, Tutor Name

        // 1. Get all classes with populated students
        const classes = await Class.find({ students: { $exists: true, $not: { $size: 0 } } })
            .populate("tutorId", "name email")
            .populate("students", "name email");

        const enrollments = [];

        classes.forEach(cls => {
            cls.students.forEach(student => {
                enrollments.push({
                    _id: `${cls._id}-${student._id}`, // unique key
                    studentName: student.name,
                    studentEmail: student.email,
                    tutorName: cls.tutorId?.name,
                    tutorEmail: cls.tutorId?.email,
                    className: cls.title,
                    subject: cls.subject,
                    price: cls.price,
                    enrolledAt: cls.createdAt // approximating enrollment date to class creation or we need to look into if we track enrollment date separately. (We don't seems like)
                });
            });
        });

        res.json(enrollments);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
