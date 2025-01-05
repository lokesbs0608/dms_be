const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    // Existing Fields
    consignor_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      default: null,
    },
    consignee_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      default: null,
    },

    // Optionally, if consignor and consignee are not available in the Customer collection, send details directly
    consignor: {
      company_name: { type: String, default: null },
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

    docket_number: { type: String, required: true, unique: true },
    transport_type: {
      type: String,
      enum: ["air", "surface", "train", "sea"],
      required: true,
    },
    payment_method: { type: String, required: true },
    source_branch_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
    },
    destination_branch_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
    },
    source_hub_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hub",
      required: true,
    },
    destination_hub_id: {
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
    delivered_location: { type: String, default: null },
    delivered_date: { type: Date, default: null },
    delivered_time: { type: String, default: null },

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
          height: { type: Number, required: true },
          width: { type: Number, required: true },
          length: { type: Number, required: true },
        },
        price: { type: Number, required: true },
        item_id: {
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
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Order", orderSchema);
