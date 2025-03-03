const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController"); // Adjust the path accordingly

// Middleware to check authentication
const authenticate = require("../middleware/auth");

// Create an order
router.post("/", authenticate, orderController.createOrder);

// Update an order
router.get("/:id", authenticate, orderController.getOrderById);

// Update an order
router.put("/:id", authenticate, orderController.updateOrder);

// Archive an order
router.put("/archive/:id", authenticate, orderController.archiveOrder);

// Unarchive an order
router.put("/unarchive/:id", authenticate, orderController.unarchiveOrder);

// Add history to an order
router.post("/history/:id", authenticate, orderController.addHistoryToOrder);

// Change order status
router.put("/status/:id", authenticate, orderController.changeOrderStatus);

// Filter orders
router.get("/",  orderController.filterOrders);

router.patch("/:id/docket", orderController.updateDocketUrl);

module.exports = router;
