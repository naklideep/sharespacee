const express = require("express");
const mongoose = require("mongoose");
const Report = require("../models/Report");
const Resource = require("../models/Resource");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();
router.use(authMiddleware);
router.post("/", async (req, res) => {
  try {
    const { resourceId, reportedUserId, reason, details } = req.body;
    if (!String(reason || "").trim()) return res.status(400).json({ success: false, message: "A report reason is required." });
    if (resourceId && !mongoose.isValidObjectId(resourceId)) return res.status(400).json({ success: false, message: "Invalid resource ID." });
    if (reportedUserId && !mongoose.isValidObjectId(reportedUserId)) return res.status(400).json({ success: false, message: "Invalid user ID." });
    if (!resourceId && !reportedUserId) return res.status(400).json({ success: false, message: "Select a listing or user to report." });
    if (resourceId && !(await Resource.exists({ _id: resourceId }))) return res.status(404).json({ success: false, message: "Listing not found." });
    const report = await Report.create({ reporter: req.user.id, resource: resourceId || null, reportedUser: reportedUserId || null, reason: String(reason).trim().slice(0,120), details: String(details || "").trim().slice(0,2000) });
    res.status(201).json({ success: true, message: "Report submitted for review.", data: report });
  } catch (error) {
    console.error("SUBMIT REPORT ERROR:", error);
    res.status(500).json({ success: false, message: "Unable to submit report." });
  }
});
module.exports = router;
