const express = require('express');
const router = express.Router();
const batchController = require('../controllers/batchController');  // Adjust path as needed

// Middleware to check authentication
const authenticate = require("../middleware/auth");

router.post('/batches', authenticate, batchController.createBatch);
router.get('/batches', authenticate, batchController.getAllBatches);
router.get('/batches/:id', authenticate, batchController.getBatchById);
router.put('/batches/:id', authenticate, batchController.updateBatch);
router.delete('/batches/:id', authenticate, batchController.deleteBatch);

module.exports = router;
