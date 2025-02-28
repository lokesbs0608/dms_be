const mongoose = require("mongoose");

const drsSchema = new mongoose.Schema(
    {
        hubId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Hub",
            required: true,
        },
        deliveryBoyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Employee",
            default: null,
        },
        vehicleNumber: { type: String },
        status: {
            type: String,
            enum: ["Out for Delivery", "Delivered"],
            default: "Out for Delivery",
        },
        orderIds: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Order",
                required: true,
            },
        ],
        created_by: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Employee",
            default: null,
        },
        updated_by: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Employee",
            default: null,
        },
        code: {
            type: String,
            unique: true,
            required: true,
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("DRS", drsSchema);
