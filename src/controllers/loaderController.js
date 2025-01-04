const Loader = require("../models/loader");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const transporter = require("../config/transporter");

// Create Loader
const createLoader = async (req, res) => {
    try {
        const { code, name, documents_ids, location, account_id, status, company_name, email, username, password } = req.body;

        const existingLoader = await Loader.findOne({ username });
        if (existingLoader) {
            return res.status(400).json({ message: "Username already exists" });
        }

        const newLoader = new Loader({
            code,
            name,
            documents_ids,
            location,
            account_id,
            status,
            company_name,
            email,
            username,
            password
        });

        await newLoader.save();
        res.status(201).json({ message: "Loader created successfully", loader: newLoader });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

// Get All Loaders with Filtering
const getAllLoaders = async (req, res) => {
    try {
        const { status, name, company_name } = req.query;

        const filter = {};
        if (status) filter.status = status;
        if (name) filter.name = { $regex: name, $options: "i" };
        if (company_name) filter.company_name = { $regex: company_name, $options: "i" };

        const loaders = await Loader.find(filter);
        res.status(200).json(loaders);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

// Get Loader by ID
const getLoaderById = async (req, res) => {
    try {
        const loader = await Loader.findById(req.params.id);
        if (!loader) return res.status(404).json({ message: "Loader not found" });
        res.status(200).json(loader);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

// Update Loader
const updateLoader = async (req, res) => {
    try {
        const loader = await Loader.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!loader) return res.status(404).json({ message: "Loader not found" });
        res.status(200).json({ message: "Loader updated successfully", loader });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

// Archive/Unarchive Loader
const archiveUnarchiveLoader = async (req, res) => {
    try {
        const loader = await Loader.findById(req.params.id);
        if (!loader) return res.status(404).json({ message: "Loader not found" });

        // Toggle the status between Active and Inactive
        loader.status = loader.status === "Active" ? "Inactive" : "Active";
        await loader.save();

        res.status(200).json({ message: `Loader ${loader.status === "Active" ? "unarchived" : "archived"} successfully`, loader });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

// Login (Authentication)
const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        const loader = await Loader.findOne({ username });
        if (!loader) {
            return res.status(400).json({ message: "Invalid username or password" });
        }

        // Check if loader is active
        if (loader.status !== "Active") {
            return res.status(400).json({ message: "Your account is archived. Please contact support." });
        }

        const isMatch = await bcrypt.compare(password, loader.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid username or password" });
        }

        const token = jwt.sign({ id: loader._id, role: "loader" }, process.env.JWT_SECRET, { expiresIn: "1h" });

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
        const loader = await Loader.findOne({ email });
        if (!loader) {
            return res.status(404).json({ message: "Loader not found" });
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
        loader.resetOtp = otp;
        loader.resetOtpExpiration = Date.now() + 10 * 60 * 1000; // OTP valid for 10 minutes
        await loader.save();

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

        const loader = await Loader.findOne({ email });
        if (!loader) {
            return res.status(404).json({ message: "Loader not found" });
        }

        if (loader.resetOtp !== otp || Date.now() > loader.resetOtpExpiration) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        loader.password = newPassword; // Update password
        loader.resetOtp = null; // Clear OTP
        loader.resetOtpExpiration = null; // Clear OTP expiration
        await loader.save();

        res.status(200).json({ message: "Password reset successful" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createLoader,
    getAllLoaders,
    getLoaderById,
    updateLoader,
    archiveUnarchiveLoader,
    login,
    forgotPassword,
    resetPassword,
};
