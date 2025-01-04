const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    customer_id: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
    branch_id: { type: mongoose.Schema.Types.ObjectId, ref: "Branch" },
    status: {
      type: String,
      enum: ["pending", "dispatched", "delivered", "cancelled"],
      default: "pending",
    },
    pickup_time: { type: Date },
    delivery_time: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
