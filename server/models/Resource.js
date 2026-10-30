const mongoose = require("mongoose");

const resourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Resource title is required"],
      trim: true,
      maxlength: 100,
    },

    description: {
      type: String,
      required: [true, "Resource description is required"],
      trim: true,
      maxlength: 2000,
    },

    category: {
      type: String,
      required: [true, "Category is required"],
      enum: [
        "Books",
        "Electronics",
        "Photography",
        "Sports",
        "Gaming",
        "Lab Equipment",
        "Stationery",
        "Other",
      ],
    },

    pricePerDay: {
      type: Number,
      required: [true, "Price per day is required"],
      min: [0, "Price cannot be negative"],
    },

    imageUrl: {
      type: String,
      default: "",
      trim: true,
    },

    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
      maxlength: 150,
    },

    ownerName: {
      type: String,
      required: [true, "Owner name is required"],
      trim: true,
      maxlength: 80,
    },

    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Export Resource model
module.exports = mongoose.model("Resource", resourceSchema);