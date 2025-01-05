const mongoose = require("mongoose");

const organizationSchema = new mongoose.Schema(
    {
        company_name: {
            type: String,
            required: true,
            unique: true,
        },
        head_office_address: {
            type: String,
            required: true,
        },
        website: {
            type: String,
        },
        contact: [
            {
                name: { type: String, required: true }, // Contact person name
                number: { type: String, required: true }, // Phone number
                type: { type: String, enum: ["Office", "Personal", "Support"], required: true }, // Type of contact
                email: { type: String }, // Email address
            },
        ],
        email: {
            type: String,
            required: true,
            unique: true,
        },
        documents_ids: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Document",
            },
        ],
        bank_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Account", 
        },
    },
    { timestamps: true } // Add createdAt and updatedAt timestamps
);

module.exports = mongoose.model("Organization", organizationSchema);
