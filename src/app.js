const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const db = require("./config/db");
const rateLimit = require("express-rate-limit");

// routes imports
const authRoutes = require("./routes/authRoutes");
const employeeRoutes = require("./routes/employeeRoutes");
const orderRoutes = require("./routes/orderRoutes");
const hubRoutes = require("./routes/hubRoutes");
const documentRoutes = require("./routes/documentRoutes");
const accountRoutes = require("./routes/accountRoutes");
const branchRoutes = require("./routes/branchRoutes");
const customerRoutes = require("./routes/customerRoutes");
const loaderRoutes = require("./routes/loaderController");
const vehicleRoutes = require("./routes/vehicleRoutes")

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 5000; // Default port is 5000 if not set in environment variables

// Database connection
db();

// Rate Limiter Configuration
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    message: "Too many requests from this IP, please try again later.",
    headers: true,
});

// Apply rate limiter globally to all routes
app.use(apiLimiter);

// Test Route
app.get("/", (req, res) => {
    res.send("API is running...");
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/hub", hubRoutes);
app.use("/api/document", documentRoutes);
app.use("/api/account", accountRoutes);
app.use("/api/branch", branchRoutes);
app.use("/api/customer", customerRoutes);
app.use("/api/loader", loaderRoutes)
app.use("/api/vehicle", vehicleRoutes)
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
