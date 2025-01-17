const Route = require("../models/routes");

// Create a new route
const createRoute = async (req, res) => {
    try {
        const route = new Route(req.body);
        await route.save();
        res.status(201).json({ message: "Route created successfully", route });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

// Get all routes with optional filters
const getAllRoutes = async (req, res) => {
    try {
        const filters = {};

        if (req.query.hub_id) filters.hub_id = req.query.hub_id;
        if (req.query.branch_id) filters.branch_id = req.query.branch_id;
        if (req.query.from) filters.from = req.query.from;
        if (req.query.to) filters.to = req.query.to;

        const routes = await Route.find(filters).populate("hub_id").populate("branch_id");
        res.status(200).json({ routes });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

// Get a route by ID
const getRouteById = async (req, res) => {
    try {
        const route = await Route.findById(req.params.id).populate("hub_id").populate("branch_id");
        if (!route) return res.status(404).json({ message: "Route not found" });
        res.status(200).json({ route });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

// Update a route by ID
const updateRoute = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const route = await Route.findByIdAndUpdate(id, updates, { new: true });
        if (!route) return res.status(404).json({ message: "Route not found" });

        res.status(200).json({ message: "Route updated successfully", route });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

// Archive a route (soft delete)
const archiveRoute = async (req, res) => {
    try {
        const { id } = req.params;

        const route = await Route.findById(id);
        if (!route) return res.status(404).json({ message: "Route not found" });

        route.status = "Inactive"; // Assuming `status` field exists in the schema
        await route.save();

        res.status(200).json({ message: "Route archived successfully", route });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

// Unarchive a route
const unarchiveRoute = async (req, res) => {
    try {
        const { id } = req.params;

        const route = await Route.findById(id);
        if (!route) return res.status(404).json({ message: "Route not found" });

        route.status = "Active"; // Assuming `status` field exists in the schema
        await route.save();

        res.status(200).json({ message: "Route unarchived successfully", route });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createRoute,
    getAllRoutes,
    getRouteById,
    updateRoute,
    archiveRoute,
    unarchiveRoute,
};
