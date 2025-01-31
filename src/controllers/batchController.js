const Batch = require("../models/batch"); // Adjust the path as needed

const createBatch = async (req, res) => {
    try {
        const { id } = req.user; // Assuming `userId` is available in `req.user` from authentication middleware

        // Check if ordersIDs is an array
        if (!Array.isArray(req.body)) {
            console.error("Invalid payload format. 'ordersIDs' must be an array.");
            return res.status(400).json({
                message: "Invalid payload format. 'ordersIDs' must be an array.",
            });
        }

        const processedOrders = [];

        // Fetch all existing itemIds from the database
        const allExistingItems = await Batch.aggregate([
            { $unwind: "$ordersIDs" },
            { $unwind: "$ordersIDs.items" },
            { $project: { itemId: "$ordersIDs.items.itemId", _id: 0 } }
        ]).then(results => results.map(item => item.itemId));

        const existingItemSet = new Set(allExistingItems);

        // Iterate over the orders in the payload (first level of objects)
        for (const orderContainer of req.body) {
            if (orderContainer.ordersIDs && Array.isArray(orderContainer.ordersIDs)) {
                // Process each order in the ordersIDs array (second level)
                for (const order of orderContainer.ordersIDs) {
                    if (order.parent_id && Array.isArray(order.items)) {
                        // Filter out items that already exist in the database
                        const uniqueItems = order.items.filter(
                            item => !existingItemSet.has(item.itemId)
                        );

                        if (uniqueItems.length > 0) {
                            // Add the unique items to the processedOrders array
                            processedOrders.push({
                                parent_id: order.parent_id,
                                items: uniqueItems,
                            });

                            // Update the existing item set with the new items
                            uniqueItems.forEach(item => existingItemSet.add(item.itemId));
                        }
                    }
                }
            }
        }

        // Create a new batch using the processed orders if there are any unique items
        if (processedOrders.length > 0) {
            const newBatch = new Batch({
                ordersIDs: processedOrders,
                createdBy: id,
                updatedBy: id,
            });

            // Save the batch to the database
            await newBatch.save();

            return res.status(201).json({ message: "Batch created successfully" });
        } else {
            return res.status(400).json({ message: "No unique items to create" });
        }
    } catch (error) {
        console.error("Error creating batch:", error);
        return res.status(500).json({ message: "Error creating batch", error: error.message });
    }
};




const getAllBatches = async (req, res) => {
    try {
        // Extract query parameters: status, itemId, parent_id
        const { status, itemId, parent_id } = req.query;  // Optional query params to filter

        // Build the match filter dynamically based on provided query params
        const matchCriteria = {};

        if (status) {
            matchCriteria.status = status;  // If status is provided, filter by status
        }

        if (parent_id) {
            matchCriteria["_id"] = parent_id;  // If parent_id is provided, filter by parent_id
        }

        if (itemId) {
            matchCriteria["items.itemId"] = itemId;  // If itemId is provided, filter by itemId
        }

        // Find batches and populate orders with filtering based on the criteria
        const batches = await Batch.find()
            .populate({
                path: "ordersIDs.parent_id",
                model: "Order",
                match: matchCriteria,  // Apply the dynamically built match criteria
                select: "parent_id status",  // Select necessary fields: parent_id, status, and items
            });

        if (!batches.length) {
            return res.status(201).json({ message: "No batches found" });
        }

        return res.status(200).json(batches);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error fetching batches", error: error.message });
    }
};



// Get a Batch by ID
const getBatchById = async (req, res) => {
    try {
        const { id } = req.params; // Batch ID from URL params

        const batch = await Batch.findById(id)
            .populate("createdBy updatedBy")
            .populate({
                path: "ordersIDs.parent_id",
                model: "Order",
            });

        if (!batch) {
            return res.status(404).json({ message: "Batch not found" });
        }

        return res.status(200).json(batch);
    } catch (error) {
        console.error(error);
        return res
            .status(500)
            .json({ message: "Error fetching batch", error: error.message });
    }
};

// Update a Batch by ID
const updateBatch = async (req, res) => {
    try {
        const { id } = req.params; // Batch ID from URL params
        const { ordersIDs } = req.body; // New data for the batch

        const batch = await Batch.findById(id);
        if (!batch) {
            return res.status(404).json({ message: "Batch not found" });
        }

        batch.ordersIDs = ordersIDs; // Update ordersIDs in the batch
        batch.updatedBy = req.user?.id; // Set updatedBy as the current user
        batch.updatedAt = Date.now(); // Update the timestamp

        await batch.save();

        return res
            .status(200)
            .json({ message: "Batch updated successfully", batch });
    } catch (error) {
        console.error(error);
        return res
            .status(500)
            .json({ message: "Error updating batch", error: error.message });
    }
};

// Delete a Batch by ID
const deleteBatch = async (req, res) => {
    try {
        const { id } = req.params; // Batch ID from URL params

        const batch = await Batch.findById(id);
        if (!batch) {
            return res.status(404).json({ message: "Batch not found" });
        }

        await Batch.findByIdAndDelete(id);

        return res.status(200).json({ message: "Batch deleted successfully" });
    } catch (error) {
        console.error(error);
        return res
            .status(500)
            .json({ message: "Error deleting batch", error: error.message });
    }
};
const deleteItemFromBatch = async (req, res) => {
    try {
        const { batchId, itemId } = req.params; // Batch ID and Item ID from URL params

        const decodedItemId = decodeURIComponent(itemId);

        // Find the batch by ID
        const batch = await Batch.findById(batchId);
        if (!batch) {
            return res.status(404).json({ message: "Batch not found" });
        }

        // Flag to check if an item was removed
        let isItemRemoved = false;

        // Iterate over the ordersIDs in the batch to find and remove the item with the given itemId
        batch.ordersIDs.forEach(order => {
            const originalLength = order.items.length;

            // Filter out the item with the given itemId
            order.items = order.items.filter(item => item.itemId !== decodedItemId);

            // If the item was removed, set the flag to true
            if (order.items.length < originalLength) {
                isItemRemoved = true;
            }
        });

        if (!isItemRemoved) {
            return res.status(404).json({ message: "Item not found in batch" });
        }

        // Check if all items are removed from the batch
        const hasItemsLeft = batch.ordersIDs.some(order => order.items.length > 0);

        if (!hasItemsLeft) {
            // If no items are left, delete the entire batch
            await Batch.findByIdAndDelete(batchId);
            return res.status(200).json({ message: "Batch deleted as no items were left" })
        }

        // Save the updated batch to the database
        await batch.save();

        return res.status(200).json({ message: "Item deleted from batch successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error deleting item from batch", error: error.message });
    }
};



module.exports = {
    createBatch,
    getAllBatches,
    getBatchById,
    updateBatch,
    deleteBatch,
    deleteItemFromBatch
};
