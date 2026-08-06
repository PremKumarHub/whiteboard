const http = require('http');
const { Server } = require('socket.io');
const ioClient = require('socket.io-client');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/app');
const { setupSocketHandlers } = require('../src/sockets/socketHandler');
const Room = require('../src/models/Room');
const DrawingState = require('../src/models/DrawingState');

let server, io, httpServerAddr;
let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  server = http.createServer(app);
  io = new Server(server);
  setupSocketHandlers(io);

  await new Promise((resolve) => {
    server.listen(() => {
      httpServerAddr = server.address();
      resolve();
    });
  });
});

afterAll(async () => {
  io.close();
  server.close();
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await Room.deleteMany({});
  await DrawingState.deleteMany({});
});

describe('Socket.IO Collaborative Drawing & Room Synchronization', () => {
  let client1, client2, client3;

  afterEach(() => {
    if (client1 && client1.connected) client1.disconnect();
    if (client2 && client2.connected) client2.disconnect();
    if (client3 && client3.connected) client3.disconnect();
  });

  it('should broadcast drawing events to users in the same room', (done) => {
    const socketUrl = `http://localhost:${httpServerAddr.port}`;
    client1 = ioClient.connect(socketUrl, { forceNew: true });
    client2 = ioClient.connect(socketUrl, { forceNew: true });

    const roomId = 'TEST-ROOM-1';
    const drawPayload = {
      id: 'stroke-123',
      type: 'stroke',
      tool: 'pen',
      color: '#ff0000',
      strokeWidth: 4,
      points: [{ x: 10, y: 10 }, { x: 20, y: 20 }],
    };

    client1.emit('join-room', { roomId, username: 'Alice' }, () => {
      client2.emit('join-room', { roomId, username: 'Bob' }, () => {
        // Client 2 listens for drawing action emitted by Client 1
        client2.on('draw-action', (action) => {
          expect(action.id).toBe(drawPayload.id);
          expect(action.color).toBe(drawPayload.color);
          expect(action.username).toBe('Alice');
          done();
        });

        // Client 1 sends drawing event
        client1.emit('draw-action', drawPayload);
      });
    });
  });

  it('should NOT leak drawing events to users in a different room', (done) => {
    const socketUrl = `http://localhost:${httpServerAddr.port}`;
    client1 = ioClient.connect(socketUrl, { forceNew: true });
    client3 = ioClient.connect(socketUrl, { forceNew: true });

    const roomA = 'ROOM-ALPHA';
    const roomB = 'ROOM-BETA';

    let roomBReceivedEvent = false;

    client1.emit('join-room', { roomId: roomA, username: 'Alice' }, () => {
      client3.emit('join-room', { roomId: roomB, username: 'Charlie' }, () => {
        client3.on('draw-action', () => {
          roomBReceivedEvent = true;
        });

        client1.emit('draw-action', { id: 'stroke-alpha', type: 'stroke', color: '#00ff00' });

        setTimeout(() => {
          expect(roomBReceivedEvent).toBe(false);
          done();
        }, 300);
      });
    });
  });

  it('should synchronize full room state for late joiners', (done) => {
    const socketUrl = `http://localhost:${httpServerAddr.port}`;
    client1 = ioClient.connect(socketUrl, { forceNew: true });

    const roomId = 'LATE-JOIN-ROOM';
    const stroke1 = { id: 'stroke-1', type: 'stroke', tool: 'pen', color: '#111' };

    client1.emit('join-room', { roomId, username: 'Alice' }, () => {
      client1.emit('draw-action', stroke1);

      setTimeout(() => {
        // Late joiner client 2 connects
        client2 = ioClient.connect(socketUrl, { forceNew: true });
        client2.emit('join-room', { roomId, username: 'LateBob' });

        client2.on('room-state', (data) => {
          expect(data.actions.length).toBeGreaterThanOrEqual(1);
          expect(data.actions[0].id).toBe('stroke-1');
          done();
        });
      }, 200);
    });
  });
});
