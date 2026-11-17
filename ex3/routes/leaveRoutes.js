const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/User');

const router = express.Router();

// Register a user and initialize their leave balances.
router.post('/register', async (req, res) => {
  try {
    const { username, email, rollNumber } = req.body;
    const casualLeave = req.body.casualLeave === undefined ? 10 : Number(req.body.casualLeave);
    const medicalLeave = req.body.medicalLeave === undefined ? 10 : Number(req.body.medicalLeave);

    if (!username?.trim() || !email?.trim() || !rollNumber?.trim()) {
      return res.status(400).json({ message: 'Username, email and roll number are required.' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return res.status(400).json({ message: 'Please enter a valid email address.' });
    }
    if (!Number.isInteger(casualLeave) || casualLeave < 0 || !Number.isInteger(medicalLeave) || medicalLeave < 0) {
      return res.status(400).json({ message: 'Leave balances must be whole numbers greater than or equal to zero.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) return res.status(409).json({ message: 'A user already exists with this email.' });

    const user = await User.create({
      username: username.trim(),
      email: normalizedEmail,
      rollNumber: rollNumber.trim(),
      casualLeave,
      medicalLeave
    });

    return res.status(201).json({
      message: 'User created successfully.',
      userId: user._id,
      username: user.username,
      rollNumber: user.rollNumber,
      casualLeave: user.casualLeave,
      medicalLeave: user.medicalLeave
    });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: 'A user already exists with this email.' });
    console.error('Registration error:', error);
    return res.status(500).json({ message: 'Unable to register user.' });
  }
});

// Demo login: the original project uses email only (no password authentication).
router.post('/login', async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    if (!email) return res.status(400).json({ message: 'Email is required.' });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found. Please create an account first.' });

    return res.json({
      message: 'Login successful.',
      userId: user._id,
      username: user.username,
      rollNumber: user.rollNumber,
      casualLeave: user.casualLeave,
      medicalLeave: user.medicalLeave
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Unable to log in.' });
  }
});

router.get('/leave-balance/:id', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid user ID.' });
    const user = await User.findById(req.params.id).select('casualLeave medicalLeave');
    if (!user) return res.status(404).json({ message: 'User not found.' });
    return res.json({ casualLeave: user.casualLeave, medicalLeave: user.medicalLeave });
  } catch (error) {
    console.error('Balance lookup error:', error);
    return res.status(500).json({ message: 'Unable to fetch leave balance.' });
  }
});

router.post('/apply-leave/:id', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid user ID.' });

    const { type } = req.body;
    const days = Number(req.body.days);
    if (!Number.isInteger(days) || days < 1) {
      return res.status(400).json({ message: 'Number of leave days must be a whole number of at least 1.' });
    }
    if (!['casual', 'medical'].includes(type)) {
      return res.status(400).json({ message: 'Leave type must be casual or medical.' });
    }

    const field = type === 'casual' ? 'casualLeave' : 'medicalLeave';
    // Atomic conditional update prevents a balance from becoming negative.
    const user = await User.findOneAndUpdate(
      { _id: req.params.id, [field]: { $gte: days } },
      { $inc: { [field]: -days } },
      { new: true, runValidators: true }
    );

    if (!user) {
      const existingUser = await User.findById(req.params.id);
      if (!existingUser) return res.status(404).json({ message: 'User not found.' });
      return res.status(400).json({
        message: `Insufficient ${type} leave balance. You have ${existingUser[field]} day(s) remaining.`,
        casualLeave: existingUser.casualLeave,
        medicalLeave: existingUser.medicalLeave
      });
    }

    return res.json({
      message: 'Leave applied successfully.',
      casualLeave: user.casualLeave,
      medicalLeave: user.medicalLeave
    });
  } catch (error) {
    console.error('Apply leave error:', error);
    return res.status(500).json({ message: 'Unable to apply for leave.' });
  }
});

module.exports = router;
