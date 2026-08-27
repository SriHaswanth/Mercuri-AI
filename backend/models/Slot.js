const mongoose = require('mongoose');

const SlotSchema = new mongoose.Schema({
  startTime: { type: Date, required: true, index: true },
  endTime: { type: Date, required: true },
  isBooked: { type: Boolean, default: false, index: true },
  bookedBy: { type: String, default: null },
  bookedAt: { type: Date, default: null }
});

module.exports = mongoose.model('Slot', SlotSchema);