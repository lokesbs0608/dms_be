const Hub = require("../models/hub");
const Employee = require("../models/employee");

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

        res.status(200).json({ message: "Hub updated successfully", hub: updatedHub });
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

// Get Hub by ID
const getHubById = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate if Hub ID is provided
        if (!id) {
            return res.status(400).json({ message: "Hub ID is required." });
        }

        const hub = await Hub.findById(id)
            .populate("documents_id")
            .populate("manager_id")
            .populate("emergency_person_id");

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

// Get All Hubs
const getAllHubs = async (req, res) => {
    try {
        const hubs = await Hub.find()
            .populate("documents_id")
            .populate("manager_id")
            .populate("emergency_person_id");

        if (!hubs || hubs.length === 0) {
            return res.status(404).json({ message: "No hubs found" });
        }

        res.status(200).json({ hubs });
    } catch (error) {
        // Return error message
        console.error(error); // Log the error for debugging
        res.status(500).json({ message: error.message || "Internal Server Error" });
    }
};

module.exports = { createHub, updateHub, deleteHub, getHubById, getAllHubs };
