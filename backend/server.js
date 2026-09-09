const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Global Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));

// Healthcheck
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Server operational" });
});

app.listen(PORT, () => {
  console.log(`🚀 Server listening on http://localhost:${PORT}`);
});