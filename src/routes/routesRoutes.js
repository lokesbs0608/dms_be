const express = require("express");
const router = express.Router();
const routeController = require("../controllers/routesController");
const authenticate = require("../middleware/auth");

// CRUD operations for routes
router.post("/", authenticate, routeController.createRoute);
router.get("/", authenticate, routeController.getAllRoutes);
router.get("/:id", authenticate, routeController.getRouteById);
router.put("/:id", authenticate, routeController.updateRoute);

// Archive/Unarchive routes
router.put("/:id/archive", authenticate, routeController.archiveRoute);
router.put("/:id/unarchive", authenticate, routeController.unarchiveRoute);

module.exports = router;
