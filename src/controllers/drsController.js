const DRS = require("../models/drs");
const Order = require("../models/order");
const mongoose = require("mongoose");

// Create a new DRS record
// Create a new DRS record
exports.createDRS = async (req, res) => {
    try {
        const { orderIds, ...drsData } = req.body;

        if (!Array.isArray(orderIds) || orderIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Order IDs must be provided as an array.",
            });
        }

        // Validate that all provided orderIds exist
        const existingOrders = await Order.find({ _id: { $in: orderIds } });

        if (existingOrders.length !== orderIds.length) {
            return res.status(404).json({
                success: false,
                message: "Some order IDs do not exist.",
            });
        }

        // Create the DRS entry
        const drs = await DRS.create({ ...drsData, orderIds });

        // Update order status, items status, and set DRS ID in each order
        await Order.updateMany(
            { _id: { $in: orderIds } },
            {
                $set: {
                    status: "Out for Delivery",
                    drsId: drs._id,  // Update DRS ID in orders
                    "items.$[elem].status": "Out for Delivery",
                },
            },
            {
                arrayFilters: [{ "elem.status": { $ne: "Out for Delivery" } }],
            }
        );

        res.status(201).json({
            success: true,
            message: "DRS created successfully and orders/items marked as Out for Delivery.",
            drs,
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


// Get all DRS records with filtering
exports.getAllDRS = async (req, res) => {
    try {
        let {
            hubId,
            deliveryBoyId,
            vehicleNumber,
            status,
            created_by,
            updated_by,
            startDate,
            endDate,
            page,
            limit,
            sortBy,
            sortOrder,
        } = req.query;

        let filter = {};

        if (hubId) filter.hubId = hubId;
        if (deliveryBoyId) filter.deliveryBoyId = deliveryBoyId;
        if (vehicleNumber) filter.vehicleNumber = { $regex: vehicleNumber, $options: "i" };
        if (status) filter.status = status;
        if (created_by) filter.created_by = created_by;
        if (updated_by) filter.updated_by = updated_by;

        // Filter by created date range
        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) filter.createdAt.$gte = new Date(startDate);
            if (endDate) filter.createdAt.$lte = new Date(endDate);
        }

        // Pagination defaults
        page = parseInt(page) || 1;
        limit = parseInt(limit) || 10;
        const skip = (page - 1) * limit;

        // Sorting defaults
        let sortOptions = {};
        if (sortBy) {
            sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;
        }

        const drsList = await DRS.find(filter)
            .populate("hubId", "name")
            .populate("deliveryBoyId", "name")
            .populate("created_by", "name")
            .populate("updated_by", "name")
            .populate({
                path: "orderIds",
                select: "docket_number consignee items",
                populate: [
                    { path: "consignee", select: "name phone address" },
                    { path: "items", select: "weight" },
                ],
            })
            .skip(skip)
            .limit(limit)
            .sort(sortOptions);

        // Post-processing: Add items count and total weight
        const enhancedDRSList = drsList.map((drs) => {
            const updatedOrders = drs.orderIds.map((order) => {
                const itemsCount = order?.items?.length;
                const totalWeight = order?.items?.reduce((sum, item) => sum + (item.weight || 0), 0);

                return {
                    ...order.toObject(),
                    itemsCount,
                    totalWeight,
                };
            });

            return {
                ...drs.toObject(),
                orderIds: updatedOrders,
            };
        });


        res.status(200).json({
            drsList: enhancedDRSList,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


// Get a single DRS by ID
exports.getDRSById = async (req, res) => {
    try {
        const drs = await DRS.findById(req.params.id)
            .populate("hubId", "name")
            .populate("deliveryBoyId", "name")
            .populate("orderIds._id", "docket_number");

        if (!drs) {
            return res.status(404).json({ success: false, message: "DRS not found" });
        }
        res.status(200).json({ success: true, drs });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update a DRS record
exports.updateDRS = async (req, res) => {
    try {
        const updatedDRS = await DRS.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
        });

        if (!updatedDRS) {
            return res.status(404).json({ success: false, message: "DRS not found" });
        }

        res
            .status(200)
            .json({ success: true, message: "DRS updated successfully", updatedDRS });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete a DRS record
exports.deleteDRS = async (req, res) => {
    try {
        const deletedDRS = await DRS.findByIdAndDelete(req.params.id);

        if (!deletedDRS) {
            return res.status(404).json({ success: false, message: "DRS not found" });
        }

        res
            .status(200)
            .json({ success: true, message: "DRS deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.removeOrderFromDRS = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { drsId, orderId } = req.body;

        if (!drsId || !orderId) {
            return res.status(400).json({
                success: false,
                message: "DRS ID and Order ID are required.",
            });
        }

        // Check if DRS exists
        const drs = await DRS.findById(drsId).session(session);
        if (!drs) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({
                success: false,
                message: "DRS not found.",
            });
        }

        // Check if the order exists inside DRS
        const orderExists = drs.orderIds.some(order => order._id.toString() === orderId);
        if (!orderExists) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({
                success: false,
                message: "Order ID not found in this DRS.",
            });
        }

        // Remove Order ID from DRS document
        await DRS.findByIdAndUpdate(
            drsId,
            { $pull: { orderIds: { _id: orderId } } },
            { session }
        );

        // Update Order status and its items status to "Reached Destination"
        await Order.updateOne(
            { _id: orderId },
            {
                $set: {
                    status: "Reached Destination",
                    "items.$[elem].status": "Reached Destination",
                },
            },
            {
                session,
                arrayFilters: [{ "elem.status": { $ne: "Reached Destination" } }], // Only update if status is different
            }
        );

        await session.commitTransaction();
        session.endSession();

        res.status(200).json({
            success: true,
            message: "Order removed from DRS and updated to 'Reached Destination'.",
        });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.status(500).json({ success: false, message: error.message });
    }
};



exports.updateDRSStatus = async (req, res) => {
    try {
        const { id, status } = req.params; // DRS ID from URL

        if (!status) {
            return res.status(400).json({ success: false, message: "Status is required" });
        }

        // Find the DRS record
        const drs = await DRS.findById(id);
        if (!drs) {
            return res.status(404).json({ success: false, message: "DRS not found" });
        }

        // Update DRS status
        drs.status = status;
        await drs.save();

        // Extract order IDs from the DRS record
        const orderIds = drs.orderIds;

        if (!orderIds || orderIds.length === 0) {
            return res.status(400).json({ success: false, message: "No orders found in DRS" });
        }

        // Update the status of orders and their items
        await Order.updateMany(
            { _id: { $in: orderIds } },
            {
                $set: {
                    status: status, // Set order status same as DRS
                    "items.$[elem].status": status, // Set item status same as DRS
                },
            },
            {
                arrayFilters: [{ "elem.status": { $ne: status } }], // Only update items that are not already in this status
            }
        );

        res.status(200).json({
            success: true,
            message: "DRS and associated orders/items updated successfully.",
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

