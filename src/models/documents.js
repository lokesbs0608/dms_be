const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema(
    {
        name: { type: String, required: true }, // e.g., ID Proof, License
        number: { type: String, required: true }, // e.g., ID Number
        file_url: { type: String, required: true }, // URL to the uploaded file
        description: { type: String }, // Additional information about the document
    },
    { timestamps: true }
);

module.exports = mongoose.model("Document", documentSchema);
