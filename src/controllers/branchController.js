const Branch = require("../models/branch");

// Create a Branch
const createBranch = async (req, res) => {
    try {
        const branchData = req.body;
        // Check if the user is a super_admin
        if (req.user.role !== "super_admin" && req.user.role != 'admin') {
            return res.status(403).json({ message: "Access Denied. Only Super Admin or Admin can create a Branch." });
        }

        const branch = await Branch.create({
            ...branchData,
            created_by: req.user._id,
        });

        res.status(201).json({ message: "Branch created successfully", branch });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message || "Internal Server Error" });
    }
};

// Get a Branch by ID
const getBranchById = async (req, res) => {
    if (req.user.role !== "super_admin" && req.user.role !== "admin") {
        return res.status(403).json({ message: "Access Denied" });
    }

    try {
        const { id } = req.params;

        const branch = await Branch.findById(id)
            .populate("documents_id")
            .populate("manager_id")
            .populate("emergency_person_id")
            .populate("hub_id")
            .populate("bank_details_id");

        if (!branch) return res.status(404).json({ message: "Branch not found" });

        res.status(200).json({ branch });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message || "Internal Server Error" });
    }
};

// Get All Branches with Filters
const getAllBranches = async (req, res) => {
    if (req.user.role !== "super_admin" && req.user.role !== "admin") {
        return res.status(403).json({ message: "Access Denied" });
    }

    try {
        const filters = {};
        if (req.query.hub_id) filters["hub_id"] = req.query.hub_id;
        if (req.query.manager_id) filters["manager_id"] = req.query.manager_id;
        if (req.query.branch_code) filters["branch_code"] = req.query.branch_code;
        if (req.query.status) filters["status"] = req.query.status; // Active or Inactive

        const branches = await Branch.find(filters)
            .populate("documents_id")
            .populate("manager_id")
            .populate("emergency_person_id")
            .populate("hub_id")
            .populate("bank_details_id");

        if (!branches || branches.length === 0) {
            return res.status(404).json({ message: "No branches found" });
        }

        res.status(200).json({ branches });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message || "Internal Server Error" });
    }
};

// Update a Branch
const updateBranch = async (req, res) => {
    if (req.user.role !== "super_admin" && req.user.role !== "admin") {
        return res.status(403).json({ message: "Access Denied" });
    }

    try {
        const { id } = req.params;
        const branchData = req.body;

        const updatedBranch = await Branch.findByIdAndUpdate(
            id,
            { ...branchData, updated_by: req.user._id },
            { new: true }
        );

        if (!updatedBranch) return res.status(404).json({ message: "Branch not found" });

        res.status(200).json({ message: "Branch updated successfully", updatedBranch });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message || "Internal Server Error" });
    }
};

// Delete (Archive) a Branch
const archiveBranch = async (req, res) => {
    if (req.user.role !== "super_admin" && req.user.role !== "admin") {
        return res.status(403).json({ message: "Access Denied" });
    }

    try {
        const { id } = req.params;

        const branch = await Branch.findByIdAndUpdate(
            id,
            { status: "Inactive", updated_by: req.user._id },
            { new: true }
        );

        if (!branch) return res.status(404).json({ message: "Branch not found" });

        res.status(200).json({ message: "Branch archived successfully", branch });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message || "Internal Server Error" });
    }
};

// Unarchive a Branch
const unarchiveBranch = async (req, res) => {
    if (req.user.role !== "super_admin" && req.user.role !== "admin") {
        return res.status(403).json({ message: "Access Denied" });
    }

    try {
        const { id } = req.params;

        const branch = await Branch.findByIdAndUpdate(
            id,
            { status: "Active", updated_by: req.user._id },
            { new: true }
        );

        if (!branch) return res.status(404).json({ message: "Branch not found" });

        res.status(200).json({ message: "Branch unarchived successfully", branch });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message || "Internal Server Error" });
    }
};

module.exports = {
    createBranch,
    getBranchById,
    getAllBranches,
    updateBranch,
    archiveBranch,
    unarchiveBranch,
};
