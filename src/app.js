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
const vehicleRoutes = require("./routes/vehicleRoutes");
const routesRoutes = require("./routes/routesRoutes");
const organizationRoutes = require("./routes/organizationRoutes");
const batchRoutes = require("./routes/batchRoutes");
const manifestRoutes = require("./routes/manifestRoutes");

dotenv.config();

const app = express();

// CORS configuration for localhost:3000
const corsOptions = {
    origin: "http://localhost:3001", // Allow only this origin
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"], // Allow specific HTTP methods
    allowedHeaders: ["Content-Type", "Authorization"], // Allow specific headers
};

app.use(cors(corsOptions)); // Use the configured CORS options

app.use(express.json());

const PORT = process.env.PORT || 5000; // Default port is 5000 if not set in environment variables

// Database connection
db();

// // Rate Limiter Configuration
// const apiLimiter = rateLimit({
//     windowMs: 15 * 60 * 1000, // 15 minutes
//     max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
//     message: "Too many requests from this IP, please try again later.",
//     headers: true,
// });

// // Apply rate limiter globally to all routes
// app.use(apiLimiter);

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
app.use("/api/loader", loaderRoutes);
app.use("/api/vehicle", vehicleRoutes);
app.use("/api/routes", routesRoutes);
app.use("/api/organization", organizationRoutes);
app.use("/api/batch", batchRoutes);
app.use("/api/manifest", manifestRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
