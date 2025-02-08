const mongoose = require("mongoose");
const { Schema } = mongoose;

const itemsRefSchema = new Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
    items_count: { type: Number, required: true }, // Fixed type
    docketNumber: { type: String, required: true }, // Fixed type
    total_weight: { type: Number, required: true }, // Fixed type
    items: [
        {
            weight: { type: Number, required: true },
            dimension: {
                height: { type: Number },
                width: { type: Number },
                length: { type: Number },
            },
            price: { type: Number },
            status: {
                type: String,
                enum: [
                    "Picked",
                    "Reached_Source_Branch",
                    "Reached_Source_Hub",
                    "In Transit",
                    "Reached_Destination_Hub",
                    "Reached_Destination_Branch",
                    "Pending",
                    "Out_For_Delivery",
                    "Delivered",
                    "Cancelled",
                    "Manifested"
                ],
            },
            itemId: { type: String },
        },
    ],
});

// Define the Manifest schema
const manifestSchema = new Schema(
    {
        loaderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Loader", // Reference to the Loader model
            required: true,
        },
        sourceHubID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Hub", // Reference to the Source Hub model
            required: true,
        },
        destinationHubID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Hub", // Reference to the Destination Hub model
            required: true,
        },
        vehicleNumber: { type: String, required: true },
        gpsLocation: { type: String, required: true },
        estimatedDeliveryDate: { type: Date, required: true },
        driverContactNumber: { type: String, required: true },
        orderIDs: [itemsRefSchema], // List of orders in the manifest
        no_ofIndividualOrder: { type: Number, required: true, default: 0 },
        totalPcs: { type: Number, required: true, default: 0 },
        totalWeight: { type: Number, required: true, default: 0 }, // Changed from String to Number
        actualWeight: { type: Number, required: true, default: 0 }, // Changed from String to Number
        transport_type: {
            type: String,
            enum: ["air", "surface", "train", "sea"],
            required: true,
        },
        status: {
            type: String,
            enum: ["In Transit", "Delivered", "Pending"],
            default: "Pending",
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User", // Reference to the User model
            required: true,
        },
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User", // Reference to the User model
        },
        issueStatus: { type: String },
    },
    { timestamps: true } // Automatically manage createdAt and updatedAt fields
);

// Create and export the Manifest model
const Manifest = mongoose.model("Manifest", manifestSchema);
module.exports = Manifest;
