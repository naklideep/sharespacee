require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");
const bookingRoutes = require("./routes/bookings");
const resourceRoutes = require("./routes/resourceRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// Allowed frontend origins
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
];

// 1. CORS configuration
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests without an Origin header, such as Postman.
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.error(`CORS blocked origin: ${origin}`);

    const error = new Error(`CORS blocked origin: ${origin}`);
    error.status = 403;

    return callback(error);
  },

  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],

  allowedHeaders: ["Content-Type", "Authorization"],

  credentials: true,
};

// Register CORS before API routes.
app.use(cors(corsOptions));

// 2. Parse incoming request bodies
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// 3. Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "ShareSpace API is running",
  });
});

// 4. API routes
app.use("/api/auth", authRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/resources", resourceRoutes);

// 5. Handle unknown routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// 6. Central error handler
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

// 7. Start server after connecting to MongoDB
async function startServer() {
  try {
    await connectDB();

    const server = app.listen(PORT, () => {
      console.log("\n================================");
      console.log("       ShareSpace Backend");
      console.log("================================");
      console.log(`API: http://localhost:${PORT}`);
      console.log(`Health: http://localhost:${PORT}/api/health`);
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
        console.error(
          `Port ${PORT} is already in use. Stop the other server or choose another port.`
        );
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