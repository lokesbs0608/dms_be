const mongoose = require("mongoose");
const Manifest = require("../models/manifest"); // Adjust the path as necessary
const Order = require("../models/order"); // Assuming you have an Order model

const createManifest = async (req, res) => {
    try {
        const {
            loaderId,
            sourceHubID,
            destinationHubID,
            vehicleNumber,
            gpsLocation,
            estimatedDeliveryDate,
            driverContactNumber,
            orderIDs,
            status,
        } = req.body;

        if (!Array.isArray(orderIDs) || orderIDs.length === 0) {
            return res
                .status(400)
                .json({ message: "orderIDs must be a non-empty array." });
        }

        // Create the manifest
        const newManifest = new Manifest({
            loaderId,
            sourceHubID,
            destinationHubID,
            vehicleNumber,
            gpsLocation,
            estimatedDeliveryDate,
            driverContactNumber,
            orderIDs,
            createdBy: req?.user?.id,
            updatedBy: req?.user?.id,
            status: status || "Pending",
            ...req?.body,
        });

        await newManifest.save();

        // Extract only order IDs (if orderIDs is an array of objects)
        const orderIdsArray = orderIDs.map((order) => order._id || order);

        // Update order status and items status
        await Order.updateMany(
            { _id: { $in: orderIdsArray } },
            {
                $set: {
                    status: "Manifested",
                    "items.$[elem].status": "Manifested",
                },
            },
            { arrayFilters: [{ "elem.status": { $ne: "Manifested" } }] }, // Only update items that are not already "Manifested"
        );
        // Update items status in Manifest collection
        await Manifest.updateMany(
            { _id: newManifest._id, "orderIDs._id": { $in: orderIdsArray } },
            {
                $set: { "orderIDs.$[].items.$[elem].status": "Manifested" },
            },
            { arrayFilters: [{ "elem.status": { $ne: "Manifested" } }] },
        );

        return res
            .status(201)
            .json({ message: "Manifest created successfully and orders updated." });
    } catch (error) {
        console.error(error);
        return res
            .status(500)
            .json({ message: "Error creating manifest", error: error.message });
    }
};

const getAllManifests = async (req, res) => {
    try {
        const manifests = await Manifest.find().populate(
            "loaderId sourceHubID destinationHubID",
        );
        if (!manifests.length) {
            return res.status(200).json(manifests);
        }

        return res.status(200).json(manifests);
    } catch (error) {
        console.error(error);
        return res
            .status(500)
            .json({ message: "Error fetching manifests", error: error.message });
    }
};

const updateManifest = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            loaderId,
            sourceHubID,
            destinationHubID,
            vehicleNumber,
            gpsLocation,
            estimatedDeliveryDate,
            driverContactNumber,
            orderIDs,
            status,
            totalWeight,
            actualWeight,
            no_ofIndividualOrder,
            totalPcs,
            transport_type
        } = req.body;
        const { userId } = req.user;

        const manifest = await Manifest.findById(id);
        if (!manifest) {
            return res.status(404).json({ message: "Manifest not found" });
        }

        // Extract order IDs from request and existing manifest
        const newOrderIdsArray = orderIDs.map((order) => order._id || order);


        await Order.updateMany(
            { _id: { $in: newOrderIdsArray } },
            {
                $set: {
                    status: "Manifested",
                    "items.$[elem].status": "Manifested",
                },
            },
            { arrayFilters: [{ "elem.status": { $ne: "Manifested" } }] } // Update only non-manifested items
        );


        // Update the manifest details
        manifest.loaderId = loaderId;
        manifest.sourceHubID = sourceHubID;
        manifest.destinationHubID = destinationHubID;
        manifest.vehicleNumber = vehicleNumber;
        manifest.gpsLocation = gpsLocation;
        manifest.estimatedDeliveryDate = estimatedDeliveryDate;
        manifest.driverContactNumber = driverContactNumber;
        manifest.orderIDs = orderIDs;
        manifest.updatedBy = userId;
        manifest.status = status;
        manifest.totalWeight = totalWeight;
        manifest.actualWeight = actualWeight;
        manifest.no_ofIndividualOrder = no_ofIndividualOrder;
        manifest.totalPcs = totalPcs;
        manifest.transport_type = transport_type;

        await manifest.save();
        // Update items status in Manifest collection
        await Manifest.updateMany(
            { _id: manifest._id, "orderIDs._id": { $in: newOrderIdsArray } },
            {
                $set: { "orderIDs.$[].items.$[elem].status": "Manifested" },
            },
            { arrayFilters: [{ "elem.status": { $ne: "Manifested" } }] },
        );

        return res
            .status(200)
            .json({ message: "Manifest updated successfully", manifest });
    } catch (error) {
        console.error(error);
        return res
            .status(500)
            .json({ message: "Error updating manifest", error: error.message });
    }
};


const deleteManifest = async (req, res) => {
    try {
        const { id } = req.params;

        const manifest = await Manifest.findById(id);
        if (!manifest) {
            return res.status(404).json({ message: "Manifest not found" });
        }

        await manifest.remove();

        return res.status(200).json({ message: "Manifest deleted successfully" });
    } catch (error) {
        console.error(error);
        return res
            .status(500)
            .json({ message: "Error deleting manifest", error: error.message });
    }
};

// Controller to fetch a manifest by ID
const getManifestById = async (req, res) => {
    try {
        const { id } = req.params;
        const manifest = await Manifest.findById(id);
        if (!manifest) {
            return res.status(404).json({ message: "Manifest not found" });
        }

        return res.status(200).json(manifest); // Return the found manifest
    } catch (error) {
        console.error(error);
        return res
            .status(500)
            .json({ message: "Error fetching manifest", error: error.message });
    }
};

const removeOrderId = async (req, res) => {
    try {
        const { manifestId, orderId } = req.params;

        if (!manifestId || !orderId) {
            return res
                .status(400)
                .json({ message: "Manifest ID and Order ID are required." });
        }

        // Update the order status and its items' statuses to "Pending"
        await Order.updateOne(
            { _id: orderId },
            {
                $set: {
                    status: "Pending",
                    "items.$[].status": "Pending",
                },
            },
        );

        // Remove the orderId object from the manifest's orderIDs array
        const updatedManifest = await Manifest.findByIdAndUpdate(
            manifestId,
            { $pull: { orderIDs: { _id: orderId } } }, // Fix: Correctly remove the object with matching _id
            { new: true },
        );

        if (!updatedManifest) {
            return res
                .status(404)
                .json({ message: "Manifest not found or order ID not present." });
        }

        return res
            .status(200)
            .json({
                message: "Order removed from manifest and status updated successfully.",
                updatedManifest,
            });
    } catch (error) {
        console.error(error);
        return res
            .status(500)
            .json({
                message: "Error removing order from manifest",
                error: error.message,
            });
    }
};

module.exports = {
    createManifest,
    getAllManifests,
    updateManifest,
    getManifestById,
    deleteManifest,
    removeOrderId,
};
