
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  })
);

app.use(express.json());

// MongoDB connection using environment variables
const MONGO_URI =
  process.env.MONGO_URI ||
  process.env.MONGODB_URI ||
  process.env.MONGO_URL;

let dbError = null;

const connectDB = async () => {
  if (
    mongoose.connection.readyState === 1 ||
    mongoose.connection.readyState === 2
  ) {
    return;
  }

  if (!MONGO_URI) {
    dbError = 'MongoDB connection string is missing';
    console.error(dbError);
    return;
  }

  try {
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });

    dbError = null;
    console.log('Connected to MongoDB successfully');
  } catch (err) {
    dbError = err.message;
    console.error('MongoDB connection failed:', err.message);
  }
};

// Initial connection attempt
connectDB();

// Middleware to reconnect if disconnected
app.use(async (req, res, next) => {
  if (mongoose.connection.readyState === 0) {
    await connectDB();
  }
  next();
});

// Task Schema and Model
const TaskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'in progress', 'completed'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

const Task = mongoose.model('Task', TaskSchema);

// Health Check Route
app.get('/', async (req, res) => {
  if (mongoose.connection.readyState === 0) {
    await connectDB();
  }

  const states = [
    'disconnected',
    'connected',
    'connecting',
    'disconnecting',
  ];

  res.json({
    status: 'server is running',
    database: states[mongoose.connection.readyState] || 'unknown',
    dbError: dbError,
  });
});

// Fetch All Tasks
app.get('/tasks', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 0) {
      await connectDB();
    }

    if (mongoose.connection.readyState !== 1) {
      throw new Error(dbError || 'Database unavailable');
    }

    const tasks = await Task.find();
    res.json(tasks);
  } catch (err) {
    console.error('Error fetching tasks:', err);

    res.status(500).json({
      message: 'couldnt fetch tasks',
      error: err.message,
      dbStatus: mongoose.connection.readyState,
      dbError: dbError,
    });
  }
});

// Create New Task
app.post('/tasks', async (req, res) => {
  const { title, status } = req.body;

  try {
    if (mongoose.connection.readyState === 0) {
      await connectDB();
    }

    if (mongoose.connection.readyState !== 1) {
      throw new Error(dbError || 'Database unavailable');
    }

    const task = new Task({ title, status });
    const savedTask = await task.save();

    res.status(201).json(savedTask);
  } catch (err) {
    console.error('Error creating task:', err);

    res.status(400).json({
      message: 'couldnt create task',
      error: err.message,
    });
  }
});

// Update Task
app.patch('/tasks/:id', async (req, res) => {
  const { status } = req.body;

  try {
    if (mongoose.connection.readyState === 0) {
      await connectDB();
    }

    if (mongoose.connection.readyState !== 1) {
      throw new Error(dbError || 'Database unavailable');
    }

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!updatedTask) {
      return res.status(404).json({
        message: 'Task not found.',
      });
    }

    res.json(updatedTask);
  } catch (err) {
    console.error('Error updating task:', err);

    res.status(400).json({
      message: 'couldnt update task',
      error: err.message,
    });
  }
});

// Delete Task
app.delete('/tasks/:id', async (req, res) => {
  const { id } = req.params;

  try {
    if (mongoose.connection.readyState === 0) {
      await connectDB();
    }

    if (mongoose.connection.readyState !== 1) {
      throw new Error(dbError || 'Database unavailable');
    }

    const deletedTask = await Task.findByIdAndDelete(id);

    if (!deletedTask) {
      return res.status(404).json({
        message: 'task not found',
      });
    }

    res.json({
      message: 'task deleted successfully',
    });
  } catch (err) {
    console.error('Error deleting task:', err);

    res.status(400).json({
      message: 'couldnt delete task',
      error: err.message,
    });
  }
});

// Server Configuration
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
