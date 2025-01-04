const express = require("express");
const { createEmployee, updateEmployee, deleteEmployee, getEmployeeById, getAllEmployees } = require("../controllers/employeeController");
const authenticate = require("../middleware/auth");
const router = express.Router();

// Employee CRUD Routes
router.post("/", authenticate, createEmployee);
router.put("/:id", authenticate, updateEmployee);
router.delete("/:id", authenticate, deleteEmployee);
router.get("/:id", authenticate, getEmployeeById);
router.get("/", authenticate, getAllEmployees);

module.exports = router;
