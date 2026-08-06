const mongoose = require('mongoose');

const drawingActionSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    type: { type: String, required: true }, // 'stroke', 'shape', 'text', 'clear'
    tool: { type: String, default: 'pen' }, // 'pen', 'eraser', 'line', 'rectangle', 'circle', 'text'
    color: { type: String, default: '#3b82f6' },
    strokeWidth: { type: Number, default: 3 },
    points: [{ x: Number, y: Number }],
    x: { type: Number },
    y: { type: Number },
    width: { type: Number },
    height: { type: Number },
    radius: { type: Number },
    text: { type: String },
    userId: { type: String },
    username: { type: String, default: 'Anonymous' },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const drawingStateSchema = new mongoose.Schema(
  {
    roomId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    actions: [drawingActionSchema],
    undoStack: [drawingActionSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('DrawingState', drawingStateSchema);
