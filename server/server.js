
require("dotenv").config();


const chatRoutes = require("./routes/chat");
const express = require("express");
const cors = require("cors");
const http = require("http");
const jwt = require("jsonwebtoken");
const { Server } = require("socket.io");

const connectDB = require("./config/db");

const authRoutes = require("./routes/auth");
const bookingRoutes = require("./routes/bookings");
const resourceRoutes = require("./routes/resourceRoutes");
const notificationRoutes = require("./routes/notification");

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
];

// HTTP server
const server = http.createServer(app);

// Socket.IO configuration
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Make Socket.IO accessible inside Express routes
app.set("io", io);

// Express CORS
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    const error = new Error(`CORS blocked origin: ${origin}`);
    error.status = 403;
    return callback(error);
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "ShareSpace API is running",
  });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/chat", chatRoutes);

// Socket.IO JWT authentication
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error("Authentication required"));
    }

    if (!process.env.JWT_SECRET) {
      return next(new Error("Authentication is not configured"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId || decoded.id || decoded._id;

    if (!userId) {
      return next(new Error("Invalid authentication token"));
    }

    socket.user = {
      id: userId.toString(),
      name: decoded.name || decoded.username || "",
    };

    next();
  } catch (error) {
    next(new Error("Invalid or expired token"));
  }
});

// Socket.IO connections
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.user.id}`);

  // Private room for each authenticated user
  socket.join(`user:${socket.user.id}`);

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.user.id}`);
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error("Server error:", error.message);

  if (error.message.startsWith("CORS blocked origin:")) {
    return res.status(403).json({
      success: false,
      message: "This frontend origin is not allowed by CORS.",
    });
  }

  res.status(error.status || 500).json({
    success: false,
    message:
      error.status === 403
        ? error.message
        : "Internal server error.",
  });
});

// Start server
async function startServer() {
  try {
    await connectDB();

    server.listen(PORT, () => {
      console.log("\n================================");
      console.log("       ShareSpace Backend");
      console.log("================================");
      console.log(`API: http://localhost:${PORT}`);
      console.log(`Health: http://localhost:${PORT}/api/health`);
      console.log(`Socket.IO: Enabled`);
      console.log(`Resources: http://localhost:${PORT}/api/resources`);

      console.log("\nAllowed frontend origins:");
      allowedOrigins.forEach((origin) => {
        console.log(`  ✓ ${origin}`);
      });

      console.log("\nMongoDB connection initialized.");
      console.log("================================\n");
    });

    server.on("error", (error) => {
      if (error.code === "EADDRINUSE") {
        console.error(`Port ${PORT} is already in use.`);
      } else {
        console.error("HTTP server error:", error);
      }

      process.exit(1);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
}

startServer();
