const express = require("express");
const { createEmployee, updateEmployee, archiveEmployee, getEmployeeById, getFilteredEmployees, unarchiveEmployee } = require("../controllers/employeeController");
const authenticate = require("../middleware/auth");
const router = express.Router();

// Employee CRUD Routes
router.post("/", authenticate, createEmployee);
router.put("/:id", authenticate, updateEmployee);
router.patch("/:id/archive", authenticate, archiveEmployee);
router.patch("/:id/unarchive", authenticate, unarchiveEmployee);
router.get("/:id", authenticate, getEmployeeById);
router.get("/", authenticate, getFilteredEmployees);

module.exports = router;
