const express = require('express');
const router = express.Router();
const { bookSlotAtomically } = require('../services/aiService');

router.post('/manual', async (req, res) => {
  const { slotId, userName } = req.body;
  if (!slotId || !userName) {
    return res.status(400).json({ error: 'slotId and userName are required.' });
  }

  try {
    const slot = await bookSlotAtomically(slotId, userName);
    if (!slot) {
      return res.status(409).json({ error: 'Slot is already booked or does not exist.' });
    }
    res.json({ message: 'Booking confirmed', slot });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;