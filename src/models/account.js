const mongoose = require("mongoose");

const accountSchema = new mongoose.Schema(
    {
        account_number: { type: String, required: true },
        IFSC: { type: String, required: true },
        bank_name: { type: String, required: true },
        micr_code: { type: String },
        account_holder_name: { type: String, required: true },
        verified: { type: Boolean, default: false },
        status: { type: String, enum: ["Active", "Archived"], default: "Active" }, // Archived status
        archived_at: { type: Date }, // Timestamp when the account was archived
    },
    { timestamps: true }
);

module.exports = mongoose.model("Account", accountSchema);
