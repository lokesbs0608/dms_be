const express = require("express");
const { login, forgotPassword, resetPassword } = require("../controllers/authController");

const router = express.Router();

// Login
router.post("/login", login);

// Forgot Password
router.post("/forgot-password", forgotPassword);

// Reset Password
router.post("/reset-password", resetPassword);

module.exports = router;
