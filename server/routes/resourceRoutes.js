const express = require("express");
const mongoose = require("mongoose");

const Resource = require("../models/Resource");
const Booking = require("../models/Booking");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// GET /api/resources
// Public: Explore available resources
router.get("/", async (req, res) => {
  try {
    const { search, category } = req.query;
    const filter = { isAvailable: true };

    if (category && category !== "All items") {
      filter.category = category;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
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
// Authenticated: Get only the logged-in user's listings
router.get("/mine", authMiddleware, async (req, res) => {
  try {
    const resources = await Resource.find({
      ownerId: req.user.id,
    })
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      count: resources.length,
      data: resources,
    });
  } catch (error) {
    console.error("FETCH MY LISTINGS ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Unable to fetch your listings.",
    });
  }
});

// POST /api/resources
// Authenticated: Create a listing owned by the logged-in user
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

    if (
      !title?.trim() ||
      !description?.trim() ||
      !category?.trim() ||
      !location?.trim() ||
      pricePerDay === undefined ||
      !Number.isFinite(Number(pricePerDay)) ||
      Number(pricePerDay) < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide valid resource details.",
      });
    }

    const resource = await Resource.create({
      title: title.trim(),
      description: description.trim(),
      category: category.trim(),
      pricePerDay: Number(pricePerDay),
      imageUrl: imageUrl?.trim() || "",
      location: location.trim(),

      // Never trust ownerId supplied by the frontend.
      ownerId: req.user.id,

      // Keep the owner name supplied by your existing frontend
      // for display only. Ownership is determined by ownerId.
      ownerName: req.body.ownerName?.trim() || "ShareSpace Member",

      isAvailable: true,
    });

    res.status(201).json({
      success: true,
      message: "Resource listed successfully.",
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
// Authenticated: Edit only your own listing
router.patch("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid resource ID.",
      });
    }

    const resource = await Resource.findOne({
      _id: id,
      ownerId: req.user.id,
    });

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: "Listing not found or you do not own it.",
      });
    }

    const allowedFields = [
      "title",
      "description",
      "category",
      "pricePerDay",
      "imageUrl",
      "location",
    ];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        resource[field] =
          field === "pricePerDay"
            ? Number(req.body[field])
            : typeof req.body[field] === "string"
              ? req.body[field].trim()
              : req.body[field];
      }
    }

    await resource.save();

    res.json({
      success: true,
      message: "Listing updated successfully.",
      data: resource,
    });
  } catch (error) {
    console.error("UPDATE RESOURCE ERROR:", error);

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
      message: "Unable to update listing.",
    });
  }
});

// PATCH /api/resources/:id/availability
// Authenticated: Change availability of your own listing
router.patch(
  "/:id/availability",
  authMiddleware,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { isAvailable } = req.body;

      if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid resource ID.",
        });
      }

      if (typeof isAvailable !== "boolean") {
        return res.status(400).json({
          success: false,
          message: "isAvailable must be true or false.",
        });
      }

      const resource = await Resource.findOne({
        _id: id,
        ownerId: req.user.id,
      });

      if (!resource) {
        return res.status(404).json({
          success: false,
          message: "Listing not found or you do not own it.",
        });
      }

      resource.isAvailable = isAvailable;
      await resource.save();

      res.json({
        success: true,
        message: "Availability updated successfully.",
        data: resource,
      });
    } catch (error) {
      console.error("UPDATE AVAILABILITY ERROR:", error);
      res.status(500).json({
        success: false,
        message: "Unable to update availability.",
      });
    }
  }
);

// DELETE /api/resources/:id
// Authenticated: Delete only your own listing
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid resource ID.",
      });
    }

    const resource = await Resource.findOne({
      _id: id,
      ownerId: req.user.id,
    });

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: "Listing not found or you do not own it.",
      });
    }

    // Preserve booking history and avoid deleting a resource
    // that has a pending or approved booking.
    const activeBooking = await Booking.exists({
      resource: resource._id,
      status: { $in: ["pending", "approved"] },
    });

    if (activeBooking) {
      return res.status(409).json({
        success: false,
        message:
          "This listing has a pending or approved booking. Resolve the booking before deleting it.",
      });
    }

    await Resource.deleteOne({ _id: resource._id });

    res.json({
      success: true,
      message: "Listing deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE RESOURCE ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Unable to delete listing.",
    });
  }
});

module.exports = router;