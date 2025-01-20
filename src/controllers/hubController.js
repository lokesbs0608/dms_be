const Hub = require("../models/hub");;

// Create Hub
const createHub = async (req, res) => {
    try {
        // Check if the user is a super_admin
        if (req.user.role !== "super_admin") {
            return res.status(403).json({ message: "Access Denied. Only Super Admin can create a Hub." });
        }

        const {
            name,
            address,
            documents_id,
            bank_details_id,
            manager_id,
            emergency_person_id,
            landline_number,
            hub_code,
            division,
            pincodes,
            status,
        } = req.body;
        // Validate required fields
        if (!name || !address || !manager_id || !emergency_person_id || !hub_code || !division || !pincodes) {
            return res.status(400).json({ message: "Please provide all required fields." });
        }

        // Create a new hub
        const newHub = new Hub({
            name,
            address,
            documents_id,
            bank_details_id,
            manager_id,
            emergency_person_id,
            landline_number,
            hub_code,
            division,
            pincodes,
            status,
            created_by: req.user.id, // Set created_by as the logged-in user
            updated_by: req.user.id, // Set updated_by initially
        });

        await newHub.save();
        res.status(201).json({ message: "Hub created successfully", hub: newHub });
    } catch (error) {
        // Return error message
        console.error(error); // Log the error for debugging
        res.status(500).json({ message: error.message || "Internal Server Error" });
    }
};

// Update Hub
const updateHub = async (req, res) => {
    try {
        // Check if the user is a super_admin
        if (req.user.role !== "super_admin") {
            return res.status(403).json({ message: "Access Denied. Only Super Admin can update a Hub." });
        }

        const { id } = req.params;

        // Validate if Hub ID is provided
        if (!id) {
            return res.status(400).json({ message: "Hub ID is required." });
        }

        // Find and update the hub
        const updatedHub = await Hub.findByIdAndUpdate(
            id,
            {
                ...req.body,
                updated_by: req.user.id, // Set updated_by as the logged-in user
            },
            { new: true }
        );

        if (!updatedHub) {
            return res.status(404).json({ message: `Hub with ID ${id} not found` });
        }

        res.status(200).json({ message: "Hub updated successfully", });
    } catch (error) {
        // Return error message
        console.error(error); // Log the error for debugging
        res.status(500).json({ message: error.message || "Internal Server Error" });
    }
};

// Delete Hub
const deleteHub = async (req, res) => {
    try {
        // Check if the user is a super_admin
        if (req.user.role !== "super_admin") {
            return res.status(403).json({ message: "Access Denied. Only Super Admin can delete a Hub." });
        }

        const { id } = req.params;

        // Validate if Hub ID is provided
        if (!id) {
            return res.status(400).json({ message: "Hub ID is required." });
        }

        const deletedHub = await Hub.findByIdAndDelete(id);

        if (!deletedHub) {
            return res.status(404).json({ message: `Hub with ID ${id} not found` });
        }

        res.status(200).json({ message: "Hub deleted successfully" });
    } catch (error) {
        // Return error message
        console.error(error); // Log the error for debugging
        res.status(500).json({ message: error.message || "Internal Server Error" });
    }
};


// archive Employee
const archiveHub = async (req, res) => {
    try {
        const { id } = req.params;

        // Check for sufficient role
        if (req.user.role !== "super_admin" && req.user.role !== "admin") {
            return res.status(403).json({
                message: "Access Denied. Only Super Admin or Admin can archive an employee.",
            });
        }

        // Update the hub's status to archived
        const hub = await Hub.findByIdAndUpdate(
            id,
            { status: "Inactive", updated_by: req.user.id, },
            { new: true }
        );

        if (!hub) {
            return res.status(404).json({ message: "Hub not found" });
        }

        res.status(200).json({ message: "Hub archived successfully", });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message || "Internal Server Error" });
    }
};
// archive Employee
const unArchiveHub = async (req, res) => {
    try {
        const { id } = req.params;

        // Check for sufficient role
        if (req.user.role !== "super_admin" && req.user.role !== "admin") {
            return res.status(403).json({
                message: "Access Denied. Only Super Admin or Admin can archive an employee.",
            });
        }

        // Update the hub's status to archived
        const hub = await Hub.findByIdAndUpdate(
            id,
            { status: "Active", updated_by: req.user.id, },
            { new: true }
        );

        if (!hub) {
            return res.status(404).json({ message: "Hub not found" });
        }

        res.status(200).json({ message: "Hub archived successfully", });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message || "Internal Server Error" });
    }
};

// Get Hub by ID
const getHubById = async (req, res) => {
    // Check if the user has sufficient role to view employees
    if (req.user.role !== "super_admin" && req.user.role !== "admin") {
        return res.status(403).json({
            message: "Access Denied.",
        });
    }

    try {
        const { id } = req.params;

        // Validate if Hub ID is provided
        if (!id) {
            return res.status(400).json({ message: "Hub ID is required." });
        }

        const hub = await Hub.findById(id)
            .populate("documents_id")
            .populate("bank_details_id")


        if (!hub) {
            return res.status(404).json({ message: `Hub with ID ${id} not found` });
        }

        res.status(200).json({ hub });
    } catch (error) {
        // Return error message
        console.error(error); // Log the error for debugging
        res.status(500).json({ message: error.message || "Internal Server Error" });
    }
};

// Get All Hubs with filters
const getAllHubs = async (req, res) => {
    // Check if the user has sufficient role to view hubs
    if (req.user.role !== "super_admin" && req.user.role !== "admin") {
        return res.status(403).json({
            message: "Access Denied. Only Super Admin or Admin can view hubs.",
        });
    }

    try {
        // Build filter object from query parameters
        let filter = {};

        // Apply filters based on query parameters
        if (req.query.branch_id) filter["branch_id"] = req.query.branch_id;
        if (req.query.hub_code) filter["hub_code"] = req.query.hub_code;
        if (req.query.division) filter["division"] = req.query.division;
        if (req.query.status) filter["status"] = req.query.status; // Active or Inactive
        if (req.query.manager_id) filter["manager_id"] = req.query.manager_id;
        if (req.query.emergency_person_id) filter["emergency_person_id"] = req.query.emergency_person_id;
        if (req.query.pincode) filter["pincodes"] = req.query.pincode; // If you want to filter by pincode as well

        // You can extend the filters further based on other fields in your Hub schema

        // Get hubs with populated fields and filter applied
        const hubs = await Hub.find(filter)
            .populate("documents_id")
            .populate("manager_id")
            .populate("emergency_person_id")
            .populate("bank_details_id");

        if (!hubs || hubs.length === 0) {
            return res.status(404).json({ message: "No hubs found matching the filters" });
        }

        res.status(200).json({ hubs });
    } catch (error) {
        console.error(error); // Log the error for debugging
        res.status(500).json({ message: error.message || "Internal Server Error" });
    }
};


module.exports = { createHub, updateHub, deleteHub, getHubById, getAllHubs, archiveHub, unArchiveHub };
