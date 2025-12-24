const express = require("express");
const body_parser = require("body-parser");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const morgan = require("morgan");
const swaggerUi = require("swagger-ui-express"),
swaggerDocument = require("./swagger.json");

const app = express();
const port = process.env.PORT || 8091;

// Swagger setup
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Middleware
app.use(body_parser.urlencoded({ extended: true }));
app.use(body_parser.json());
app.use(cors());
app.use(morgan("dev"));


// ✅ Import and use versioned routes
const customerRoutes = require("./routes/customerRoute");
app.use("/api/v1/customer", customerRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  res.status(500).json({ error: "Internal Server Error" });
});

// Start server
app.listen(port, () => {
  console.log(`✅ ACCOUNTANT SOFTWARE BE running on port ${port}`);
});
