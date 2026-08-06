const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/app');
const Room = require('../src/models/Room');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await Room.deleteMany({});
});

describe('Room REST API Endpoints', () => {
  it('should create a new whiteboard room', async () => {
    const res = await request(app)
      .post('/api/rooms/create')
      .send({ name: 'Architecture Discussion', isPrivate: false });

    expect(res.statusCode).toEqual(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.room).toHaveProperty('roomId');
    expect(res.body.data.room.name).toBe('Architecture Discussion');
  });

  it('should fetch room details by Room ID', async () => {
    const createRes = await request(app)
      .post('/api/rooms/create')
      .send({ name: 'Frontend Specs' });

    const roomId = createRes.body.data.room.roomId;

    const res = await request(app).get(`/api/rooms/${roomId}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.data.room.roomId).toBe(roomId);
  });

  it('should return 404 for invalid room ID', async () => {
    const res = await request(app).get('/api/rooms/NON_EXISTENT_ROOM');
    expect(res.statusCode).toEqual(404);
    expect(res.body.success).toBe(false);
  });
});
