// app.js
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const connectDB = require("./config/db");
const leaveRoutes = require("./routes/leaveRoutes");

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, "public")));

// Ensure DB connected on API requests
app.use("/api", async (req, res, next) => {
  await connectDB();
  next();
});

// API Routes
app.use("/api", leaveRoutes);

// Root route fallback
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Start the server if run directly
const PORT = process.env.PORT || 5050;
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;

