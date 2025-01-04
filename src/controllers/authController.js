const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const transporter = require("../config/trasnporter");
const Employee = require("../models/employee");
const crypto = require("crypto");



// Login API - Generates JWT
const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        const employee = await Employee.findOne({ username });
        if (!employee) {
            return res.status(400).json({ message: "Invalid username or password" });
        }

        const isMatch = await employee.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid username or password" });
        }

        const token = jwt.sign({ id: employee._id, role: employee.role }, process.env.JWT_SECRET, {
            expiresIn: "1h",
        });

        res.status(200).json({ message: "Login successful", token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

// Forgot Password - Sends OTP
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const employee = await Employee.findOne({ email });
        if (!employee) {
            return res.status(404).json({ message: "Employee not found" });
        }

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Send OTP via email
        const mailOptions = {
            from: process.env.GMAIL_USER,
            to: email,
            subject: "Password Reset OTP",
            text: `Your OTP for password reset is: ${otp}`,
        };

        await transporter.sendMail(mailOptions);

        // Store OTP in the database (for validation during reset)
        employee.resetOtp = otp;
        employee.resetOtpExpiration = Date.now() + 10 * 60 * 1000; // OTP valid for 10 minutes
        await employee.save();

        res.status(200).json({ message: "OTP sent successfully to your email" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

// Reset Password - Validates OTP and Resets Password
const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        const employee = await Employee.findOne({ email });
        if (!employee) {
            return res.status(404).json({ message: "Employee not found" });
        }

        if (employee.resetOtp !== otp || Date.now() > employee.resetOtpExpiration) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        employee.password = newPassword; // Update password
        employee.resetOtp = null; // Clear OTP
        employee.resetOtpExpiration = null; // Clear OTP expiration
        await employee.save();

        res.status(200).json({ message: "Password reset successful" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = { login, forgotPassword, resetPassword };
