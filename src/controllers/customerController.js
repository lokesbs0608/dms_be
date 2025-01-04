const Customer = require("../models/customer");
const transporter = require("../config/transporter");

const createCustomer = async (req, res) => {
    try {
        const { name, address, company_name, account_id, documents, email, contacts, username, password } = req.body;

        const existingCustomer = await Customer.findOne({ email });
        if (existingCustomer) {
            return res.status(400).json({ message: "Customer with this email already exists." });
        }

        const customer = new Customer({
            name,
            address,
            company_name,
            account_id,
            documents,
            email,
            contacts,
            username,
            password,
        });

        await customer.save();
        res.status(201).json({ message: "Customer created successfully", customer });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

const updateCustomer = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const customer = await Customer.findByIdAndUpdate(id, updates, { new: true });
        if (!customer) {
            return res.status(404).json({ message: "Customer not found" });
        }

        res.status(200).json({ message: "Customer updated successfully", customer });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};


const archiveCustomer = async (req, res) => {
    try {
        const { id } = req.params;

        const customer = await Customer.findByIdAndUpdate(id, { status: "Archived" }, { new: true });
        if (!customer) {
            return res.status(404).json({ message: "Customer not found" });
        }

        res.status(200).json({ message: "Customer archived successfully", customer });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

const unarchiveCustomer = async (req, res) => {
    try {
        const { id } = req.params;

        const customer = await Customer.findByIdAndUpdate(id, { status: "Active" }, { new: true });
        if (!customer) {
            return res.status(404).json({ message: "Customer not found" });
        }

        res.status(200).json({ message: "Customer unarchived successfully", customer });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};


const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        // Find the customer by email
        const customer = await Customer.findOne({ email });
        if (!customer) {
            return res.status(404).json({ message: "Customer not found" });
        }

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Set OTP and expiration in the database
        customer.resetOtp = otp;
        customer.resetOtpExpiration = Date.now() + 10 * 60 * 1000; // OTP valid for 10 minutes
        await customer.save();

        // Send OTP via email
        const mailOptions = {
            from: process.env.GMAIL_USER,
            to: email,
            subject: "Password Reset OTP",
            text: `Your OTP for password reset is: ${otp}. It is valid for the next 10 minutes.`,
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: "OTP sent successfully to your email." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};


const resetCustomerPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        const customer = await Customer.findOne({ email });
        if (!customer) {
            return res.status(404).json({ message: "Customer not found" });
        }

        if (customer.resetOtp !== otp || Date.now() > customer.resetOtpExpiration) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        customer.password = newPassword;
        customer.resetOtp = null;
        customer.resetOtpExpiration = null;
        await customer.save();

        res.status(200).json({ message: "Password reset successful" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};



const getAllCustomers = async (req, res) => {
    try {
        const { status, company_name, name, type } = req.query;

        const query = {};
        if (status) query.status = status;
        if (company_name) query.company_name = { $regex: company_name, $options: "i" };
        if (name) query.name = { $regex: name, $options: "i" };
        if (type) query.type = type;

        const customers = await Customer.find(query)
            .populate("account_id")
            .populate("documents");

        if (!customers || customers.length === 0) {
            return res.status(404).json({ message: "No customers found" });
        }

        res.status(200).json({ customers });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};


const loginCustomer = async (req, res) => {
    try {
        const { username, password } = req.body;

        const customer = await Customer.findOne({ username });
        if (!customer || customer.status !== "Active") {
            return res.status(403).json({ message: "Invalid credentials or account is not active." });
        }

        const isMatch = await customer.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid username or password" });
        }

        const token = jwt.sign({ id: customer._id, type: customer.type }, process.env.JWT_SECRET, { expiresIn: "15d" });

        res.status(200).json({ message: "Login successful", token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};




module.exports = { createCustomer, updateCustomer, loginCustomer, getAllCustomers, resetCustomerPassword, forgotPassword, unarchiveCustomer, archiveCustomer }