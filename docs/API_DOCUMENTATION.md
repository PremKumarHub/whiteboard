# REST API Documentation

The Zansphere Whiteboard Backend provides RESTful API endpoints for user authentication and whiteboard room management.

**Base URL**: `http://localhost:5000/api`

---

## 1. Authentication Endpoints (`/api/auth`)

### 1.1 Register User
- **Method**: `POST`
- **Endpoint**: `/api/auth/register`
- **Access**: Public
- **Request Body**:
```json
{
  "username": "PremKumar",
  "email": "prem@example.com",
  "password": "password123"
}
```
- **Success Response (201 Created)**:
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "66b2a1c...",
      "username": "PremKumar",
      "email": "prem@example.com"
    },
    "token": "eyJhbGciOiJIUzI1NiIsIn..."
  }
}
```

### 1.2 Login User
- **Method**: `POST`
- **Endpoint**: `/api/auth/login`
- **Access**: Public
- **Request Body**:
```json
{
  "email": "prem@example.com",
  "password": "password123"
}
```
- **Success Response (200 OK)**:
```json
{
  "success": true,
  "message": "User logged in successfully",
  "data": {
    "user": {
      "_id": "66b2a1c...",
      "username": "PremKumar",
      "email": "prem@example.com"
    },
    "token": "eyJhbGciOiJIUzI1NiIsIn..."
  }
}
```

### 1.3 Get Current User Profile
- **Method**: `GET`
- **Endpoint**: `/api/auth/me`
- **Access**: Private (Requires `Authorization: Bearer <token>`)
- **Success Response (200 OK)**:
```json
{
  "success": true,
  "message": "Current user retrieved",
  "data": {
    "user": {
      "_id": "66b2a1c...",
      "username": "PremKumar",
      "email": "prem@example.com",
      "createdAt": "2026-08-06T18:50:00.000Z"
    }
  }
}
```

---

## 2. Room Management Endpoints (`/api/rooms`)

### 2.1 Create Whiteboard Room
- **Method**: `POST`
- **Endpoint**: `/api/rooms/create`
- **Access**: Public / Optional Bearer Auth
- **Request Body**:
```json
{
  "name": "Frontend Architecture Whiteboard",
  "isPrivate": false,
  "passcode": "",
  "maxUsers": 50
}
```
- **Success Response (201 Created)**:
```json
{
  "success": true,
  "message": "Room created successfully",
  "data": {
    "room": {
      "roomId": "ROOM-X7Y9Z1",
      "name": "Frontend Architecture Whiteboard",
      "creatorName": "PremKumar",
      "isPrivate": false,
      "maxUsers": 50,
      "createdAt": "2026-08-06T18:52:00.000Z"
    }
  }
}
```

### 2.2 Get Room Information
- **Method**: `GET`
- **Endpoint**: `/api/rooms/:roomId`
- **Access**: Public
- **Example**: `GET /api/rooms/ROOM-X7Y9Z1`
- **Success Response (200 OK)**:
```json
{
  "success": true,
  "message": "Room details fetched",
  "data": {
    "room": {
      "roomId": "ROOM-X7Y9Z1",
      "name": "Frontend Architecture Whiteboard",
      "creatorName": "PremKumar",
      "isPrivate": false,
      "maxUsers": 50,
      "activeUsersCount": 3,
      "createdAt": "2026-08-06T18:52:00.000Z"
    }
  }
}
```

### 2.3 Verify Room Passcode
- **Method**: `POST`
- **Endpoint**: `/api/rooms/verify-passcode`
- **Access**: Public
- **Request Body**:
```json
{
  "roomId": "ROOM-X7Y9Z1",
  "passcode": "secret123"
}
```
- **Success Response (200 OK)**:
```json
{
  "success": true,
  "message": "Passcode verified successfully",
  "data": {
    "verified": true
  }
}
```

### 2.4 List Public Whiteboard Rooms
- **Method**: `GET`
- **Endpoint**: `/api/rooms`
- **Access**: Public
- **Success Response (200 OK)**:
```json
{
  "success": true,
  "message": "Public rooms retrieved",
  "data": {
    "rooms": [
      {
        "roomId": "ROOM-X7Y9Z1",
        "name": "Frontend Architecture Whiteboard",
        "creatorName": "PremKumar",
        "maxUsers": 50,
        "activeUsersCount": 2,
        "createdAt": "2026-08-06T18:52:00.000Z"
      }
    ]
  }
}
```
