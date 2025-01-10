const express = require("express");
const { createHub, updateHub, deleteHub, getHubById, getAllHubs, archiveHub, unArchiveHub } = require("../controllers/hubController");
const authenticate = require("../middleware/auth");

const router = express.Router();

router.post("/", authenticate, createHub);
router.put("/:id", authenticate, updateHub);
router.delete("/:id", authenticate, deleteHub);
router.get("/:id", authenticate, getHubById);
router.get("/", authenticate, getAllHubs);
router.patch("/:id/archive", authenticate, archiveHub);
router.patch("/:id/unarchive", authenticate, unArchiveHub);

module.exports = router;
