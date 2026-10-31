const express = require("express");
const mongoose = require("mongoose");
const Notification = require("../models/Notification");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();
router.use(authMiddleware);

// GET /api/notifications — only the signed-in user's notifications
router.get("/", async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user.id })
      .populate("booking", "status startDate endDate")
      .populate("resource", "title imageUrl")
      .sort({ createdAt: -1 })
      .limit(50);
    const unreadCount = await Notification.countDocuments({ recipient: req.user.id, isRead: false });
    res.json({ success: true, unreadCount, count: notifications.length, data: notifications });
  } catch (error) {
    console.error("FETCH NOTIFICATIONS ERROR:", error);
    res.status(500).json({ success: false, message: "Unable to fetch notifications." });
  }
});

// PATCH /api/notifications/read-all
router.patch("/read-all", async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { recipient: req.user.id, isRead: false },
      { $set: { isRead: true } }
    );
    res.json({ success: true, message: "All notifications marked as read.", modifiedCount: result.modifiedCount });
  } catch (error) {
    console.error("MARK ALL NOTIFICATIONS READ ERROR:", error);
    res.status(500).json({ success: false, message: "Unable to mark notifications as read." });
  }
});

// PATCH /api/notifications/:id/read
router.patch("/:id/read", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid notification ID." });
    }
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user.id },
      { $set: { isRead: true } },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found." });
    }
    res.json({ success: true, data: notification });
  } catch (error) {
    console.error("MARK NOTIFICATION READ ERROR:", error);
    res.status(500).json({ success: false, message: "Unable to update notification." });
  }
});

module.exports = router;
