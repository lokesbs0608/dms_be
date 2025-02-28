const mongoose = require("mongoose");
const Manifest = require("../models/manifest"); // Adjust the path as necessary
const Order = require("../models/order"); // Assuming you have an Order model
const Hub = require("../models/hub");;

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
            transport_type
        } = req.body;

        if (!Array.isArray(orderIDs) || orderIDs.length === 0) {
            return res
                .status(400)
                .json({ message: "orderIDs must be a non-empty array." });
        }

        // Fetch the source hub details
        const sourceHub = await Hub.findById(sourceHubID);
        if (!sourceHub) {
            return res.status(400).json({ message: "Invalid source hub ID." });
        }

        const hubPrefix = sourceHub.name.substring(0, 3).toUpperCase();

        // Fetch the last created manifest for this hub
        const lastManifest = await Manifest.findOne({ code: new RegExp(`^${hubPrefix}`) })
            .sort({ code: -1 });

        let newManifestNumber;

        if (!lastManifest) {
            newManifestNumber = `${hubPrefix}A000001`;
        } else {
            const lastManifestNumber = lastManifest.manifestNumber; // Example: "BLRA000123"
            const letterPart = lastManifestNumber.charAt(3); // Extract "A"
            const numericPart = parseInt(lastManifestNumber.substring(4)); // Extract "000123" -> 123

            if (numericPart < 999999) {
                newManifestNumber = `${hubPrefix}${letterPart}${String(numericPart + 1).padStart(6, "0")}`;
            } else {
                // Move to the next letter (A -> B, B -> C, ..., Z -> reset or handle accordingly)
                const nextLetter = String.fromCharCode(letterPart.charCodeAt(0) + 1);
                if (nextLetter > "Z") {
                    return res.status(400).json({ message: "Series limit reached." });
                }
                newManifestNumber = `${hubPrefix}${nextLetter}000001`;
            }
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
            transport_type,
            orderIDs,
            createdBy: req?.user?.id,
            updatedBy: req?.user?.id,
            status: status || "Pending",
            code: newManifestNumber, // Assign generated number
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
        let query = {}; // Initialize an empty query object

        // Extract query parameters from request
        const {
            loaderId,
            sourceHubID,
            destinationHubID,
            vehicleNumber,
            status,
            transport_type,
            estimatedDeliveryDate,
            orderDocketNumber, // To filter by a specific order’s docket number
            orderStatus, // To filter orders by status
        } = req.query;

        // Apply filters based on query parameters
        if (loaderId) query.loaderId = loaderId;
        if (sourceHubID) query.sourceHubID = sourceHubID;
        if (destinationHubID) query.destinationHubID = destinationHubID;
        if (vehicleNumber) query.vehicleNumber = vehicleNumber;
        if (status) query.status = status;
        if (transport_type) query.transport_type = transport_type;
        if (estimatedDeliveryDate) {
            query.estimatedDeliveryDate = { $gte: new Date(estimatedDeliveryDate) };
        }

        // Order-based filtering inside the `orderIDs` array
        if (orderDocketNumber || orderStatus) {
            query.orderIDs = { $elemMatch: {} };
            if (orderDocketNumber) {
                query.orderIDs.$elemMatch.docketNumber = orderDocketNumber;
            }
            if (orderStatus) {
                query.orderIDs.$elemMatch["items.status"] = orderStatus;
            }
        }

        console.log(query)

        // Fetch manifests with applied filters and populate references
        const manifests = await Manifest.find(query).populate(
            "loaderId sourceHubID destinationHubID"
        );

        return res.status(200).json(manifests);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error fetching manifests", error: error.message });
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

const updateManifestStatus = async (req, res) => {
    try {
        const { manifestId, status } = req.params;
        console.log(manifestId, status);

        if (!manifestId || !status) {
            return res.status(400).json({
                message: "Manifest ID and Status are required.",
            });
        }

        // Find the manifest
        const manifest = await Manifest.findById(manifestId);
        if (!manifest) {
            return res.status(404).json({ message: "Manifest not found" });
        }

        // Extract order IDs from the manifest
        const orderIdsArray = manifest.orderIDs.map(order => order._id);

        if (status === "In Transit") {
            // Update order status and items' statuses
            await Order.updateMany(
                { _id: { $in: orderIdsArray } },
                {
                    $set: {
                        status: status,
                        "items.$[].status": status,
                    },
                }
            );
        }
        else if (status === "Delivered") {
            await Order.updateMany(
                { _id: { $in: orderIdsArray } },
                {
                    $set: {
                        status: 'Reached Destination Hub',
                        "items.$[].status": 'Reached Destination Hub',
                    },
                }
            );
        }
        else if (status === "Pending") {
            await Order.updateMany(
                { _id: { $in: orderIdsArray } },
                {
                    $set: {
                        status: 'Manifested',
                        "items.$[].status": 'Manifested',
                    },
                }
            );
        }

        // Always update the manifest's orderIDs and items' statuses
        const updatedManifest = await Manifest.findByIdAndUpdate(
            manifestId,
            {
                $set: {
                    status: status,
                    "orderIDs.$[].items.$[].status": status // Update status for items in orderIDs
                }
            },
            { new: true }
        );

        return res.status(200).json({
            message: "Manifest status updated successfully.",
            updatedManifest,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Error updating manifest status",
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
    updateManifestStatus,
    removeOrderId,
};
