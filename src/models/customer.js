const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const contactSchema = new mongoose.Schema({
    name: { type: String, required: true },
    number: { type: String, required: true },
    email: { type: String, required: false },
    type: { type: String, enum: ["Personal", "Business", "Emergency"], required: true },
});

const customerSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        address: { type: String, required: true },
        company_name: { type: String, required: true },
        account_id: { type: mongoose.Schema.Types.ObjectId, ref: "Account", required: true },
        documents: [{ type: mongoose.Schema.Types.ObjectId, ref: "Document" }],
        email: { type: String, required: true, unique: true },
        status: { type: String, enum: ["Active", "Inactive", "Archived"], default: "Active" },
        contacts: [contactSchema],
        type: { type: String, default: "customer" },
        username: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        created_by: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", default: null },
        updated_by: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", default: null },
    },
    { timestamps: true }
);

// Password hashing
customerSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Password comparison
customerSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model("Customer", customerSchema);
