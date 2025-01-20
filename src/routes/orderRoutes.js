const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController"); // Adjust the path accordingly

// Create an order
router.post("/", orderController.createOrder);

// Update an order
router.get("/:id", orderController.getOrderById);

// Update an order
router.put("/:id", orderController.updateOrder);

// Archive an order
router.put("/archive/:id", orderController.archiveOrder);

// Unarchive an order
router.put("/unarchive/:id", orderController.unarchiveOrder);

// Add history to an order
router.post("/history/:id", orderController.addHistoryToOrder);

// Change order status
router.put("/status/:id", orderController.changeOrderStatus);

// Filter orders
router.get("/", orderController.filterOrders);

module.exports = router;
