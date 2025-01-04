const express = require("express");
const router = express.Router();
const customerController = require("../controllers/customerController");
const authMiddleware = require("../middleware/auth");

// Public Routes
router.post("/login", customerController.loginCustomer);
router.post("/forgot-password", customerController.forgotPassword);
router.post("/reset-password", customerController.resetCustomerPassword);

// Protected Routes (require authentication)
router.post("/register", authMiddleware, customerController.createCustomer);
router.get("/all", authMiddleware, customerController.getAllCustomers);
router.get("/:id", authMiddleware, customerController.getCustomerById);
router.put("/:id", authMiddleware, customerController.updateCustomer);
router.delete("/:id", authMiddleware, customerController.archiveCustomer);
router.put("/:id/unarchive", authMiddleware, customerController.unarchiveCustomer);

module.exports = router;
