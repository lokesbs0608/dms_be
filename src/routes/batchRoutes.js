const express = require('express');
const router = express.Router();
const batchController = require('../controllers/batchController');  // Adjust path as needed

// Middleware to check authentication
const authenticate = require("../middleware/auth");

router.post('/', authenticate, batchController.createBatch);
router.get('', authenticate, batchController.getAllBatches);
router.get('/:id', authenticate, batchController.getBatchById);
router.put('/:id', authenticate, batchController.updateBatch);
router.delete('/:id', authenticate, batchController.deleteBatch);
router.delete('/:batchId/items/:itemId', authenticate, batchController.deleteItemFromBatch)

module.exports = router;
