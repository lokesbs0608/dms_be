const Vehicle = require("../models/vehicles")
const mongoose = require("mongoose");

// Create a new vehicle
const createVehicle = async (req, res) => {
    try {
        const vehicle = new Vehicle(req.body);
        await vehicle.save();
        res.status(201).json({ message: "Vehicle created successfully", vehicle });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

// Get all vehicles with optional filters
const getAllVehicles = async (req, res) => {
    try {
        const filters = {};

        // Applying filters from query params
        if (req.query.brand) {
            filters.brand = req.query.brand;
        }
        if (req.query.type) {
            filters.type = req.query.type;
        }
        if (req.query.status) {
            filters.status = req.query.status;
        }

        // Fetch vehicles with filters
        const vehicles = await Vehicle.find(filters).populate("documents");
        res.status(200).json({ vehicles });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

// Get vehicle by ID
const getVehicleById = async (req, res) => {
    try {
        const vehicle = await Vehicle.findById(req.params.id).populate("documents");
        if (!vehicle) {
            return res.status(404).json({ message: "Vehicle not found" });
        }
        res.status(200).json({ vehicle });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

// Update vehicle details
const updateVehicle = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const vehicle = await Vehicle.findByIdAndUpdate(id, updates, { new: true });
        if (!vehicle) {
            return res.status(404).json({ message: "Vehicle not found" });
        }

        res.status(200).json({ message: "Vehicle updated successfully", vehicle });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

// Archive vehicle (set status to "archived")
const archiveVehicle = async (req, res) => {
    try {
        const { id } = req.params;

        const vehicle = await Vehicle.findById(id);
        if (!vehicle) {
            return res.status(404).json({ message: "Vehicle not found" });
        }

        vehicle.status = "Archived"; // Set status to archived
        await vehicle.save();

        res.status(200).json({ message: "Vehicle archived successfully", vehicle });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

// Unarchive vehicle (set status to "Active")
const unarchiveVehicle = async (req, res) => {
    try {
        const { id } = req.params;

        const vehicle = await Vehicle.findById(id);
        if (!vehicle) {
            return res.status(404).json({ message: "Vehicle not found" });
        }

        vehicle.status = "Active"; // Set status to active
        await vehicle.save();

        res.status(200).json({ message: "Vehicle unarchived successfully", vehicle });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

// Export all the methods for use in routes
module.exports = {
    createVehicle,
    getAllVehicles,
    getVehicleById,
    updateVehicle,
    archiveVehicle,
    unarchiveVehicle
};
