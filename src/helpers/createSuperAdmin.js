const createSuperAdmin = async () => {
    try {
        const hashedPassword = await bcrypt.hash('8553871265@Speedo', 10);  // Password to be hashed

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
            account_id: null,  // You can update this if needed
            documents_id: [],  // Add any document references
        });

        await superAdmin.save();
        console.log('Super Admin created successfully!');
        process.exit();
    } catch (error) {
        console.error('Error creating Super Admin:', error.message);
        process.exit(1);
    }
};

createSuperAdmin();