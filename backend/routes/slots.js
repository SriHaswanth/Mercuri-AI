const express = require('express');
const router = express.Router();
const Slot = require('../models/Slot');

router.get('/available', async (req, res) => {
  try {
    const slots = await Slot.find({ isBooked: false }).sort({ startTime: 1 });
    res.json(slots);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;