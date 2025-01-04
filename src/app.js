const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const Employee = require("./models/employee");
const db = require("./config/db");

// routes imports
const authRoutes = require("./routes/authRoutes");
const employeeRoutes = require("./routes/employeeRoutes");
const orderRoutes = require("./routes/orderRoutes");

dotenv.config();
db();

const app = express();
app.use(express.json());
app.use(cors());


const PORT = process.env.PORT || 5000; // Default port is 5000 if not set in environment variables

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Test Route
app.get("/", (req, res) => {
    res.send("API is running...");
});

// routes
app.use("/api/auth", authRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/orders", orderRoutes);

module.exports = app;
