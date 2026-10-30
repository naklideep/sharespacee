const express = require("express");
const mongoose = require("mongoose");

const Booking = require("../models/Booking");
const Resource = require("../models/Resource");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

const ACTIVE_STATUSES = ["pending", "approved"];

// POST /api/bookings
// Request a resource booking.
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

    // Prevent new bookings starting in the past.
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const requestedStart = new Date(start);
    requestedStart.setHours(0, 0, 0, 0);

    if (requestedStart < today) {
      return res.status(400).json({
        success: false,
        message: "The booking start date cannot be in the past.",
      });
    }

    const resource = await Resource.findById(resourceId);

    if (!resource || !resource.isAvailable) {
      return res.status(404).json({
        success: false,
        message: "Resource not found or unavailable.",
      });
    }

    if (!resource.ownerId) {
      return res.status(409).json({
        success: false,
        message:
          "This resource has no registered owner and cannot be booked yet.",
      });
    }

    if (resource.ownerId.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: "You cannot book your own resource.",
      });
    }

    // Check existing pending or approved bookings.
    const overlappingBooking = await Booking.findOne({
      resource: resource._id,
      status: { $in: ACTIVE_STATUSES },
      startDate: { $lt: end },
      endDate: { $gt: start },
    });

    if (overlappingBooking) {
      return res.status(409).json({
        success: false,
        message:
          "A pending or approved booking already overlaps those dates.",
      });
    }

    // Calculate price using calendar dates.
    const startDay = Date.UTC(
      start.getUTCFullYear(),
      start.getUTCMonth(),
      start.getUTCDate()
    );

    const endDay = Date.UTC(
      end.getUTCFullYear(),
      end.getUTCMonth(),
      end.getUTCDate()
    );

    const days = Math.ceil(
      (endDay - startDay) / (1000 * 60 * 60 * 24)
    );

    if (days < 1) {
      return res.status(400).json({
        success: false,
        message: "The booking must last at least one day.",
      });
    }

    const totalPrice = days * resource.pricePerDay;

    const booking = await Booking.create({
      resource: resource._id,
      borrower: req.user.id,
      owner: resource.ownerId,
      startDate: start,
      endDate: end,
      totalPrice,
      status: "pending",
    });

    res.status(201).json({
      success: true,
      message: "Booking request submitted successfully.",
      data: booking,
    });
  } catch (error) {
    console.error("CREATE BOOKING ERROR:", error);

    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Unable to create booking.",
    });
  }
});

// GET /api/bookings/mine
// View booking requests made by the logged-in user.
router.get("/mine", authMiddleware, async (req, res) => {
  try {
    const bookings = await Booking.find({
      borrower: req.user.id,
    })
      .populate("resource")
      .populate("owner", "name email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    console.error("FETCH MY BOOKINGS ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch your bookings.",
    });
  }
});

// GET /api/bookings/received
// View booking requests for resources owned by the logged-in user.
router.get("/received", authMiddleware, async (req, res) => {
  try {
    const bookings = await Booking.find({
      owner: req.user.id,
    })
      .populate("resource")
      .populate("borrower", "name email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    console.error("FETCH RECEIVED BOOKINGS ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch received bookings.",
    });
  }
});

// PATCH /api/bookings/:id/status
// Resource owner approves or rejects a pending booking.
router.patch("/:id/status", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID.",
      });
    }

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be approved or rejected.",
      });
    }

    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    if (booking.owner.toString() !== req.user.id) {
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
          message: "Another approved booking overlaps these dates.",
        });
      }
    }

    booking.status = status;
    await booking.save();

    res.json({
      success: true,
      message: `Booking ${status} successfully.`,
      data: booking,
    });
  } catch (error) {
    console.error("UPDATE BOOKING STATUS ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Unable to update booking status.",
    });
  }
});

// PATCH /api/bookings/:id/cancel
// A borrower can cancel their own pending booking.
router.patch("/:id/cancel", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID.",
      });
    }

    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    if (booking.borrower.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You can only cancel your own bookings.",
      });
    }

    if (booking.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending bookings can be cancelled.",
      });
    }

    booking.status = "cancelled";
    await booking.save();

    res.json({
      success: true,
      message: "Booking cancelled successfully.",
      data: booking,
    });
  } catch (error) {
    console.error("CANCEL BOOKING ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Unable to cancel booking.",
    });
  }
});

module.exports = router;
