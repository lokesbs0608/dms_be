const express = require("express");
const router = express.Router();
const drsController = require("../controllers/drsController");

// Routes
router.post("/", drsController.createDRS);            // Create
router.get("/", drsController.getAllDRS);            // Get All (with filters)
router.get("/:id", drsController.getDRSById);        // Get by ID
router.put("/:id", drsController.updateDRS);         // Update
router.delete("/:id", drsController.deleteDRS);
router.delete("/remove-order", drsController.removeOrderFromDRS);     // Delete

router.put("/:id/status/:status", drsController.updateDRSStatus);

module.exports = router;
