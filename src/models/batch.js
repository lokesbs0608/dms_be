const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define the Item reference schema
const itemSchema = new Schema({
    itemId: {
        type: String,
        required: true,
        unique: true
    },
});

// Define the Order reference schema
const orderReferenceSchema = new Schema({
    parent_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',  // Reference to the Order model
        required: true,
    },
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
