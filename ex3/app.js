const express = require('express');
const path = require('path');
const connectDB = require('./config/db');
const leaveRoutes = require('./routes/leaveRoutes');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Connect to MongoDB before handling API requests.
app.use('/api', async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    res.status(503).json({
      message: 'Database unavailable. Check your MONGODB_URI setting and try again.'
    });
  }
});

app.use('/api', leaveRoutes);

// Return the frontend for the home page and unknown non-API routes.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 5050;
if (require.main === module) {
  app.listen(PORT, () => console.log(`Leave Management System running at http://localhost:${PORT}`));
}

module.exports = app;
