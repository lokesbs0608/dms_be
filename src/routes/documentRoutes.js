const express = require("express");
const router = express.Router();

const {
    createDocument,
    getDocumentById,
    updateDocument,
    deleteDocument
} = require("../controllers/documentController");

// Create Document (Accessible by super_admin, admin, or employee)
router.post("/", createDocument);

// Get Document by ID (Accessible only by super_admin or admin)
router.get("/:id", getDocumentById);

// Update Document (Accessible by super_admin, admin, or employee)
router.put("/:id", updateDocument);

// Delete Document (Accessible only by super_admin or admin)
router.delete("/:id", deleteDocument);

module.exports = router;
