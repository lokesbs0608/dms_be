const Account = require("../models/account");

// Create Account
const createAccount = async (req, res) => {
    if (req.user.role !== "super_admin" && req.user.role !== "admin") {
        return res.status(403).json({
            message: "Access Denied. Only Super Admin or Admin can create an account.",
        });
    }
    try {
        const { account_number, IFSC, bank_name, micr_code, account_holder_name } = req.body;

        const account = new Account({
            account_number,
            IFSC,
            bank_name,
            micr_code,
            account_holder_name,
            verified: false, // Default verification status
        });

        await account.save();
        res.status(201).json({ message: "Account created successfully", account });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

// Get Account by ID
const getAccountById = async (req, res) => {
    if (req.user.role !== "super_admin" && req.user.role !== "admin") {
        return res.status(403).json({
            message: "Access Denied. Only Super Admin or Admin can view an account.",
        });
    }
    try {
        const { id } = req.params;
        const account = await Account.findById(id);
        if (!account) {
            return res.status(404).json({ message: "Account not found" });
        }
        res.status(200).json({ account });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

// Update Account by ID
const updateAccountById = async (req, res) => {
    if (req.user.role !== "super_admin" && req.user.role !== "admin") {
        return res.status(403).json({
            message: "Access Denied. Only Super Admin or Admin can update an account.",
        });
    }
    try {
        const { id } = req.params;
        const updatedData = req.body;

        const account = await Account.findByIdAndUpdate(id, updatedData, {
            new: true,
        });

        if (!account) {
            return res.status(404).json({ message: "Account not found" });
        }
        res.status(200).json({ message: "Account updated successfully", account });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

const archiveAccountById = async (req, res) => {
    if (req.user.role !== "super_admin" && req.user.role !== "admin") {
        return res.status(403).json({
            message: "Access Denied. Only Super Admin or Admin can archive an account.",
        });
    }
    try {
        const { id } = req.params;

        // Find the account
        const account = await Account.findById(id);

        if (!account) {
            return res.status(404).json({ message: "Account not found" });
        }

        // Calculate the age of the account from its creation date
        const accountAge = new Date() - new Date(account.createdAt);
        const sixMonthsInMillis = 6 * 30 * 24 * 60 * 60 * 1000; // 6 months in milliseconds

        if (accountAge >= sixMonthsInMillis) {
            // Archive the account by updating its status and adding the archived_at timestamp
            account.status = "Archived";
            account.archived_at = new Date();
            await account.save();
            return res.status(200).json({ message: "Account archived successfully", account });
        } else {
            return res.status(400).json({
                message: "Account is not older than 6 months and cannot be archived yet.",
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

const unarchiveAccountById = async (req, res) => {
    if (req.user.role !== "super_admin" && req.user.role !== "admin") {
        return res.status(403).json({
            message: "Access Denied. Only Super Admin or Admin can unarchive an account.",
        });
    }
    try {
        const { id } = req.params;

        // Find the account
        const account = await Account.findById(id);

        if (!account) {
            return res.status(404).json({ message: "Account not found" });
        }

        // Check if the account is archived
        if (account.status !== "Archived") {
            return res.status(400).json({
                message: "Account is not archived and cannot be unarchived.",
            });
        }

        // Unarchive the account by updating its status to Active
        account.status = "Active";
        account.archived_at = null; // Remove the archived timestamp
        await account.save();

        return res.status(200).json({ message: "Account unarchived successfully", account });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createAccount,
    getAccountById,
    updateAccountById,
    archiveAccountById,
    unarchiveAccountById
};
