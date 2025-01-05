const mongoose = require("mongoose");

const routeSchema = new mongoose.Schema(
    {
        hub_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Hub",
            required: true,
        },
        branch_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Branch",
            required: true,
        },
        pincodes: {
            type: [String], // Array of pincode strings
            required: true,
        },
        areas: {
            type: [String], // Array of area names
            required: true,
        },
        route_code: {
            type: String,
            required: true,
            unique: true, // Ensure route_code is unique
        },
        from: {
            type: String, // Starting point of the route
            required: true,
        },
        via: {
            type: String, // Intermediate point(s) on the route
            required: true,
        },
        to: {
            type: String, // Destination of the route
            required: true,
        },
        created_by: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", default: null },
        updated_by: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", default: null },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Route", routeSchema);
