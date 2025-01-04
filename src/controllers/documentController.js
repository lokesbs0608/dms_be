const Document = require("../models/documents");
const Employee = require("../models/employee");

// Create Document
const createDocument = async (req, res) => {
    try {
        const { name, number, file_url, description } = req.body;

        // Check if the user is authorized to create (admin, super_admin, or employee)
        if (req.user.role !== "super_admin" && req.user.role !== "admin" && req.user.role !== "employee") {
            return res.status(403).json({
                message: "Access Denied. Only Super Admin, Admin, or Employee can create a document."
            });
        }

        const document = new Document({
            name,
            number,
            file_url,
            description,
        });

        await document.save();
        res.status(201).json({ message: "Document created successfully", document });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

// Get Document by ID (Only for Super Admin or Admin)
const getDocumentById = async (req, res) => {
    try {
        if (req.user.role !== "super_admin" && req.user.role !== "admin") {
            return res.status(403).json({
                message: "Access Denied. Only Super Admin or Admin can view a document."
            });
        }

        const { id } = req.params;
        const document = await Document.findById(id);
        if (!document)
            return res.status(404).json({ message: "Document not found" });

        res.status(200).json({ document });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

// Update Document (Available for Super Admin, Admin, or Employee)
const updateDocument = async (req, res) => {
    try {
        // Check if the user is authorized to update (admin, super_admin, or employee)
        if (req.user.role !== "super_admin" && req.user.role !== "admin" && req.user.role !== "employee") {
            return res.status(403).json({
                message: "Access Denied. Only Super Admin, Admin, or Employee can update a document."
            });
        }

        const { id } = req.params;
        const { name, number, file_url, description } = req.body;

        const updatedDocument = await Document.findByIdAndUpdate(
            id,
            { name, number, file_url, description },
            { new: true }
        );
        if (!updatedDocument)
            return res.status(404).json({ message: "Document not found" });

        res.status(200).json({ message: "Document updated successfully", updatedDocument });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

// Delete Document (Available for Super Admin or Admin)
const deleteDocument = async (req, res) => {
    try {
        // Check if the user is authorized to delete (admin, super_admin)
        if (req.user.role !== "super_admin" && req.user.role !== "admin") {
            return res.status(403).json({
                message: "Access Denied. Only Super Admin or Admin can delete a document."
            });
        }

        const { id } = req.params;
        const deletedDocument = await Document.findByIdAndDelete(id);
        if (!deletedDocument)
            return res.status(404).json({ message: "Document not found" });

        res.status(200).json({ message: "Document deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createDocument,
    getDocumentById,
    updateDocument,
    deleteDocument,
};
