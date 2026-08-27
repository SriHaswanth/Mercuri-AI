const dns = require('node:dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const slotRoutes = require('./routes/slots');
const bookingRoutes = require('./routes/bookings');
const agentRoutes = require('./routes/agent');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/slots', slotRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/agent', agentRoutes);

const MONGO_URI = process.env.MONGO_URI;
const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
  mongoose.connect(MONGO_URI)
    .then(() => {
      console.log('Connected to MongoDB');
      app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch(err => console.error('MongoDB connection error:', err));
}

module.exports = app;