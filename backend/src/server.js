const http = require('http');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
const app = require('./app');
const connectDB = require('./config/db');
const { setupSocketHandlers } = require('./sockets/socketHandler');

dotenv.config();

const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO with CORS
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

// Attach Socket event listeners
setupSocketHandlers(io);

// Connect to Database and start listening
const startServer = async () => {
  await connectDB();
  
  server.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🚀 Zansphere Whiteboard Backend Server running!`);
    console.log(`📡 REST API & WebSockets active on port: ${PORT}`);
    console.log(`🔗 Health Check: http://localhost:${PORT}/health`);
    console.log(`=======================================================`);
  });
};

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

module.exports = { app, server, io };
