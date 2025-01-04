const mongoose = require("mongoose");

const hubSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        address: { type: String, required: true },
        documents_id: [{ type: mongoose.Schema.Types.ObjectId, ref: "Document" }],
        bank_details_id: { type: mongoose.Schema.Types.ObjectId, ref: "BankDetails" },
        manager_id: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
        emergency_person_id: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
        landline_number: { type: String, required: true },
        hub_code: { type: String, required: true },
        division: { type: String, required: true },
        pincodes: [{ type: Number, required: true }],
        status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
        created_by: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", default: null },
        updated_by: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", default: null },
    },
    { timestamps: true } // Adds createdAt and updatedAt fields
);

module.exports = mongoose.model("Hub", hubSchema);
