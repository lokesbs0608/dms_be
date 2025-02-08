const express = require('express');
const router = express.Router();
const manifestController = require('../controllers/manifestController');  // Adjust path as needed


// Middleware to check authentication
const authenticate = require("../middleware/auth");

router.post('/', authenticate, manifestController.createManifest);
router.get('/', authenticate, manifestController.getAllManifests);
router.get('/:id', authenticate, manifestController.getManifestById);
router.put('/:id', authenticate, manifestController.updateManifest);
router.put('/:manifestId/order/:orderId', authenticate, manifestController.removeOrderId);
router.put('/:manifestId/status/:status', authenticate, manifestController.updateManifestStatus);
router.delete('/:id', authenticate, manifestController.deleteManifest);

module.exports = router;
