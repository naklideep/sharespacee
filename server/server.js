require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");
const bookingRoutes = require("./routes/bookings");
const resourceRoutes = require("./routes/resourceRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

app.use("/api/auth", authRoutes);
app.use("/api/bookings", bookingRoutes);
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
  })
);

app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "ShareSpace API is running",
  });
});

app.use("/api/resources", resourceRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

async function startServer() {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`🚀 ShareSpace API: http://localhost:${PORT}`);
  });
}

startServer();