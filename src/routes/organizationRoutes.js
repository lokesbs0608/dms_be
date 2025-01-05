const express = require("express");
const router = express.Router();
const organizationController = require("../controllers/organizationController");

// Create a new organization
router.post("/", organizationController.createOrganization);

// Get all organizations with optional filters
router.get("/", organizationController.getAllOrganizations);

// Get a specific organization by ID
router.get("/:id", organizationController.getOrganizationById);

// Update an organization by ID
router.put("/:id", organizationController.updateOrganization);

// Archive an organization by ID
router.patch("/:id/archive", organizationController.archiveOrganization);

// Unarchive an organization by ID
router.patch("/:id/unarchive", organizationController.unarchiveOrganization);

module.exports = router;
