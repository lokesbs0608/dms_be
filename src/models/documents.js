const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema(
    {
        name: { type: String, required: true }, // e.g., ID Proof, License
        number: { type: String, required: true }, // e.g., ID Number
        file_url: { type: String, required: true }, // URL to the uploaded file
        description: { type: String }, // Additional information about the document
        created_by: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", default: null },
        updated_by: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", default: null },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Document", documentSchema);
