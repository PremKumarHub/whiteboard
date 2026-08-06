const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema(
  {
    roomId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Room name is required'],
      trim: true,
      maxlength: 50,
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    creatorName: {
      type: String,
      default: 'Guest',
    },
    isPrivate: {
      type: Boolean,
      default: false,
    },
    passcode: {
      type: String,
      default: '',
    },
    maxUsers: {
      type: Number,
      default: 50,
    },
    activeUsersCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Room', roomSchema);
