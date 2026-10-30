const express = require("express");
const mongoose = require("mongoose");

const Resource = require("../models/Resource");
const Booking = require("../models/Booking");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// GET /api/resources
// Public: fetch available resources.
router.get("/", async (req, res) => {
  try {
    const { search, category } = req.query;

    const filter = {
      isAvailable: true,
    };

    if (category && category !== "All items") {
      filter.category = category;
    }

    if (search && search.trim()) {
      const escapedSearch = search.trim().replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );

      filter.$or = [
        { title: { $regex: escapedSearch, $options: "i" } },
        { description: { $regex: escapedSearch, $options: "i" } },
        { location: { $regex: escapedSearch, $options: "i" } },
      ];
    }

    const resources = await Resource.find(filter)
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    res.json({
      success: true,
      count: resources.length,
      data: resources,
    });
  } catch (error) {
    console.error("FETCH RESOURCES ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch resources.",
    });
  }
});

// GET /api/resources/mine
// Authenticated: fetch resources belonging to the current user.
router.get("/mine", authMiddleware, async (req, res) => {
  try {
    const resources = await Resource.find({
      ownerId: req.user.id,
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: resources.length,
      data: resources,
    });
  } catch (error) {
    console.error("FETCH MY RESOURCES ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch your resources.",
    });
  }
});

// GET /api/resources/:id
// Public: fetch a single resource.
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid resource ID.",
      });
    }

    const resource = await Resource.findById(id).lean();

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: "Resource not found.",
      });
    }

    res.json({
      success: true,
      data: resource,
    });
  } catch (error) {
    console.error("FETCH RESOURCE ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch resource.",
    });
  }
});

// POST /api/resources
// Authenticated: create a resource owned by the logged-in user.
router.post("/", authMiddleware, async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      pricePerDay,
      imageUrl,
      location,
    } = req.body;

    const ownerName =
      req.user.name && req.user.name.trim()
        ? req.user.name.trim()
        : "ShareSpace User";

    const resource = await Resource.create({
      title,
      description,
      category,
      pricePerDay,
      imageUrl,
      location,
      ownerId: req.user.id,
      ownerName,
    });

    res.status(201).json({
      success: true,
      message: "Resource created successfully.",
      data: resource,
    });
  } catch (error) {
    console.error("CREATE RESOURCE ERROR:", error);

    if (
      error.name === "ValidationError" ||
      error.name === "CastError"
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Unable to create resource.",
    });
  }
});

// PATCH /api/resources/:id
// Authenticated: update your own resource.
router.patch("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid resource ID.",
      });
    }

    const resource = await Resource.findById(id);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: "Resource not found.",
      });
    }

    if (!resource.ownerId) {
      return res.status(403).json({
        success: false,
        message: "This resource has no registered owner.",
      });
    }

    if (resource.ownerId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own resources.",
      });
    }

    const allowedFields = [
      "title",
      "description",
      "category",
      "pricePerDay",
      "imageUrl",
      "location",
      "isAvailable",
    ];

    for (const field of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        resource[field] = req.body[field];
      }
    }

    await resource.save();

    res.json({
      success: true,
      message: "Resource updated successfully.",
      data: resource,
    });
  } catch (error) {
    console.error("UPDATE RESOURCE ERROR:", error);

    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Unable to update resource.",
    });
  }
});

// DELETE /api/resources/:id
// Authenticated: delete your own resource.
// Do not delete resources that have active bookings.
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid resource ID.",
      });
    }

    const resource = await Resource.findById(id);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: "Resource not found.",
      });
    }

    if (!resource.ownerId || resource.ownerId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own resources.",
      });
    }

    const activeBooking = await Booking.exists({
      resource: resource._id,
      status: { $in: ["pending", "approved"] },
    });

    if (activeBooking) {
      return res.status(409).json({
        success: false,
        message:
          "This resource has pending or approved bookings. Resolve them before deleting it.",
      });
    }

    await resource.deleteOne();

    res.json({
      success: true,
      message: "Resource deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE RESOURCE ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Unable to delete resource.",
    });
  }
});

module.exports = router;
