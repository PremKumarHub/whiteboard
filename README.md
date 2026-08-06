# Zansphere Real-Time Collaborative Whiteboard 🎨⚡

A full-stack (MERN + Socket.IO) collaborative online whiteboard application designed for technical assessment at Zansphere Private Limited. Built with clean modular architecture, state synchronization, multi-user cursor tracking, room isolation, database state persistence, undo/redo capabilities, authentication, and high-DPI HTML5 canvas rendering.

---

## 🌟 Key Features

### 🏢 Room Management & Isolation
- **Create & Join Rooms**: Generate unique Room IDs (e.g. `ROOM-X7Y9Z1`) with optional passcode protection.
- **Strict Room Isolation**: Socket events and drawing data are scoped to specific room namespaces. Drawing in Room A never leaks to Room B.
- **Shareable Links**: Copy direct URL room links (`?room=ROOM-123`) for quick team joining.

### 🎨 Real-Time Collaboration & HTML5 Canvas Engine
- **Synchronous Drawing**: Pen (freehand stroke with smooth quadratic curve interpolation), Eraser, Line, Rectangle, Circle, and Text tools.
- **Late Joiner Hydration**: Newly connected clients instantly receive the current room whiteboard state.
- **Multi-User Live Cursors**: Floating cursor indicators showing team members' mouse/touch positions in real time.
- **Active Presence Tracking**: Online participant badges and active user list drawer.

### 🔄 State Synchronization & Bonus Requirements
- **Undo & Redo**: Global multi-user action stack synchronization (Keyboard shortcuts `Ctrl+Z` / `Ctrl+Y`).
- **Database Persistence**: Room canvas state is stored in MongoDB (`DrawingState` & `Room` models) for persistent board recovery.
- **Auto Reconnection**: Graceful recovery when network drops; automatically re-hydrates state on socket reconnect.
- **JWT Authentication & Guest Mode**: Support for registered users (`/api/auth/register`, `/api/auth/login`) or instant Guest login.
- **Canvas Image Export**: Download high-resolution PNG snapshots of whiteboards.

---

## 📁 Repository Structure

```
whiteboard/
├── backend/                  # Node.js + Express + Socket.IO Server
│   ├── src/
│   │   ├── config/           # Database connection & MongoMemoryServer fallback
│   │   ├── controllers/      # REST API Controllers (Auth, Rooms)
│   │   ├── middleware/       # JWT Auth & Centralized Error Handlers
│   │   ├── models/           # User, Room, DrawingState Mongoose Models
│   │   ├── routes/           # Express Route definitions (/api/auth, /api/rooms)
│   │   ├── sockets/          # Socket.IO event handlers & room presence logic
│   │   ├── utils/            # Standard response helpers
│   │   ├── app.js            # Express app configuration
│   │   └── server.js         # HTTP Server & Socket.IO initialization
│   └── tests/                # Automated Jest & Supertest Integration Tests
├── frontend/                 # Vite + React HTML5 Canvas Application
│   ├── src/
│   │   ├── components/       # Canvas, Toolbar, Navbar, UserListModal
│   │   ├── context/          # AuthContext & SocketContext
│   │   ├── pages/            # AuthPage, DashboardPage, WhiteboardPage
│   │   ├── services/         # REST API Client wrapper
│   │   └── utils/            # High-DPI Canvas Rendering Engine
│   └── index.html
├── docs/                     # Detailed Specifications
│   ├── API_DOCUMENTATION.md  # Complete REST API reference
│   └── WEBSOCKET_EVENTS.md   # Complete Socket.IO event reference
├── postman_collection.json   # Sample Postman/Bruno API Collection
└── README.md
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: v18.x or higher installed
- **npm**: v9.x or higher installed
- **MongoDB** *(Optional)*: If local MongoDB is not running, the server automatically starts an in-memory database (`mongodb-memory-server`) for hassle-free demonstration and testing.

---

### 1. Backend Setup & Startup

```bash
cd backend

# 1. Install dependencies
npm install

# 2. Copy environment file (pre-configured defaults)
cp .env.example .env

# 3. Start development server (Port 5000)
npm run dev
```

Server health check available at `http://localhost:5000/health`.

---

### 2. Frontend Setup & Startup

```bash
cd frontend

# 1. Install dependencies
npm install

# 2. Start Vite development server (Port 5173)
npm run dev
```

Open `http://localhost:5173` in your browser. Open multiple windows (or incognito tabs) in the same room to experience real-time collaborative drawing and cursor tracking.

---

## 🧪 Automated Testing

The backend includes automated integration & unit tests powered by **Jest**, **Supertest**, and **Socket.io-client**.

```bash
cd backend
npm test
```

### Test Coverage Highlights:
- **`auth.test.js`**: User registration, login token generation, duplicate email rejection.
- **`room.test.js`**: Room creation, room detail lookups, invalid room code 404 handling.
- **`socket.test.js`**: Multi-client socket connection, drawing event broadcasting, room isolation validation (verifying Room A events do not leak to Room B), and late-joiner state hydration.

---

## 📄 Documentation Links & API Collection

- 📘 [REST API Documentation](file:///docs/API_DOCUMENTATION.md)
- ⚡ [WebSocket Events Reference](file:///docs/WEBSOCKET_EVENTS.md)
- 📬 **Postman Collection**: [`postman_collection.json`](file:///postman_collection.json)

---

## 📐 Key Design Decisions & Architectural Patterns

1. **Clean Layered Architecture**: Clear separation between routes, controllers, middleware, Mongoose models, and WebSocket handlers.
2. **Socket Room Isolation**: Leveraging Socket.IO's native `socket.join(roomId)` namespaces to ensure events are zero-leaked across different whiteboard rooms.
3. **Resilient Database Layer**: High-speed in-memory state caching combined with MongoDB asynchronous persistence for fast drawing rendering and durable room restoration.
4. **Zero-Friction Fallback**: Integrated `MongoMemoryServer` fallback ensures evaluators can launch and test the backend immediately without needing an active local MongoDB service.
5. **Crisp Canvas Rendering**: Dynamic high-DPI (`window.devicePixelRatio`) scaling and quadratic curve smoothing prevent blurry lines on Retina screens.
