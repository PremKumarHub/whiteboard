const Room = require('../models/Room');
const DrawingState = require('../models/DrawingState');

// In-memory state cache for fast realtime access
const roomUsers = new Map(); // roomId -> Map(socketId -> { userId, username, color, joinedAt })
const roomStates = new Map(); // roomId -> { actions: [], undoStack: [] }

// Palette of colors assigned to users for live cursor identification
const USER_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#10b981', '#06b6d4',
  '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#6366f1'
];

const getRandomColor = () => {
  return USER_COLORS[Math.floor(Math.random() * USER_COLORS.length)];
};

// Helper: load or initialize room drawing state
const getOrLoadRoomState = async (roomId) => {
  if (roomStates.has(roomId)) {
    return roomStates.get(roomId);
  }

  try {
    let stateDoc = await DrawingState.findOne({ roomId });
    if (!stateDoc) {
      stateDoc = await DrawingState.create({
        roomId,
        actions: [],
        undoStack: [],
      });
    }

    const stateObj = {
      actions: stateDoc.actions ? stateDoc.actions.toObject() : [],
      undoStack: stateDoc.undoStack ? stateDoc.undoStack.toObject() : [],
    };

    roomStates.set(roomId, stateObj);
    return stateObj;
  } catch (err) {
    console.error(`[Socket] Error loading state for room ${roomId}:`, err.message);
    const fallback = { actions: [], undoStack: [] };
    roomStates.set(roomId, fallback);
    return fallback;
  }
};

// Helper: save room drawing state to database periodically/on change
const persistRoomState = async (roomId) => {
  const stateObj = roomStates.get(roomId);
  if (!stateObj) return;

  try {
    const mongoose = require('mongoose');
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      await DrawingState.findOneAndUpdate(
        { roomId },
        { actions: stateObj.actions, undoStack: stateObj.undoStack },
        { upsert: true, new: true }
      );
    }
  } catch (err) {
    console.error(`[Socket] DB persist failed for room ${roomId}:`, err.message);
  }
};

const setupSocketHandlers = (io) => {
  io.on('connection', (socket) => {
    console.log(`[Socket Connected] Socket ID: ${socket.id}`);

    // ----------------------------------------------------
    // Event 1: JOIN ROOM
    // ----------------------------------------------------
    socket.on('join-room', async (payload, callback) => {
      try {
        const { roomId, username, userId, passcode } = payload || {};

        if (!roomId) {
          if (callback) callback({ success: false, message: 'Room ID is required' });
          return;
        }

        const normalizedRoomId = roomId.toUpperCase();

        // Verify room in database if possible
        const roomDoc = await Room.findOne({ roomId: normalizedRoomId });
        if (roomDoc && roomDoc.isPrivate) {
          if (roomDoc.passcode && roomDoc.passcode !== passcode) {
            if (callback) callback({ success: false, message: 'Invalid room passcode' });
            return;
          }
        }

        // Join socket room
        socket.join(normalizedRoomId);

        // Assign user metadata
        const userColor = getRandomColor();
        const userMeta = {
          socketId: socket.id,
          userId: userId || socket.id,
          username: username || `Guest-${socket.id.substring(0, 4)}`,
          color: userColor,
          joinedAt: new Date(),
        };

        socket.data.roomId = normalizedRoomId;
        socket.data.user = userMeta;

        // Add to room active users map
        if (!roomUsers.has(normalizedRoomId)) {
          roomUsers.set(normalizedRoomId, new Map());
        }
        roomUsers.get(normalizedRoomId).set(socket.id, userMeta);

        // Load drawing state
        const roomState = await getOrLoadRoomState(normalizedRoomId);

        // Get array of all connected users in this room
        const activeUsers = Array.from(roomUsers.get(normalizedRoomId).values());

        // Update DB room user count
        if (roomDoc) {
          await Room.updateOne(
            { roomId: normalizedRoomId },
            { activeUsersCount: activeUsers.length }
          );
        }

        // Emit current full state to the joining user
        socket.emit('room-state', {
          roomId: normalizedRoomId,
          actions: roomState.actions,
          users: activeUsers,
          currentUser: userMeta,
          roomInfo: roomDoc ? { name: roomDoc.name, isPrivate: roomDoc.isPrivate } : null,
        });

        // Broadcast to other users in room that someone joined
        socket.to(normalizedRoomId).emit('user-joined', {
          user: userMeta,
          activeUsers,
        });

        console.log(`[Socket] User ${userMeta.username} (${socket.id}) joined room ${normalizedRoomId}`);

        if (callback) callback({ success: true, user: userMeta });
      } catch (error) {
        console.error('[Socket Join Error]', error);
        if (callback) callback({ success: false, message: error.message });
      }
    });

    // ----------------------------------------------------
    // Event 2: DRAW ACTION (Stroke / Shape / Text)
    // ----------------------------------------------------
    socket.on('draw-action', async (action) => {
      const roomId = socket.data.roomId;
      if (!roomId || !action) return;

      const roomState = await getOrLoadRoomState(roomId);
      
      // Assign action metadata
      const fullAction = {
        ...action,
        userId: socket.data.user ? socket.data.user.userId : socket.id,
        username: socket.data.user ? socket.data.user.username : 'Anonymous',
        timestamp: new Date(),
      };

      // Append to active actions
      roomState.actions.push(fullAction);
      // New action clears undo stack for fresh redo timeline
      roomState.undoStack = [];

      // Broadcast drawing event to all OTHER clients in room
      socket.to(roomId).emit('draw-action', fullAction);

      // Persist async to DB
      persistRoomState(roomId);
    });

    // ----------------------------------------------------
    // Event 3: CURSOR MOVEMENT
    // ----------------------------------------------------
    socket.on('cursor-move', (coords) => {
      const roomId = socket.data.roomId;
      const user = socket.data.user;
      if (!roomId || !user || !coords) return;

      socket.to(roomId).emit('cursor-update', {
        socketId: socket.id,
        userId: user.userId,
        username: user.username,
        color: user.color,
        x: coords.x,
        y: coords.y,
      });
    });

    // ----------------------------------------------------
    // Event 4: UNDO ACTION
    // ----------------------------------------------------
    socket.on('undo', async () => {
      const roomId = socket.data.roomId;
      if (!roomId) return;

      const roomState = await getOrLoadRoomState(roomId);
      if (roomState.actions.length === 0) return;

      // Pop last action and move to undo stack
      const undoneAction = roomState.actions.pop();
      roomState.undoStack.push(undoneAction);

      // Broadcast full state update to ALL clients in room
      io.in(roomId).emit('state-update', {
        actions: roomState.actions,
      });

      persistRoomState(roomId);
      console.log(`[Socket Undo] Room ${roomId} undid action ${undoneAction.id}`);
    });

    // ----------------------------------------------------
    // Event 5: REDO ACTION
    // ----------------------------------------------------
    socket.on('redo', async () => {
      const roomId = socket.data.roomId;
      if (!roomId) return;

      const roomState = await getOrLoadRoomState(roomId);
      if (roomState.undoStack.length === 0) return;

      // Pop from undo stack and push back to active actions
      const redoneAction = roomState.undoStack.pop();
      roomState.actions.push(redoneAction);

      // Broadcast full state update to ALL clients in room
      io.in(roomId).emit('state-update', {
        actions: roomState.actions,
      });

      persistRoomState(roomId);
      console.log(`[Socket Redo] Room ${roomId} redid action ${redoneAction.id}`);
    });

    // ----------------------------------------------------
    // Event 6: CLEAR CANVAS
    // ----------------------------------------------------
    socket.on('clear-canvas', async () => {
      const roomId = socket.data.roomId;
      if (!roomId) return;

      const roomState = await getOrLoadRoomState(roomId);

      // Save current actions to undoStack for safety
      roomState.undoStack = [...roomState.actions];
      roomState.actions = [];

      io.in(roomId).emit('canvas-cleared', {
        actions: [],
      });

      persistRoomState(roomId);
      console.log(`[Socket Clear] Room ${roomId} canvas cleared`);
    });

    // ----------------------------------------------------
    // Event 7: RECONNECT & STATE HYDRATION REQUEST
    // ----------------------------------------------------
    socket.on('request-sync', async () => {
      const roomId = socket.data.roomId;
      if (!roomId) return;

      const roomState = await getOrLoadRoomState(roomId);
      socket.emit('state-update', {
        actions: roomState.actions,
      });
    });

    // ----------------------------------------------------
    // Event 8: LEAVE ROOM / DISCONNECT
    // ----------------------------------------------------
    const handleLeave = async () => {
      const roomId = socket.data.roomId;
      const user = socket.data.user;
      if (!roomId) return;

      if (roomUsers.has(roomId)) {
        const usersMap = roomUsers.get(roomId);
        usersMap.delete(socket.id);

        const activeUsers = Array.from(usersMap.values());

        // Notify other room members
        socket.to(roomId).emit('user-left', {
          socketId: socket.id,
          user,
          activeUsers,
        });

        // Update DB
        try {
          await Room.updateOne(
            { roomId },
            { activeUsersCount: activeUsers.length }
          );
        } catch (e) {
          // ignore
        }

        if (usersMap.size === 0) {
          roomUsers.delete(roomId);
          // Persist final state before clearing from memory map
          await persistRoomState(roomId);
        }
      }

      console.log(`[Socket Disconnected] ${socket.id} left room ${roomId}`);
    };

    socket.on('leave-room', handleLeave);
    socket.on('disconnect', handleLeave);
  });
};

module.exports = { setupSocketHandlers };
