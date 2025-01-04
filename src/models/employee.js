const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
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
    },
    { timestamps: true }
);

module.exports = mongoose.model("Employee", employeeSchema);
