const express = require("express");
const { createEmployee, updateEmployee, deleteEmployee, getEmployeeById, getAllEmployees } = require("../controllers/employeeController");

const router = express.Router();

// Employee CRUD Routes
router.post("/", createEmployee);
router.put("/:id", updateEmployee);
router.delete("/:id", deleteEmployee);
router.get("/:id", getEmployeeById);
router.get("/", getAllEmployees);

module.exports = router;
