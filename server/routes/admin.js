const express = require("express");
const mongoose = require("mongoose");
const User = require("../models/User");
const Resource = require("../models/Resource");
const Booking = require("../models/Booking");
const Report = require("../models/Report");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();
router.use(authMiddleware, adminMiddleware);

// Overview uses real MongoDB counts; no fabricated analytics.
router.get("/stats", async (req, res) => {
  try {
    const [users, blockedUsers, resources, availableResources, bookings, pendingBookings, reports, openReports] = await Promise.all([
      User.countDocuments(), User.countDocuments({ isBlocked: true }),
      Resource.countDocuments(), Resource.countDocuments({ isAvailable: true }),
      Booking.countDocuments(), Booking.countDocuments({ status: "pending" }),
      Report.countDocuments(), Report.countDocuments({ status: { $in: ["open", "reviewing"] } })
    ]);
    const bookingStatuses = await Booking.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]);
    const recentBookings = await Booking.find().sort({ createdAt: -1 }).limit(6)
      .populate("borrower", "name email").populate("owner", "name").populate("resource", "title").lean();
    res.json({ success: true, data: { users, blockedUsers, resources, availableResources, bookings, pendingBookings, reports, openReports, bookingStatuses, recentBookings } });
  } catch (error) {
    console.error("ADMIN STATS ERROR:", error);
    res.status(500).json({ success: false, message: "Unable to load dashboard statistics." });
  }
});

router.get("/users", async (req, res) => {
  try {
    const q = String(req.query.q || "").trim().slice(0, 80);
    const filter = q ? { $or: [{ name: { $regex: q, $options: "i" } }, { email: { $regex: q, $options: "i" } }] } : {};
    const users = await User.find(filter).select("-password").sort({ createdAt: -1 }).limit(200).lean();
    res.json({ success: true, data: users });
  } catch (error) { res.status(500).json({ success: false, message: "Unable to load users." }); }
});

router.patch("/users/:id/block", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid user ID." });
    const { isBlocked } = req.body;
    if (typeof isBlocked !== "boolean") return res.status(400).json({ success: false, message: "isBlocked must be true or false." });
    if (req.params.id === String(req.user.id)) return res.status(400).json({ success: false, message: "You cannot suspend your own admin account." });
    const target = await User.findById(req.params.id);
    if (!target) return res.status(404).json({ success: false, message: "User not found." });
    if (target.role === "admin") return res.status(403).json({ success: false, message: "Admin accounts cannot be suspended here." });
    target.isBlocked = isBlocked;
    await target.save();
    res.json({ success: true, message: isBlocked ? "User suspended." : "User restored.", data: { id: target._id, isBlocked: target.isBlocked } });
  } catch (error) { res.status(500).json({ success: false, message: "Unable to update user." }); }
});

router.get("/resources", async (req, res) => {
  try {
    const resources = await Resource.find().sort({ createdAt: -1 }).limit(200).populate("ownerId", "name email").lean();
    res.json({ success: true, data: resources });
  } catch (error) { res.status(500).json({ success: false, message: "Unable to load listings." }); }
});

router.patch("/resources/:id/availability", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid listing ID." });
    if (typeof req.body.isAvailable !== "boolean") return res.status(400).json({ success: false, message: "isAvailable must be true or false." });
    const item = await Resource.findByIdAndUpdate(req.params.id, { isAvailable: req.body.isAvailable }, { new: true });
    if (!item) return res.status(404).json({ success: false, message: "Listing not found." });
    res.json({ success: true, data: item });
  } catch (error) { res.status(500).json({ success: false, message: "Unable to update listing." }); }
});

router.delete("/resources/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid listing ID." });
    const item = await Resource.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Listing not found." });
    const active = await Booking.exists({ resource: item._id, status: { $in: ["pending", "approved"] } });
    if (active) return res.status(409).json({ success: false, message: "Resolve pending or approved bookings before deleting this listing." });
    await item.deleteOne();
    res.json({ success: true, message: "Listing deleted." });
  } catch (error) { res.status(500).json({ success: false, message: "Unable to delete listing." }); }
});

router.get("/bookings", async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 }).limit(250)
      .populate("resource", "title").populate("borrower", "name email").populate("owner", "name email").lean();
    res.json({ success: true, data: bookings });
  } catch (error) { res.status(500).json({ success: false, message: "Unable to load bookings." }); }
});

router.get("/reports", async (req, res) => {
  try {
    const reports = await Report.find().sort({ createdAt: -1 }).limit(250)
      .populate("reporter", "name email").populate("reportedUser", "name email").populate("resource", "title").lean();
    res.json({ success: true, data: reports });
  } catch (error) { res.status(500).json({ success: false, message: "Unable to load reports." }); }
});

router.patch("/reports/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid report ID." });
    const allowed = ["open", "reviewing", "resolved", "dismissed"];
    if (!allowed.includes(req.body.status)) return res.status(400).json({ success: false, message: "Invalid report status." });
    const report = await Report.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    if (!report) return res.status(404).json({ success: false, message: "Report not found." });
    res.json({ success: true, data: report });
  } catch (error) { res.status(500).json({ success: false, message: "Unable to update report." }); }
});

module.exports = router;
