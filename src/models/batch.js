const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define the Item reference schema
const itemSchema = new Schema({
    itemId: {
        type: String,
        required: true,
        unique: true
    },
    parent_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',  // Reference to the Order model
        required: true,
    },
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
        ],
    },
});

// Define the Order reference schema
const orderReferenceSchema = new Schema({

    items: [itemSchema],  // List of items in the order
});

// Define the Batch schema
const batchSchema = new Schema(
    {
        ordersIDs: [orderReferenceSchema],  // Array of orders with items
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',  // Reference to the User model
            required: true,
        },
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',  // Reference to the User model
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
        updatedAt: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }  // This automatically manages createdAt and updatedAt fields
);

// Create and export the Batch model
const Batch = mongoose.model('Batch', batchSchema);
module.exports = Batch;
