const express = require("express");
const router = express.Router();
const {
    createBranch,
    getBranchById,
    getAllBranches,
    updateBranch,
    archiveBranch,
    unarchiveBranch,
} = require("../controllers/branchController");

// Middleware to check authentication
const authenticate = require("../middleware/auth");

// Routes
router.post("/", authenticate, createBranch); // Create branch
router.get("/:id", authenticate, getBranchById); // Get branch by ID
router.get("/", authenticate, getAllBranches); // Get all branches with filters
router.put("/:id", authenticate, updateBranch); // Update branch
router.patch("/:id/archive", authenticate, archiveBranch); // Archive branch
router.patch("/:id/unarchive", authenticate, unarchiveBranch); // Unarchive branch

module.exports = router;
