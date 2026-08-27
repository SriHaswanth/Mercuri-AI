const express = require('express');
const router = express.Router();
const { handleNaturalLanguageBooking } = require('../services/aiService');

router.post('/book', async (req, res) => {
  const { prompt, userName } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'prompt is required.' });
  }

  try {
    const result = await handleNaturalLanguageBooking(prompt, userName || 'Guest');
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;