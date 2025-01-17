const express = require("express");
const router = express.Router();
const loaderController = require("../controllers/loaderController");

const authenticate = require("../middleware/auth");

// Create a loader
router.post("/", authenticate, loaderController.createLoader);

// Get all loaders
router.get("/", authenticate, loaderController.getAllLoaders);

// Get loader by ID
router.get("/:id", authenticate, loaderController.getLoaderById);

// Update loader details
router.put("/:id", authenticate, loaderController.updateLoader);

// Archive/Unarchive loader
router.patch("/:id/archiveUnarchiveLoader", authenticate, loaderController.archiveUnarchiveLoader);

// Login
router.post("/login", loaderController.login);

// Forgot Password
router.post("/forgot-password", loaderController.forgotPassword);

// Reset Password
router.post("/reset-password", loaderController.resetPassword);

module.exports = router;
