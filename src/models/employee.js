const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const employeeSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
        username: { type: String, required: true, unique: true }, // New field for username
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true }, // New field for password
        role: { type: String, required: true }, // e.g., Admin, Manager, Delivery Agent
        date_of_joining: { type: Date, default: Date.now },
        location: {
            address: { type: String, required: true },
            city: { type: String, required: true },
            state: { type: String, required: true },
            pincode: { type: String, required: true },
        },
        status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
        section: { type: String, required: true }, // e.g., Delivery, Warehouse, etc.
        account_id: { type: mongoose.Schema.Types.ObjectId, ref: "Account" }, // Reference to Account
        documents_id: [{ type: mongoose.Schema.Types.ObjectId, ref: "Document" }], // References Documents
        branch_id: { type: mongoose.Schema.Types.ObjectId, ref: "Branch" },
        hub_id: { type: mongoose.Schema.Types.ObjectId, ref: "Hub" }
    },
    { timestamps: true }

);
// Password hashing before saving
employeeSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

// Password comparison method
employeeSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};


module.exports = mongoose.model("Employee", employeeSchema);
