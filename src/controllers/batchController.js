const Batch = require('../models/batch');  // Adjust the path as needed

// Create a new Batch
const createBatch = async (req, res) => {
    try {
        const { ordersIDs } = req.body;
        const { userId } = req.user;  // Assuming `userId` is available in `req.user` from authentication middleware

        const newBatch = new Batch({
            ordersIDs,
            createdBy: userId,
            updatedBy: userId,
        });

        await newBatch.save();

        return res.status(201).json({ message: 'Batch created successfully', batch: newBatch });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error creating batch', error: error.message });
    }
};

// Get all Batches
const getAllBatches = async (req, res) => {
    try {
        const batches = await Batch.find().populate('createdBy updatedBy').populate({
            path: 'ordersIDs.parent_id',
            model: 'Order',
        });

        if (!batches.length) {
            return res.status(404).json({ message: 'No batches found' });
        }

        return res.status(200).json(batches);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error fetching batches', error: error.message });
    }
};

// Get a Batch by ID
const getBatchById = async (req, res) => {
    try {
        const { id } = req.params; // Batch ID from URL params

        const batch = await Batch.findById(id)
            .populate('createdBy updatedBy')
            .populate({
                path: 'ordersIDs.parent_id',
                model: 'Order',
            });

        if (!batch) {
            return res.status(404).json({ message: 'Batch not found' });
        }

        return res.status(200).json(batch);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error fetching batch', error: error.message });
    }
};

// Update a Batch by ID
const updateBatch = async (req, res) => {
    try {
        const { id } = req.params; // Batch ID from URL params
        const { ordersIDs } = req.body;  // New data for the batch

        const batch = await Batch.findById(id);
        if (!batch) {
            return res.status(404).json({ message: 'Batch not found' });
        }

        batch.ordersIDs = ordersIDs;  // Update ordersIDs in the batch
        batch.updatedBy = req.user?.id;  // Set updatedBy as the current user
        batch.updatedAt = Date.now();  // Update the timestamp

        await batch.save();

        return res.status(200).json({ message: 'Batch updated successfully', batch });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error updating batch', error: error.message });
    }
};

// Delete a Batch by ID
const deleteBatch = async (req, res) => {
    try {
        const { id } = req.params; // Batch ID from URL params

        const batch = await Batch.findById(id);
        if (!batch) {
            return res.status(404).json({ message: 'Batch not found' });
        }

        await batch.remove();  // Remove the batch from the database

        return res.status(200).json({ message: 'Batch deleted successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error deleting batch', error: error.message });
    }
};

module.exports = {
    createBatch,
    getAllBatches,
    getBatchById,
    updateBatch,
    deleteBatch,
};
