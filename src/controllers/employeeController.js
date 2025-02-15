const Employee = require("../models/employee");
const bcrypt = require("bcryptjs");

// Create Employee
const createEmployee = async (req, res) => {
    try {
        const { name, username, email, password, role } = req.body;

        // Check if an existing super_admin exists
        if (role === "super_admin") {
            const existingSuperAdmin = await Employee.findOne({
                role: "super_admin",
            });

            // If a super_admin already exists, check if the current user is a super_admin
            if (existingSuperAdmin && req?.user?.role !== "super_admin") {
                return res.status(403).json({
                    message:
                        "Access Denied. Only Super Admin can create another Super Admin.",
                });
            }
        }

        // Create the new employee
        const employee = new Employee({
            ...req?.body,
            name,
            username,
            email,
            password,
            role,
            created_by: req?.user?.id, // Use JWT data for creator
            updated_by: req?.user?.id, // Use JWT data for updater
        });

        await employee.save();
        res
            .status(201)
            .json({ message: "Employee created successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

// Update Employee
const updateEmployee = async (req, res) => {
    try {
        const { id } = req.params;
        let { password, ...updatedData } = req.body;

        if (req.user.role !== "super_admin" && req.user.role !== "admin") {
            return res.status(403).json({
                message: "Access Denied. Only Super Admin or Admin can update an employee.",
            });
        }

        // If a new password is provided, hash it before updating
        if (password) {
            updatedData.password = await bcrypt.hash(password, 10);
        }

        const employee = await Employee.findByIdAndUpdate(
            id,
            { ...updatedData, updated_by: req.user.id },
            { new: true }
        );

        if (!employee) {
            return res.status(404).json({ message: "Employee not found" });
        }

        res.status(200).json({
            message: "Employee updated successfully",
            employee,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};



// archive Employee
const archiveEmployee = async (req, res) => {
    try {
        const { id } = req.params;

        // Check for sufficient role
        if (req.user.role !== "super_admin" && req.user.role !== "admin") {
            return res.status(403).json({
                message: "Access Denied. Only Super Admin or Admin can archive an employee.",
            });
        }

        // Update the employee's status to archived
        const employee = await Employee.findByIdAndUpdate(
            id,
            { status: "Inactive", updated_by: req?.user?.id },
            { new: true }
        );

        if (!employee) {
            return res.status(404).json({ message: "Employee not found" });
        }

        res.status(200).json({ message: "Employee archived successfully", });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message || "Internal Server Error" });
    }
};
// unarchive Employee
const unarchiveEmployee = async (req, res) => {
    try {
        const { id } = req.params;

        // Check for sufficient role
        if (req.user.role !== "super_admin" && req.user.role !== "admin") {
            return res.status(403).json({
                message: "Access Denied. Only Super Admin or Admin can unarchive an employee.",
            });
        }

        // Update the employee's status to active
        const employee = await Employee.findByIdAndUpdate(
            id,
            { status: "Active", updated_by: req?.user?.id },

            { new: true }
        );

        if (!employee) {
            return res.status(404).json({ message: "Employee not found" });
        }

        res.status(200).json({ message: "Employee unarchived successfully", });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message || "Internal Server Error" });
    }
};


// Get Employee by ID
const getEmployeeById = async (req, res) => {
    try {
        if (req.user.role !== "super_admin" && req.user.role !== "admin") {
            return res.status(403).json({
                message: "Access Denied. Only Super Admin or Admin can view an employee.",
            });
        }

        const { id } = req.params;
        const employee = await Employee.findById(id);

        if (!employee) {
            return res.status(404).json({ message: "Employee not found" });
        }

        res.status(200).json({ employee });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

const getFilteredEmployees = async (req, res) => {
    // Check if the user has sufficient role to view employees
    if (req.user.role !== "super_admin" && req.user.role !== "admin") {
        return res.status(403).json({
            message: "Access Denied. Only Super Admin or Admin can view employees.",
        });
    }

    try {
        const filters = {};

        // Extract query parameters for filtering
        const { branch_id, hub_id, date_of_joining, role, section, gender, ref_id } =
            req.query;

        // Add the query filters based on the provided query parameters
        if (branch_id) filters.branch_id = branch_id;
        if (ref_id) filters.ref_id = ref_id;
        if (hub_id) filters.hub_id = hub_id;
        if (date_of_joining)
            filters.date_of_joining = { $gte: new Date(date_of_joining) }; // Greater than or equal to the provided date
        if (role) filters.role = role;
        if (section) filters.section = section;
        if (gender) filters.gender = gender;

        // Query the Employee collection with the constructed filters
        const employees = await Employee.find(filters).select("-password"); // Exclude password

        // If no employees are found
        if (employees.length === 0) {
            return res
                .status(201)
                .json({ message: "No employees found with the provided filters.", employees: [] });
        }

        // Respond with the filtered employees
        res.status(200).json({ employees });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createEmployee,
    updateEmployee,
    archiveEmployee,
    unarchiveEmployee,
    getEmployeeById,
    getFilteredEmployees,
};
