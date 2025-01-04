const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const db = require("./config/db");

// routes imports
const authRoutes = require("./routes/authRoutes");
const employeeRoutes = require("./routes/employeeRoutes");
const orderRoutes = require("./routes/orderRoutes");
const hubRoutes = require("./routes/hubRoutes");
const documentRoutes = require("./routes/documentRoutes");
const accountRoutes = require("./routes/accountRoutes");
const branchRoutes = require("./routes/branchRoutes");
const customerRoutes = require("./routes/customerRoutes")

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 5000; // Default port is 5000 if not set in environment variables

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
db();

// Test Route
app.get("/", (req, res) => {
    res.send("API is running...");
});

// routes
app.use("/api/auth", authRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/hub", hubRoutes);
app.use("/api/document", documentRoutes);
app.use("/api/account", accountRoutes);
app.use("/api/branch", branchRoutes)
app.use("/api/customer", customerRoutes)

module.exports = app;
