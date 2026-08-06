const Room = require('../models/Room');
const DrawingState = require('../models/DrawingState');
const { sendSuccess, sendError } = require('../utils/responseHandler');

// Helper to generate readable random room ID
const generateRoomId = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = 'ROOM-';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// @desc    Create a new whiteboard room
// @route   POST /api/rooms/create
// @access  Public / Optional Auth
const createRoom = async (req, res, next) => {
  try {
    const { name, isPrivate, passcode, maxUsers } = req.body;

    let customName = name && name.trim() ? name.trim() : 'Collaborative Board';
    let roomId = generateRoomId();

    // Ensure uniqueness
    let exists = await Room.findOne({ roomId });
    while (exists) {
      roomId = generateRoomId();
      exists = await Room.findOne({ roomId });
    }

    const creatorId = req.user ? req.user._id : null;
    const creatorName = req.user ? req.user.username : 'Guest Creator';

    const room = await Room.create({
      roomId,
      name: customName,
      creator: creatorId,
      creatorName,
      isPrivate: Boolean(isPrivate),
      passcode: passcode || '',
      maxUsers: maxUsers ? parseInt(maxUsers, 10) : 50,
    });

    // Initialize blank drawing state for this room
    await DrawingState.create({
      roomId,
      actions: [],
      undoStack: [],
    });

    return sendSuccess(res, 201, 'Room created successfully', {
      room: {
        roomId: room.roomId,
        name: room.name,
        creatorName: room.creatorName,
        isPrivate: room.isPrivate,
        maxUsers: room.maxUsers,
        createdAt: room.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get room information by Room ID
// @route   GET /api/rooms/:roomId
// @access  Public
const getRoomDetails = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const room = await Room.findOne({ roomId: roomId.toUpperCase() });

    if (!room) {
      return sendError(res, 404, 'Room not found. Please check the Room ID.');
    }

    return sendSuccess(res, 200, 'Room details fetched', {
      room: {
        roomId: room.roomId,
        name: room.name,
        creatorName: room.creatorName,
        isPrivate: room.isPrivate,
        maxUsers: room.maxUsers,
        activeUsersCount: room.activeUsersCount,
        createdAt: room.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify passcode for private room access
// @route   POST /api/rooms/verify-passcode
// @access  Public
const verifyRoomPasscode = async (req, res, next) => {
  try {
    const { roomId, passcode } = req.body;

    const room = await Room.findOne({ roomId: roomId ? roomId.toUpperCase() : '' });
    if (!room) {
      return sendError(res, 404, 'Room not found');
    }

    if (!room.isPrivate) {
      return sendSuccess(res, 200, 'Room is public, access granted', { verified: true });
    }

    if (room.passcode !== passcode) {
      return sendError(res, 401, 'Incorrect passcode for this room');
    }

    return sendSuccess(res, 200, 'Passcode verified successfully', { verified: true });
  } catch (error) {
    next(error);
  }
};

// @desc    List active/public rooms
// @route   GET /api/rooms
// @access  Public
const listPublicRooms = async (req, res, next) => {
  try {
    const rooms = await Room.find({ isPrivate: false })
      .sort({ createdAt: -1 })
      .limit(20)
      .select('roomId name creatorName maxUsers activeUsersCount createdAt');

    return sendSuccess(res, 200, 'Public rooms retrieved', { rooms });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createRoom,
  getRoomDetails,
  verifyRoomPasscode,
  listPublicRooms,
};
