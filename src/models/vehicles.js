const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema(
    {
        vehicle_number: { type: String, required: true, unique: true }, // Unique vehicle number
        ownership: { type: String, required: true, enum: ["Owner", "Leased", "Rented"], default: "Owner" }, // Ownership type
        brand: { type: String, required: true }, // Vehicle brand (e.g., Toyota, Honda)
        year_of_registration: { type: Number, required: true }, // Year of vehicle registration
        year_of_manufacture: { type: Number, required: true }, // Year the vehicle was manufactured
        type: { type: String, required: true }, // Vehicle type (e.g., Sedan, SUV, Truck)
        fc_expiry_date: { type: Date, required: true }, // Date of expiry for the Fitness Certificate (FC)
        insurance_expiry_date: { type: Date, required: true }, // Date of expiry for the insurance
        emission_expiry_date: { type: Date, required: true }, // Date of expiry for emission certification
        documents: [{ type: mongoose.Schema.Types.ObjectId, ref: "Document" }], // References to Documents collection
        created_by: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", default: null },
        updated_by: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", default: null },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Vehicle", vehicleSchema);
