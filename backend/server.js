const express = require("express");
const cors = require("cors");
require("dotenv").config();
const ensureSchema = require("./database/ensureSchema");

const app = express();
const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173,https://anchuselva.github.io")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("Origin is not allowed by CORS"));
  }
}));
app.use(express.json({ limit: "10mb" }));

app.get("/", (_req, res) => res.json({ message: "SaveLKR API is running" }));
app.get("/api/health", (_req, res) => res.json({ status: "ok", service: "SaveLKR API" }));
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/income", require("./routes/incomeRoutes"));
app.use("/api/expenses", require("./routes/expenseRoutes"));
app.use("/api/budgets", require("./routes/budgetRoutes"));
app.use("/api/reminders", require("./routes/reminderRoutes"));
app.use("/api/receipts", require("./routes/receiptRoutes"));
app.use("/api/daily-limit", require("./routes/dailyLimitRoutes"));
app.use("/api/purchase-check", require("./routes/purchaseCheckRoutes"));
app.use("/api/analytics", require("./routes/analyticsRoutes"));

app.use((err, _req, res, _next) => {
  res.status(500).json({ message: "Server error", error: err.message });
});

const port = process.env.PORT || 5000;

ensureSchema()
  .then(() => {
    app.listen(port, () => console.log(`SaveLKR API running on port ${port}`));
  })
  .catch((error) => {
    console.error("Database schema check failed:", error.message);
    process.exit(1);
  });
