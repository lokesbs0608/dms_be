const Order = require("../models/order"); // Assuming the model is in the 'models' folder
const Customer = require("../models/customer"); // Assuming the model is in the 'models' folder

// Controller to create an order
const createOrder = async (req, res) => {
    try {
        const orderData = req.body; // Data from the request body

        // Check if consignor and consignee are available in the Customer collection
        if (orderData.consignor_id) {
            const consignor = await Customer.findById(orderData.consignor_id);
            if (!consignor) {
                return res.status(400).json({ message: "Consignor not found" });
            }
        }

        if (orderData.consignee_id) {
            const consignee = await Customer.findById(orderData.consignee_id);
            if (!consignee) {
                return res.status(400).json({ message: "Consignee not found" });
            }
        }

        // Create the order in the database
        const newOrder = new Order(orderData);
        await newOrder.save();

        return res
            .status(201)
            .json({ message: "Order created successfully", order: newOrder });
    } catch (error) {
        console.error(error);
        return res
            .status(500)
            .json({ message: "Error creating order", error: error.message });
    }
};

// Controller to update an order's details
const updateOrder = async (req, res) => {
    try {
        const { orderId } = req.params; // Get the orderId from the request parameters
        const updatedData = req.body; // Data to update from the request body

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
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
            destination_hub_id,
            source_hub_id,
            docket_number,
            created_by,
            delivered_by,
            consignor_id,
            consignee_id,
            consignor_name,
            consignee_name,
            payment_method,
        } = req.query;

        const filterConditions = {};

        // Filter by status if provided
        if (status) {
            filterConditions.status = status;
        }
        // Filter by docket_number if provided
        if (docket_number) {
            filterConditions.docket_number = docket_number;
        }
        // Filter by source branch if provided
        if (source_branch_id) {
            filterConditions.source_branch_id = source_branch_id;
        }

        // Filter by destination branch if provided
        if (destination_branch_id) {
            filterConditions.destination_branch_id = destination_branch_id;
        }
        // Filter by source branch if provided
        if (source_hub_id) {
            filterConditions.source_hub_id = source_hub_id;
        }

        // Filter by destination branch if provided
        if (destination_hub_id) {
            filterConditions.destination_hub_id = destination_hub_id;
        }

        // Filter by transport type if provided
        if (transport_type) {
            filterConditions.transport_type = transport_type;
        }
        // Filter by created user
        if (created_by) {
            filterConditions.created_by = created_by;
        }

        // Filter by delivered user
        if (delivered_by) {
            filterConditions.delivered_by = delivered_by;
        }
        // Filter by consignor_id
        if (consignor_id) {
            filterConditions.consignor_id = consignor_id;
        } // Filter by consignee_id
        if (consignee_id) {
            filterConditions.consignee_id = consignee_id;
        }
        // Filter by consignor_name
        if (consignor_name) {
            filterConditions.consignor.name = consignor_name;
        } // Filter by consignee_name
        if (consignee_name) {
            filterConditions.consignee.name = consignee_name;
        }
        if (payment_method) {
            filterConditions.payment_method = payment_method;
        }

        const orders = await Order.find(filterConditions); // Fetch filtered orders
        return res.status(200).json({ orders });
    } catch (error) {
        console.error(error);
        return res
            .status(500)
            .json({ message: "Error filtering orders", error: error.message });
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
};
