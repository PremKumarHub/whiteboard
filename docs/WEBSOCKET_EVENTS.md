# WebSocket Event Documentation

Zansphere Whiteboard relies on Socket.IO for bidirectional, real-time communication between clients and the server.

**Connection Endpoint**: `ws://localhost:5000` (or `http://localhost:5000`)

---

## 1. Client-to-Server Events (Emitted by Client)

### 1.1 `join-room`
Joins a specific whiteboard room and requests initial room state hydration.
- **Payload**:
```json
{
  "roomId": "ROOM-X7Y9Z1",
  "username": "PremKumar",
  "userId": "user_12345",
  "passcode": ""
}
```
- **Acknowledgement Callback**: `({ success: boolean, message?: string, user?: object })`

---

### 1.2 `draw-action`
Emits a drawing element (pen stroke, line, rectangle, circle, text) to be broadcasted to all users in the room.
- **Payload**:
```json
{
  "id": "action_1722960000_a1b2",
  "type": "stroke",
  "tool": "pen",
  "color": "#3b82f6",
  "strokeWidth": 4,
  "points": [
    { "x": 100, "y": 150 },
    { "x": 105, "y": 155 }
  ]
}
```

---

### 1.3 `cursor-move`
Emits the user's current mouse or touch position for live cursor tracking.
- **Payload**:
```json
{
  "x": 420,
  "y": 280
}
```

---

### 1.4 `undo`
Triggers an undo request for the room's latest drawing operation.
- **Payload**: None

---

### 1.5 `redo`
Triggers a redo request for the room's most recently undone drawing action.
- **Payload**: None

---

### 1.6 `clear-canvas`
Clears all current drawing strokes from the room canvas.
- **Payload**: None

---

### 1.7 `leave-room`
Explicitly leaves the current room.
- **Payload**: None

---

## 2. Server-to-Client Events (Emitted by Server)

### 2.1 `room-state`
Emitted to a newly joined client containing the full canvas history and online participants.
- **Payload**:
```json
{
  "roomId": "ROOM-X7Y9Z1",
  "actions": [ /* Array of saved drawing objects */ ],
  "users": [ /* Array of active user objects */ ],
  "currentUser": { "socketId": "...", "username": "...", "color": "#3b82f6" }
}
```

---

### 2.2 `draw-action`
Emitted to all other users in the room when someone draws.
- **Payload**: Single drawing operation object.

---

### 2.3 `state-update`
Emitted to all clients in a room when canvas state changes globally (e.g. after Undo or Redo).
- **Payload**:
```json
{
  "actions": [ /* Updated active actions array */ ]
}
```

---

### 2.4 `cursor-update`
Emitted to other clients in the room to update remote cursor position.
- **Payload**:
```json
{
  "socketId": "socket_xyz",
  "userId": "user_12345",
  "username": "Alice",
  "color": "#ec4899",
  "x": 420,
  "y": 280
}
```

---

### 2.5 `user-joined`
Emitted when a new user enters the room.
- **Payload**:
```json
{
  "user": { "socketId": "...", "username": "Bob", "color": "#10b981" },
  "activeUsers": [ /* Full list of active users */ ]
}
```

---

### 2.6 `user-left`
Emitted when a user leaves or disconnects from the room.
- **Payload**:
```json
{
  "socketId": "socket_xyz",
  "user": { "username": "Bob" },
  "activeUsers": [ /* Updated active users list */ ]
}
```
