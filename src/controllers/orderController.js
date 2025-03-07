const Order = require("../models/order"); // Assuming the model is in the 'models' folder
const Customer = require("../models/customer"); // Assuming the model is in the 'models' folder
const { default: mongoose } = require("mongoose");

// Controller to create an order
const createOrder = async (req, res) => {
    try {
        const orderData = req.body; // Data from the request body
        orderData.updated_by = req?.user?.id
        orderData.created_by = req?.user?.id;
        // If consignorId is provided, fetch and update consignor details
        if (orderData.consignorId && orderData.consignorId.trim() !== "") {
            if (!mongoose.Types.ObjectId.isValid(orderData.consignorId)) {
                return res.status(400).json({ message: "Invalid Consignor ID format" });
            }
            const consignor = await Customer.findById(orderData.consignorId);
            if (!consignor) {
                return res.status(400).json({ message: "Consignor not found" });
            }
            // Update consignor details in the order data
            orderData.consignor = {
                name: consignor.name || "",
                companyName: consignor.companyName || "",
                address: consignor.address || "",
                city: consignor.city || "",
                pincode: consignor.pincode || "",
                number: consignor.number || "",
            };
        } else {
            delete orderData.consignorId; // Remove empty string to prevent type casting error
        }

        // If consigneeId is provided, fetch and update consignee details
        if (orderData.consigneeId && orderData.consigneeId.trim() !== "") {
            if (!mongoose.Types.ObjectId.isValid(orderData.consigneeId)) {
                return res.status(400).json({ message: "Invalid Consignee ID format" });
            }
            const consignee = await Customer.findById(orderData.consigneeId);
            if (!consignee) {
                return res.status(400).json({ message: "Consignee not found" });
            }
            // Update consignee details in the order data
            orderData.consignee = {
                name: consignee.name || "",
                companyName: consignee.companyName || "",
                address: consignee.address || "",
                city: consignee.city || "",
                pincode: consignee.pincode || "",
                number: consignee.number || "",
            };
        } else {
            delete orderData.consigneeId; // Remove empty string to prevent type casting error
        }

        const findOrder = await Order.findOne({ docketNumber: orderData?.docketNumber });

        if (findOrder) {
            return res.status(409).json({ message: "Docket Number is already present" });
        }

        // Create the order in the database
        const newOrder = new Order(orderData);
        await newOrder.save();

        return res.status(201).json({ message: "Order created successfully" });


    } catch (error) {
        if (error.code === 11000 && error.keyValue && error.keyValue.docketNumber) {
            res.status(400).json({ error: `Docket number '${error.keyValue.docketNumber}' already exists. Please provide a unique docket number.` });
        } else {
            res.status(500).json({ error: "Error creating order", details: error.message });
        }
    }
};


// Controller to update an order's details
const updateOrder = async (req, res) => {
    try {
        const { id } = req.params; // Get the id from the request parameters
        const updatedData = req.body; // Data to update from the request body

        updatedData.updated_by = req?.user?.id

        // Remove `_id` field if it exists in the request body
        if (updatedData._id) {
            delete updatedData._id;
        }

        const order = await Order.findById(id);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        // If consignor_id is provided, fetch and update consignor details
        if (updatedData.consignorId) {
            const consignor = await Customer.findById(updatedData.consignorId);
            if (!consignor) {
                return res.status(400).json({ message: "Consignor not found" });
            }
            // Update consignor details in the order data
            updatedData.consignor = {
                name: consignor.name || "",
                companyName: consignor.companyName || "",
                address: consignor.address || "",
                city: consignor.city || "",
                pincode: consignor.pincode || "",
                number: consignor.number || "",
            };
        }

        // If consignee_id is provided, fetch and update consignee details
        if (updatedData.consigneeId) {
            const consignee = await Customer.findById(updatedData.consigneeId);
            if (!consignee) {
                return res.status(400).json({ message: "Consignee not found" });
            }
            // Update consignee details in the order data
            updatedData.consignee = {
                name: consignee.name || "",
                companyName: consignee.companyName || "",
                address: consignee.address || "",
                city: consignee.city || "",
                pincode: consignee.pincode || "",
                number: consignee.number || "",
            };
        }

        // Update order fields
        Object.assign(order, updatedData);
        await order.save();

        return res
            .status(200)
            .json({ message: "Order updated successfully", order });
    } catch (error) {
        console.error(error);
        return res
            .status(500)
            .json({ message: "Error updating order", error: error.message });
    }
};
// Controller to archive an order
const archiveOrder = async (req, res) => {
    try {
        const { orderId } = req.params; // Get the orderId from the request parameters


        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        order.updated_by = req?.user?.id;
        order.status = "Archived"; // Mark order as archived
        await order.save();

        return res
            .status(200)
            .json({ message: "Order archived successfully", order });
    } catch (error) {
        console.error(error);
        return res
            .status(500)
            .json({ message: "Error archiving order", error: error.message });
    }
};

// Controller to unarchive an order
const unarchiveOrder = async (req, res) => {
    try {
        const { orderId } = req.params; // Get the orderId from the request parameters

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        order.status = "Pending"; // Mark order as pending or any other appropriate status
        order.updated_by = req?.user?.id;
        await order.save();

        return res
            .status(200)
            .json({ message: "Order unarchived successfully", order });
    } catch (error) {
        console.error(error);
        return res
            .status(500)
            .json({ message: "Error unarchiving order", error: error.message });
    }
};

// Controller to add history to an order
const addHistoryToOrder = async (req, res) => {
    try {
        const { orderId } = req.params; // Get the orderId from the request parameters
        const { status, location, details } = req.body; // History data from request body

        const order = await Order.findById(orderId);
        order.updated_by = req?.user?.id;
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        const newHistory = {
            status,
            timestamp: new Date(),
            location: location || null,
            details: details || null,
        };

        // Add history to the order
        order.history.push(newHistory);
        await order.save();

        return res
            .status(200)
            .json({ message: "History added successfully", order });
    } catch (error) {
        console.error(error);
        return res
            .status(500)
            .json({ message: "Error adding history", error: error.message });
    }
};

// Controller to change the status of an order
const changeOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params; // Get the orderId from the request parameters
        const { status } = req.body; // New status from the request body


        const order = await Order.findById(orderId);
        order.updated_by = req?.user?.id;
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        // Update order status
        order.status = status;
        await order.save();

        // Add history for status change
        const newHistory = {
            status,
            timestamp: new Date(),
            details: `Status changed to ${status}`,
        };
        order.history.push(newHistory);
        await order.save();

        return res
            .status(200)
            .json({ message: "Order status changed successfully", order });
    } catch (error) {
        console.error(error);
        return res
            .status(500)
            .json({ message: "Error changing order status", error: error.message });
    }
};

// Controller to filter orders based on various criteria
const filterOrders = async (req, res) => {
    try {
        const {
            status,
            source_branch_id,
            destination_branch_id,
            transport_type,
            destinationHubId,
            sourceHubId,
            docketNumber,
            created_by,
            delivered_by,
            consignorId,
            consigneeId,
            consignor_name,
            consignee_name,
            payment_method,
        } = req.query;

        const filterConditions = {};

        // Filter by status (handle multiple statuses as an array)
        if (status) {
            const statusArray = Array.isArray(status) ? status : status.split(',');
            filterConditions.status = { $in: statusArray };
        }

        // Filter by docketNumber if provided
        if (docketNumber) {
            filterConditions.docketNumber = docketNumber;
        }

        // Filter by source branch if provided
        if (source_branch_id) {
            filterConditions.source_branch_id = source_branch_id;
        }

        // Filter by destination branch if provided
        if (destination_branch_id) {
            filterConditions.destination_branch_id = destination_branch_id;
        }

        // Filter by source hub ID if provided
        if (sourceHubId) {
            filterConditions.sourceHubId = sourceHubId;
        }

        // Filter by destination hub ID if provided
        if (destinationHubId) {
            filterConditions.destinationHubId = destinationHubId;
        }

        // Filter by transport type if provided
        if (transport_type) {
            filterConditions.transport_type = transport_type;
        }

        // Filter by created user if provided
        if (created_by) {
            filterConditions.created_by = created_by;
        }

        // Filter by delivered user if provided
        if (delivered_by) {
            filterConditions.delivered_by = delivered_by;
        }

        // Filter by consignor ID if provided
        if (consignorId) {
            filterConditions.consignorId = consignorId;
        }

        // Filter by consignee ID if provided
        if (consigneeId) {
            filterConditions.consigneeId = consigneeId;
        }

        // Filter by consignor name if provided
        if (consignor_name) {
            filterConditions['consignor.name'] = consignor_name;
        }

        // Filter by consignee name if provided
        if (consignee_name) {
            filterConditions['consignee.name'] = consignee_name;
        }

        // Filter by payment method if provided
        if (payment_method) {
            filterConditions.payment_method = payment_method;
        }

        const orders = await Order.find(filterConditions)
            .populate('destinationHubId') // Populate the destination hub
            .populate('sourceHubId'); // Populate the source hub

        return res.status(200).json({ orders });
    } catch (error) {
        console.error(error);
        return res
            .status(500)
            .json({ message: "Error filtering orders", error: error.message });
    }
};



// Controller to fetch an order by ID
const getOrderById = async (req, res) => {
    try {
        const { id } = req.params; // Extract the order ID from the request parameters



        // Find the order by ID
        const order = await Order.findById(id)


        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        return res.status(200).json(order);
    } catch (error) {
        return res.status(500).json({ error: "Error fetching order", details: error.message });
    }
};

const updateDocketUrl = async (req, res) => {
    try {
        const { id } = req.params; // Extract order ID from params
        const { docket_url } = req.body; // Extract docket_url from request body

        if (!docket_url) {
            return res.status(400).json({ message: "docket_url is required" });
        }

        // Find and update the order
        const updatedOrder = await Order.findByIdAndUpdate(
            id,
            { docket_url }, // Update only the docket_url field
            { new: true, runValidators: true }
        );

        if (!updatedOrder) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.status(200).json({
            success: true,
            message: "docket_url updated successfully!",
        });

    } catch (error) {
        console.error("Error updating docket_url:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};


module.exports = {
    createOrder,
    updateOrder,
    archiveOrder,
    unarchiveOrder,
    addHistoryToOrder,
    changeOrderStatus,
    filterOrders,
    getOrderById,
    updateDocketUrl
};
