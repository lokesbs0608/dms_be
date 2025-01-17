const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    // Existing Fields
    consignorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      default: null,
    },
    consigneeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      default: null,
    },
    // Optionally, if consignor and consignee are not available in the Customer collection, send details directly
    consignor: {
      companyName: { type: String, default: null },
      name: { type: String, default: null },
      address: { type: String, default: null },
      city: { type: String, default: null },
      pincode: { type: String, default: null },
      number: { type: String, default: null },
    },
    consignee: {
      company_name: { type: String, default: null },
      name: { type: String, default: null },
      address: { type: String, default: null },
      city: { type: String, default: null },
      pincode: { type: String, default: null },
      number: { type: String, default: null },
    },
    docketNumber: {
      type: String,
      required: [true, "docketNumber is required"],
    },


    transport_type: {
      type: String,
      enum: ["air", "surface", "train", "sea"],
      required: true,
    },
    payment_method: { type: String, required: true },
    sourceBranchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
    },
    destinationBranchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
    },
    sourceHubId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hub",
      required: true,
    },
    destinationHubId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hub",
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
      default: "Picked",
    },
    deliveredLocation: { type: String, default: null },
    deliveredDate: { type: Date, default: null },
    deliveredTime: { type: String, default: null },

    // History Field
    history: [
      {
        status: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        location: { type: String, default: null },
        details: { type: String, default: null },
      },
    ],

    // Items Array
    items: [
      {
        weight: { type: Number, required: true },
        dimension: {
          height: { type: Number, },
          width: { type: Number, },
          length: { type: Number, },
        },
        price: { type: Number, },
        itemId: {
          type: String,
        },
      },
    ],
    direct_to_loader: { type: Boolean, default: false },
    delivered_by: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
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
    pickedVehicleNumber: {
      type: String,
      required: true
    },
    drsId: {
      type: mongoose.Schema.Types.ObjectId, ref: "Customer"
    }
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Order", orderSchema);
