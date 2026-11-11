const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

app.use(bodyParser.json());
app.use(cors());

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) return;
  try {
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/feedback", {
      serverSelectionTimeoutMS: 5000,
    });
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("Failed to connect to MongoDB:", err.message);
  }
};

app.use(async (req, res, next) => {
  await connectDB();
  next();
});

const feedbackSchema = new mongoose.Schema({
  q1: { type: String, required: true, trim: true },
  q2: { type: String, trim: true },
  q3: { type: String, trim: true },
  q4: { type: String, required: true, trim: true },
  q5: { type: String, trim: true },
  submittedAt: { type: Date, default: Date.now },
});

const Feedback = mongoose.model("Feedback", feedbackSchema);

app.post("/api/feedback", async (req, res) => {
  const { q1, q2, q3, q4, q5 } = req.body || {};

  if (!q1 || !q1.trim()) {
    return res.status(400).send({ message: "Name is required." });
  }
  if (!q4 || !q4.trim()) {
    return res.status(400).send({ message: "Feedback comment is required." });
  }

  const feedback = new Feedback({
    q1: q1.trim(),
    q2: (q2 || "").trim(),
    q3: (q3 || "").trim(),
    q4: q4.trim(),
    q5: (q5 || "").trim(),
  });

  try {
    await feedback.save();
    res.status(201).send({ message: "Feedback submitted and stored in MongoDB" });
  } catch (error) {
    console.error("Error saving feedback:", error);
    res.status(500).send({ message: "Error storing feedback" });
  }
});

app.get("/api/getfeedback", async (req, res) => {
  try {
    const feedbacks = await Feedback.find().sort({ submittedAt: -1 });
    res.status(200).json(feedbacks);
  } catch (error) {
    console.error("Error retrieving feedback:", error);
    res.status(500).send({ message: "Error retrieving feedback" });
  }
});

const PORT = process.env.PORT || 8080;

if (require.main === module) {
  connectDB().finally(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  });
}

module.exports = app;
