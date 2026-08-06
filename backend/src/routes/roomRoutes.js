const express = require('express');
const router = express.Router();
const {
  createRoom,
  getRoomDetails,
  verifyRoomPasscode,
  listPublicRooms,
} = require('../controllers/roomController');
const { optionalAuth } = require('../middleware/authMiddleware');

router.post('/create', optionalAuth, createRoom);
router.get('/', listPublicRooms);
router.get('/:roomId', getRoomDetails);
router.post('/verify-passcode', verifyRoomPasscode);

module.exports = router;
