const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');
const app = require('../server');
const Slot = require('../models/Slot');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await Slot.deleteMany({});
});

describe('Booking Logic & Race Condition Guard', () => {
  test('Books an open slot successfully', async () => {
    const slot = await Slot.create({
      startTime: new Date('2026-09-01T10:00:00Z'),
      endTime: new Date('2026-09-01T11:00:00Z'),
      isBooked: false
    });

    const res = await request(app)
      .post('/api/bookings/manual')
      .send({ slotId: slot._id, userName: 'Alice' });

    expect(res.status).toBe(200);
    expect(res.body.slot.isBooked).toBe(true);
    expect(res.body.slot.bookedBy).toBe('Alice');
  });

  test('Rejects double-booking when two requests race for the same slot', async () => {
    const slot = await Slot.create({
      startTime: new Date('2026-09-01T14:00:00Z'),
      endTime: new Date('2026-09-01T15:00:00Z'),
      isBooked: false
    });

    const [res1, res2] = await Promise.all([
      request(app).post('/api/bookings/manual').send({ slotId: slot._id, userName: 'User 1' }),
      request(app).post('/api/bookings/manual').send({ slotId: slot._id, userName: 'User 2' })
    ]);

    const statuses = [res1.status, res2.status];
    expect(statuses).toContain(200);
    expect(statuses).toContain(409);

    const updated = await Slot.findById(slot._id);
    expect(updated.isBooked).toBe(true);
  });

  test('Fails gracefully when booking a non-existent slot ID', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .post('/api/bookings/manual')
      .send({ slotId: fakeId, userName: 'Bob' });

    expect(res.status).toBe(409);
  });
});