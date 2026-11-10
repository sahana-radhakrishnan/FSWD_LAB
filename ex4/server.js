const cors = require("cors");
const express = require("express");
const mongoose = require("mongoose");

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/taskmanager";
const TASK_STATUSES = ["Pending", "Ongoing", "Completed"];

app.use(cors());
app.use(express.json());

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    status: {
      type: String,
      enum: TASK_STATUSES,
      default: "Pending",
    },
  },
  { timestamps: true }
);

const Task = mongoose.model("Task", taskSchema);

app.get("/tasks", async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ message: "Could not fetch tasks." });
  }
});

app.post("/tasks", async (req, res) => {
  const body = req.body || {};
  const title = typeof body.title === "string" ? body.title.trim() : "";

  if (!title) {
    return res.status(400).json({ message: "Task title cannot be empty." });
  }

  try {
    const task = await Task.create({ title });
    res.status(201).json(task);
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(400).json({ message: "Could not create task." });
  }
});

app.patch("/tasks/:id", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body || {};

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: "Invalid task ID." });
  }

  if (!TASK_STATUSES.includes(status)) {
    return res.status(400).json({ message: "Invalid task status." });
  }

  try {
    const task = await Task.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json({ message: "Task not found." });
    }

    res.json(task);
  } catch (error) {
    console.error("Error updating task status:", error);
    res.status(500).json({ message: "Could not update task status." });
  }
});

app.delete("/tasks/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "Invalid task ID." });
  }

  try {
    const task = await Task.findByIdAndDelete(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found." });
    }

    res.json({ message: "Task deleted." });
  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).json({ message: "Could not delete task." });
  }
});

app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
    return res.status(400).json({ message: "Request body must be valid JSON." });
  }

  console.error("Unexpected server error:", error);
  res.status(500).json({ message: "An unexpected server error occurred." });
});

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
    process.exitCode = 1;
  });
