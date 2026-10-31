
const express = require("express");
const mongoose = require("mongoose");

const Booking = require("../models/Booking");
const Message = require("../models/Message");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware);

// Verify that the current user belongs to an approved booking.
async function getApprovedBooking(bookingId, userId) {
  if (!mongoose.isValidObjectId(bookingId)) {
    return { error: "Invalid booking ID.", status: 400 };
  }

  const booking = await Booking.findById(bookingId)
    .populate("resource", "title image pricePerDay")
    .populate("borrower", "name email")
    .populate("owner", "name email");

  if (!booking) {
    return { error: "Booking not found.", status: 404 };
  }

  const borrowerId = booking.borrower?._id?.toString();
  const ownerId = booking.owner?._id?.toString();

  if (userId !== borrowerId && userId !== ownerId) {
    return {
      error: "You are not a participant in this booking.",
      status: 403,
    };
  }

  if (booking.status !== "approved") {
    return {
      error: "Chat is available only for approved bookings.",
      status: 403,
    };
  }

  return { booking };
}

// GET /api/chat/conversations
// List all approved bookings involving the logged-in user.
router.get("/conversations", async (req, res) => {
  try {
    const userId = req.user.id;

    const bookings = await Booking.find({
      status: "approved",
      $or: [
        { borrower: userId },
        { owner: userId },
      ],
    })
      .populate("resource", "title image pricePerDay")
      .populate("borrower", "name email")
      .populate("owner", "name email")
      .sort({ updatedAt: -1 });

    const conversations = await Promise.all(
      bookings.map(async (booking) => {
        const lastMessage = await Message.findOne({
          booking: booking._id,
        })
          .sort({ createdAt: -1 })
          .lean();

        const unreadCount = await Message.countDocuments({
          booking: booking._id,
          recipient: userId,
          readAt: null,
        });

        const isBorrower =
          booking.borrower._id.toString() === userId;

        return {
          bookingId: booking._id,
          bookingStatus: booking.status,
          resource: booking.resource,
          otherUser: isBorrower
            ? booking.owner
            : booking.borrower,
          lastMessage,
          unreadCount,
          updatedAt: booking.updatedAt,
        };
      })
    );

    conversations.sort(
      (a, b) =>
        new Date(b.lastMessage?.createdAt || b.updatedAt) -
        new Date(a.lastMessage?.createdAt || a.updatedAt)
    );

    res.json({
      success: true,
      count: conversations.length,
      data: conversations,
    });
  } catch (error) {
    console.error("FETCH CONVERSATIONS ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Unable to fetch conversations.",
    });
  }
});

// GET /api/chat/:bookingId/messages
// Fetch message history for one approved booking.
router.get("/:bookingId/messages", async (req, res) => {
  try {
    const result = await getApprovedBooking(
      req.params.bookingId,
      req.user.id
    );

    if (result.error) {
      return res.status(result.status).json({
        success: false,
        message: result.error,
      });
    }

    const messages = await Message.find({
      booking: result.booking._id,
    })
      .populate("sender", "name email")
      .populate("recipient", "name email")
      .sort({ createdAt: 1 });

    res.json({
      success: true,
      count: messages.length,
      data: messages,
    });
  } catch (error) {
    console.error("FETCH MESSAGES ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Unable to fetch messages.",
    });
  }
});

// POST /api/chat/:bookingId/messages
// Send a message to the other booking participant.
router.post("/:bookingId/messages", async (req, res) => {
  try {
    const { text } = req.body;

    if (typeof text !== "string" || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message cannot be empty.",
      });
    }

    if (text.trim().length > 2000) {
      return res.status(400).json({
        success: false,
        message: "Message cannot exceed 2000 characters.",
      });
    }

    const result = await getApprovedBooking(
      req.params.bookingId,
      req.user.id
    );

    if (result.error) {
      return res.status(result.status).json({
        success: false,
        message: result.error,
      });
    }

    const booking = result.booking;
    const userId = req.user.id;

    const borrowerId = booking.borrower._id.toString();
    const ownerId = booking.owner._id.toString();

    const recipientId =
      userId === borrowerId ? ownerId : borrowerId;

    const message = await Message.create({
      booking: booking._id,
      sender: userId,
      recipient: recipientId,
      text: text.trim(),
    });

    const populatedMessage = await Message.findById(message._id)
      .populate("sender", "name email")
      .populate("recipient", "name email");

    // Deliver instantly to the recipient and sender's other sessions.
    const io = req.app.get("io");

    if (io) {
      io.to(`user:${recipientId}`).emit(
        "chat:message",
        populatedMessage
      );

      io.to(`user:${userId}`).emit(
        "chat:message",
        populatedMessage
      );
    }

    res.status(201).json({
      success: true,
      message: "Message sent successfully.",
      data: populatedMessage,
    });
  } catch (error) {
    console.error("SEND MESSAGE ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Unable to send message.",
    });
  }
});

// PATCH /api/chat/:bookingId/read
// Mark messages received by the current user as read.
router.patch("/:bookingId/read", async (req, res) => {
  try {
    const result = await getApprovedBooking(
      req.params.bookingId,
      req.user.id
    );

    if (result.error) {
      return res.status(result.status).json({
        success: false,
        message: result.error,
      });
    }

    const userId = req.user.id;

    const unreadMessages = await Message.find({
      booking: result.booking._id,
      recipient: userId,
      readAt: null,
    }).select("sender");

    const readAt = new Date();

    const updateResult = await Message.updateMany(
      {
        booking: result.booking._id,
        recipient: userId,
        readAt: null,
      },
      {
        $set: { readAt },
      }
    );

    const senderIds = [
      ...new Set(
        unreadMessages.map((message) =>
          message.sender.toString()
        )
      ),
    ];

    const io = req.app.get("io");

    if (io) {
      senderIds.forEach((senderId) => {
        io.to(`user:${senderId}`).emit("chat:read", {
          bookingId: result.booking._id.toString(),
          readerId: userId,
          readAt,
        });
      });
    }

    res.json({
      success: true,
      message: "Messages marked as read.",
      modifiedCount: updateResult.modifiedCount,
    });
  } catch (error) {
    console.error("MARK MESSAGES READ ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Unable to mark messages as read.",
    });
  }
});

module.exports = router;
