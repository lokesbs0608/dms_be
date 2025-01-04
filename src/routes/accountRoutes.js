const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/auth");

const {
    createAccount,
    getAccountById,
    updateAccountById,
    archiveAccountById,
    unarchiveAccountById
} = require("../controllers/accountController");

// Create Account (Accessible only by super_admin and admin)
router.post("/", authenticate, createAccount);

// Get Account by ID (Accessible only by super_admin and admin)
router.get("/:id", authenticate, getAccountById);

// Update Account by ID (Accessible only by super_admin and admin)
router.put("/:id", authenticate, updateAccountById);

// Archive Account by ID (Accessible only by super_admin and admin)
router.put("/:id/archive", authenticate, archiveAccountById);

// Unarchive Account by ID (Accessible only by super_admin and admin)
router.put("/:id/unarchive", authenticate, unarchiveAccountById); // Use PUT method for unarchiving

module.exports = router;
