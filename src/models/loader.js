const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const locationSchema = new mongoose.Schema({
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true }
}, { _id: false });

const loaderSchema = new mongoose.Schema(
    {
        code: { type: String, required: true },
        name: { type: String, required: true },
        documents_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: "Document" }], // References Document IDs
        location: locationSchema, // Location details with address, city, state, pincode
        account_id: { type: mongoose.Schema.Types.ObjectId, ref: "Account" }, // References Account object ID
        status: { type: String, enum: ["Active", "Inactive"], default: "Active" }, // Status field for loader
        company_name: { type: String, required: true }, // Company name
        email: { type: String, required: true, unique: true }, // Email for the loader
        username: { type: String, required: true, unique: true }, // Username for login
        password: { type: String, required: true }, // Password for login
        website: { type: String },
        tags: [{ type: String }],
        created_by: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", default: null },
        updated_by: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", default: null },
    },
    { timestamps: true }
);

// Password hashing before saving
loaderSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

// Password comparison method
loaderSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("Loader", loaderSchema);
