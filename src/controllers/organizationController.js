const Organization = require("../models/organization");

// Create a new organization
exports.createOrganization = async (req, res) => {
    try {
        const newOrganization = new Organization(req.body);
        const savedOrganization = await newOrganization.save();
        res.status(201).json({ success: true, data: savedOrganization });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// Get all organizations with optional filters
exports.getAllOrganizations = async (req, res) => {
    try {
        const filters = {};
        if (req.query.company_name) filters.company_name = req.query.company_name;
        if (req.query.email) filters.email = req.query.email;

        const organizations = await Organization.find(filters);
        res.status(200).json({ success: true, data: organizations });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Get a specific organization by ID
exports.getOrganizationById = async (req, res) => {
    try {
        const organization = await Organization.findById(req.params.id);
        if (!organization) {
            return res.status(404).json({ success: false, message: "Organization not found" });
        }
        res.status(200).json({ success: true, data: organization });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Update an organization by ID
exports.updateOrganization = async (req, res) => {
    try {
        const updatedOrganization = await Organization.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!updatedOrganization) {
            return res.status(404).json({ success: false, message: "Organization not found" });
        }
        res.status(200).json({ success: true, data: updatedOrganization });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// Archive an organization
exports.archiveOrganization = async (req, res) => {
    try {
        const organization = await Organization.findByIdAndUpdate(
            req.params.id,
            { status: "Archived" }, // Assuming there's a `status` field in the schema
            { new: true }
        );
        if (!organization) {
            return res.status(404).json({ success: false, message: "Organization not found" });
        }
        res.status(200).json({ success: true, message: "Organization archived successfully", data: organization });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Unarchive an organization
exports.unarchiveOrganization = async (req, res) => {
    try {
        const organization = await Organization.findByIdAndUpdate(
            req.params.id,
            { status: "Active" }, // Assuming `Active` is the default status
            { new: true }
        );
        if (!organization) {
            return res.status(404).json({ success: false, message: "Organization not found" });
        }
        res.status(200).json({ success: true, message: "Organization unarchived successfully", data: organization });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
