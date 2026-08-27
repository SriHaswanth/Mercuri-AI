const dns = require('node:dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

require('dotenv').config();
const mongoose = require('mongoose');
const Slot = require('./models/Slot');

const MONGO_URI = process.env.MONGO_URI;

const seedSlots = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    await Slot.deleteMany({});

    const slots = [];
    const now = new Date();
    
    for (let day = 1; day <= 4; day++) {
      const times = [10, 14, 16];
      times.forEach(hour => {
        const startTime = new Date(now);
        startTime.setDate(now.getDate() + day);
        startTime.setHours(hour, 0, 0, 0);

        const endTime = new Date(startTime);
        endTime.setHours(hour + 1, 0, 0, 0);

        slots.push({ startTime, endTime, isBooked: false });
      });
    }

    await Slot.insertMany(slots);
    console.log(`Successfully seeded ${slots.length} available slots.`);
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
};

seedSlots();