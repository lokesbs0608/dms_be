const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController"); // Adjust the path accordingly

// Create an order
router.post("/", orderController.createOrder);

// Update an order
router.put("/orders/:orderId", orderController.updateOrder);

// Archive an order
router.put("/orders/archive/:orderId", orderController.archiveOrder);

// Unarchive an order
router.put("/orders/unarchive/:orderId", orderController.unarchiveOrder);

// Add history to an order
router.post("/orders/history/:orderId", orderController.addHistoryToOrder);

// Change order status
router.put("/orders/status/:orderId", orderController.changeOrderStatus);

// Filter orders
router.get("/", orderController.filterOrders);

module.exports = router;
