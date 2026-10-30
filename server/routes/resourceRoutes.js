const express = require("express");
const Resource = require("../models/Resource");

const router = express.Router();

// GET /api/resources
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
      message: "Unable to fetch resources",
      error: error.message,
    });
  }
});

// POST /api/resources
router.post("/", async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      pricePerDay,
      imageUrl,
      location,
      ownerName,
    } = req.body;

    const resource = await Resource.create({
      title,
      description,
      category,
      pricePerDay,
      imageUrl,
      location,
      ownerName,
    });

    res.status(201).json({
      success: true,
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
      message: "Unable to create resource",
      error: error.message,
    });
  }
});

module.exports = router;