const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Employee = require('./models/Employee'); // Adjust the path to your Employee model
export const createSuperAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

        const existingUser = await Employee.findOne({ username: 'manigowda00@gmail.com' });

        if (existingUser) {
            console.log('Super Admin already exists.');
            process.exit();
        }

        const hashedPassword = await bcrypt.hash('8553871265@Speedo', 10);

        const superAdmin = new Employee({
            name: 'Manikanta Gowda (Super Admin)',
            gender: 'Male',
            username: 'manigowda00@gmail.com',
            email: 'manigowda00@gmail.com',
            password: hashedPassword,
            role: 'super_admin',
            location: {
                address: '123 Admin Street',
                city: 'Admin City',
                state: 'Admin State',
                pincode: '123456',
            },
            status: 'Active',
            section: 'Management',
            account_id: null,
            documents_id: [],
        });

        await superAdmin.save();
        console.log('Super Admin created successfully!');
    } catch (error) {
        console.error('Error creating Super Admin:', error.message);
    } finally {
        mongoose.connection.close();
        process.exit();
    }
};


