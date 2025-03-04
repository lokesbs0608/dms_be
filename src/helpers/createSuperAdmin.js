const mongoose = require('mongoose');
const bcrypt = require("bcryptjs");
const Employee = require('../models/employee'); // Adjust the path to your Employee model

const createSuperAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

        const existingUser = await Employee.findOne({ username: 'manigowda00@gmail.com' });

        if (existingUser) {
            console.log('Super Admin already exists.');
            return; // ✅ No exit, just return
        }

        const superAdmin = new Employee({
            name: 'Manikanta Gowda (Super Admin)',
            gender: 'Male',
            username: 'manigowda00@gmail.com',
            email: 'manigowda00@gmail.com',
            password: '8553871265@Speedo',
            role: 'super_admin',
            status: 'Active',
            section: 'Management',
            location: {
                address: '123 Admin Street',
                city: 'Admin City',
                state: 'Admin State',
                pincode: '123456',
            },
            account_id: null,
            documents_id: [],
        });

        await superAdmin.save();
        console.log('Super Admin created successfully!');
    } catch (error) {
        console.error('Error creating Super Admin:', error.message);
    }
};

module.exports = {
    createSuperAdmin
};
