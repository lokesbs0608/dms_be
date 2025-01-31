const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define the Loader reference schema
const loaderReferenceSchema = new Schema({
    type: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Loader',  // Reference to the Loader model
        required: true,
    }
});

// Define the Hub reference schema
const hubReferenceSchema = new Schema({
    type: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hub',  // Reference to the Hub model
        required: true,
    }
});

// Define the Manifest schema
const manifestSchema = new Schema(
    {
        loaderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Loader',  // Reference to the Loader model
            required: true,
        },
        sourceHubID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Hub',  // Reference to the Source Hub model
            required: true,
        },
        destinationHubID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Hub',  // Reference to the Destination Hub model
            required: true,
        },
        vehicleNumber: {
            type: String,
            required: true,
        },
        gpsLocation: {
            type: String,  // You may use `GeoJSON` if you want to store coordinates more precisely
            required: true,
        },
        estimatedDeliveryDate: {
            type: Date,
            required: true,
        },
        driverContactNumber: {
            type: String,
            required: true,
        },
        orderIDs: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Order',  // Reference to the Order model
        }],
        batchIDs: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Batch',  // Reference to the Batch model
        }],
        no_ofBatch: {
            type: Number,
            required: true,
            default: 0,
        },
        no_ofIndividualOrder: {
            type: Number,
            required: true,
            default: 0,
        },
        totalPcs: {
            type: Number,
            required: true,
            default: 0,
        },
        totalWeight: {
            type: String,  // Store weight in a string format (can be converted to number when needed)
            required: true,
            default: "0",
        },
        actualWeight: {
            type: String,  // Store weight in a string format (can be converted to number when needed)
            required: true,
            default: "0",
        },
        transport_type: {
            type: String,
            enum: ["air", "surface", "train", "sea"],
            required: true,
        },
        status: {
            type: String,
            enum: ['In Transit', 'Delivered', 'Pending'],
            default: 'Pending',
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',  // Reference to the User model
            required: true,
        },
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',  // Reference to the User model
        },
        issueStatus: {
            type: String,
        }
    },
    { timestamps: true }  // Automatically manage createdAt and updatedAt fields
);

// Create and export the Manifest model
const Manifest = mongoose.model('Manifest', manifestSchema);
module.exports = Manifest;
