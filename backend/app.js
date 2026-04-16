const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const logger = require("morgan");
const cors = require("cors");

// ============================
// ENV CONFIG
// ============================

// Load default .env
dotenv.config();

// Load environment-specific file if NODE_ENV exists
if (process.env.NODE_ENV) {
  dotenv.config({
    path: path.join(__dirname, `env/${process.env.NODE_ENV}.env`),
  });
}

// ============================
// INIT APP
// ============================
const app = express();

// ============================
// MIDDLEWARE
// ============================
app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ============================
// DEBUG ROUTE (VERY IMPORTANT)
// ============================
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Backend is running",
    env: process.env.NODE_ENV || "not set",
  });
});

// ============================
// ROUTES
// ============================

// Index route
const indexRouter = require("./routes/index");
app.use("/", indexRouter);

// Products route
const productRoutes = require("./routes/products");
app.use("/products", productRoutes);

// ============================
// ERROR HANDLING (IMPORTANT)
// ============================
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
    path: req.path,
  });
});

// ============================
// SERVER START
// ============================
const PORT = process.env.PORT || 5000;
const ENV = process.env.NODE_ENV || "development";

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} | env: ${ENV}`);
  console.log("DB HOST:", process.env.DB_HOST || "NOT SET");
});
