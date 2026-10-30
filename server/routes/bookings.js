const express = require("express");
const mongoose = require("mongoose");
const Booking = require("../models/Booking");
const Resource = require("../models/Resource");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// POST /api/bookings — request a booking
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { resourceId, startDate, endDate } = req.body;

    if (
      !mongoose.isValidObjectId(resourceId) ||
      !startDate ||
      !endDate
    ) {
      return res.status(400).json({
        success: false,
        message: "A valid resource ID, start date, and end date are required.",
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime()) ||
      end <= start
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid date range.",
      });
    }

    const resource = await Resource.findById(resourceId);

    if (!resource || !resource.isAvailable) {
      return res.status(404).json({
        success: false,
        message: "Resource not found or unavailable.",
      });
    }

    if (
      resource.ownerId &&
      resource.ownerId.toString() === req.user.id
    ) {
      return res.status(400).json({
        success: false,
        message: "You cannot book your own resource.",
      });
    }

    // Prevent overlapping bookings that have already been approved.
    const overlappingBooking = await Booking.findOne({
      resource: resource._id,
      status: "approved",
      startDate: { $lt: end },
      endDate: { $gt: start },
    });

    if (overlappingBooking) {
      return res.status(409).json({
        success: false,
        message: "The resource is already booked for those dates.",
      });
    }

    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const totalPrice = days * resource.pricePerDay;

    const booking = await Booking.create({
      resource: resource._id,
      borrower: req.user.id,
      owner: resource.ownerId,
      startDate: start,
      endDate: end,
      totalPrice,
    });

    res.status(201).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    console.error("Create booking error:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to create booking.",
    });
  }
});

// GET /api/bookings/mine — bookings requested by the current user
router.get("/mine", authMiddleware, async (req, res) => {
  try {
    const bookings = await Booking.find({ borrower: req.user.id })
      .populate("resource")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    console.error("Fetch bookings error:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to fetch bookings.",
    });
  }
});

// PATCH /api/bookings/:id/status — owner approves or rejects
router.patch("/:id/status", authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be approved or rejected.",
      });
    }

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    if (!booking.owner || booking.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Only the resource owner can update this booking.",
      });
    }

    if (booking.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending bookings can be updated.",
      });
    }

    if (status === "approved") {
      const overlap = await Booking.findOne({
        _id: { $ne: booking._id },
        resource: booking.resource,
        status: "approved",
        startDate: { $lt: booking.endDate },
        endDate: { $gt: booking.startDate },
      });

      if (overlap) {
        return res.status(409).json({
          success: false,
          message: "Another booking overlaps these dates.",
        });
      }
    }

    booking.status = status;
    await booking.save();

    res.json({
      success: true,
      data: booking,
    });
  } catch (error) {
    console.error("Update booking error:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to update booking.",
    });
  }
});

module.exports = router;