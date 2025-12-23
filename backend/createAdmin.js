import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "./models/User.js";

dotenv.config();

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        const adminEmail = "admin@tutorconnect.com";
        const plainPassword = "adminpassword123";
        const hashedPassword = await bcrypt.hash(plainPassword, 10);

        const existingAdmin = await User.findOne({ email: adminEmail });
        if (existingAdmin) {
            console.log("Admin user already exists. Updating password...");
            existingAdmin.password = hashedPassword;
            await existingAdmin.save();
            console.log("Admin password updated successfully.");
        } else {
            const admin = new User({
                name: "Super Admin",
                email: adminEmail,
                password: hashedPassword,
                role: "admin"
            });
            await admin.save();
            console.log("Admin user created successfully");
        }

        console.log("Email:", adminEmail);
        console.log("Password:", plainPassword);

        process.exit(0);
    } catch (err) {
        console.error("Error creating/updating admin:", err);
        process.exit(1);
    }
};

createAdmin();

createAdmin();
