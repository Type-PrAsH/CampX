require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

// Route imports
const campaignRoutes = require("./routes/campaignRoutes");
const insightRoutes = require("./routes/insightRoutes");

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/campaigns", campaignRoutes);
app.use("/api/insights", insightRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "CampX backend is running 🚀" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.originalUrl} not found.` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || "Server Error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 CampX Backend running on http://localhost:${PORT}`);
});
