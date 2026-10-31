const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: { type: String, enum: ["booking_request", "booking_approved", "booking_rejected"], required: true },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    message: { type: String, required: true, trim: true, maxlength: 500 },
    booking: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", default: null },
    resource: { type: mongoose.Schema.Types.ObjectId, ref: "Resource", default: null },
    isRead: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
module.exports = mongoose.model("Notification", notificationSchema);
