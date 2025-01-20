const Manifest = require('../models/manifest');


const createManifest = async (req, res) => {
    try {
        const { loaderId, sourceHubID, destinationHubID, vehicleNumber, gpsLocation, estimatedDeliveryDate, driverContactNumber, orderIDs, batchIDs, status } = req.body;
        const { userId } = req.user;  // Assuming userId is available from authentication

        const newManifest = new Manifest({
            loaderId,
            sourceHubID,
            destinationHubID,
            vehicleNumber,
            gpsLocation,
            estimatedDeliveryDate,
            driverContactNumber,
            orderIDs,
            batchIDs,
            createdBy: userId,
            updatedBy: userId,
            status: status || 'Pending',
        });

        await newManifest.save();

        return res.status(201).json({ message: 'Manifest created successfully', manifest: newManifest });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error creating manifest', error: error.message });
    }
};


const getAllManifests = async (req, res) => {
    try {
        const manifests = await Manifest.find()
            .populate('loaderId sourceHubID destinationHubID orderIDs batchIDs createdBy updatedBy');

        if (!manifests.length) {
            return res.status(200).json(manifests);
        }

        return res.status(200).json(manifests);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error fetching manifests', error: error.message });
    }
};


const updateManifest = async (req, res) => {
    try {
        const { id } = req.params;
        const { loaderId, sourceHubID, destinationHubID, vehicleNumber, gpsLocation, estimatedDeliveryDate, driverContactNumber, orderIDs, batchIDs, status } = req.body;
        const { userId } = req.user;

        const manifest = await Manifest.findById(id);
        if (!manifest) {
            return res.status(404).json({ message: 'Manifest not found' });
        }

        manifest.loaderId = loaderId;
        manifest.sourceHubID = sourceHubID;
        manifest.destinationHubID = destinationHubID;
        manifest.vehicleNumber = vehicleNumber;
        manifest.gpsLocation = gpsLocation;
        manifest.estimatedDeliveryDate = estimatedDeliveryDate;
        manifest.driverContactNumber = driverContactNumber;
        manifest.orderIDs = orderIDs;
        manifest.batchIDs = batchIDs;
        manifest.updatedBy = userId;
        manifest.status = status;

        await manifest.save();

        return res.status(200).json({ message: 'Manifest updated successfully', manifest });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error updating manifest', error: error.message });
    }
};


const deleteManifest = async (req, res) => {
    try {
        const { id } = req.params;

        const manifest = await Manifest.findById(id);
        if (!manifest) {
            return res.status(404).json({ message: 'Manifest not found' });
        }

        await manifest.remove();

        return res.status(200).json({ message: 'Manifest deleted successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error deleting manifest', error: error.message });
    }
};


// Controller to fetch a manifest by ID
const getManifestById = async (req, res) => {
    try {
        const { id } = req.params;  // Get the manifest ID from the request parameters

        // Find the manifest by ID and populate any references (e.g., loaderId, sourceHubID, destinationHubID)
        const manifest = await Manifest.findById(id)
            .populate('loaderId')  // Populate the loader reference
            .populate('sourceHubID')  // Populate sourceHubID reference
            .populate('destinationHubID');  // Populate destinationHubID reference

        if (!manifest) {
            return res.status(404).json({ message: 'Manifest not found' });
        }

        return res.status(200).json(manifest);  // Return the found manifest
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error fetching manifest', error: error.message });
    }
};

module.exports = {
    createManifest,
    getAllManifests,
    updateManifest,
    getManifestById,
    deleteManifest,
};
