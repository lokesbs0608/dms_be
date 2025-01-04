const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/auth");
const vehicleController = require("../controllers/vehicleController");

// CRUD operations for vehicles
router.post("/", authenticate, vehicleController.createVehicle);
router.get("/", authenticate, vehicleController.getAllVehicles);
router.get("/:id", authenticate, vehicleController.getVehicleById);
router.put("/:id", authenticate, vehicleController.updateVehicle);

// Archive/Unarchive operations
router.put("/:id/archive", authenticate, vehicleController.archiveVehicle);
router.put("/:id/unarchive", authenticate, vehicleController.unarchiveVehicle);

module.exports = router;
