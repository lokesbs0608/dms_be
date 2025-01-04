const Employee = require("../models/employee");

// Create Employee
const createEmployee = async (req, res) => {
    try {
        const { name, username, email, password, role } = req.body;
        if (role === 'super_admin' && req?.user?.role != 'super_admin') {
            return res.status(403).json({ message: "Access Denied. Only Super Admin can update an employee." })
        }
        const employee = new Employee({
            name,
            username,
            email,
            password,
            role,
            created_by: req.user.id, // Use JWT data for creator
            updated_by: req.user.id, // Use JWT data for updater
        });
        await employee.save();
        res.status(201).json({ message: "Employee created successfully", employee });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

// Update Employee
const updateEmployee = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedData = req.body;

        if (req.user.role !== 'super_admin') {
            return res.status(403).json({ message: "Access Denied. Only Super Admin can update an employee." });
        }

        const employee = await Employee.findByIdAndUpdate(id, { ...updatedData, updated_by: req.user.id }, { new: true });
        if (!employee) return res.status(404).json({ message: "Employee not found" });
        res.status(200).json({ message: "Employee updated successfully", employee });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

// Delete Employee
const deleteEmployee = async (req, res) => {
    try {
        const { id } = req.params;
        const employee = await Employee.findByIdAndDelete(id);
        if (!employee) return res.status(404).json({ message: "Employee not found" });
        res.status(200).json({ message: "Employee deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

// Get Employee by ID
const getEmployeeById = async (req, res) => {
    try {
        const { id } = req.params;
        const employee = await Employee.findById(id);
        if (!employee) return res.status(404).json({ message: "Employee not found" });
        res.status(200).json({ employee });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

// Get All Employees
const getAllEmployees = async (req, res) => {
    try {
        const employees = await Employee.find();
        res.status(200).json({ employees });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createEmployee, updateEmployee, deleteEmployee, getEmployeeById, getAllEmployees };
