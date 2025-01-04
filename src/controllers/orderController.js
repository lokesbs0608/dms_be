const Order = require("../models/order");

exports.createOrder = async (req, res) => {
    try {
        const newOrder = await Order.create(req.body);
        res.status(201).json({ success: true, data: newOrder });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.getOrders = async (req, res) => {
    try {
        const orders = await Order.find();
        res.status(200).json({ success: true, data: orders });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
