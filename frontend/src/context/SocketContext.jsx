import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';

const SOCKET_SERVER_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [actions, setActions] = useState([]);
  const [activeUsers, setActiveUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [remoteCursors, setRemoteCursors] = useState({});

  const socketRef = useRef(null);

  useEffect(() => {
    const socketInstance = io(SOCKET_SERVER_URL, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socketRef.current = socketInstance;
    setSocket(socketInstance);

    socketInstance.on('connect', () => {
      console.log('[Socket Connected] ID:', socketInstance.id);
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('[Socket Disconnected]');
      setIsConnected(false);
    });

    socketInstance.on('connect_error', (err) => {
      console.warn('[Socket Connection Error]:', err.message);
      setIsConnected(false);
    });

    // Room State Hydration Event
    socketInstance.on('room-state', (data) => {
      console.log('[Socket Event] room-state received:', data);
      setActions(data.actions || []);
      setActiveUsers(data.users || []);
      if (data.currentUser) setCurrentUser(data.currentUser);
    });

    // Single Drawing Event from another client
    socketInstance.on('draw-action', (action) => {
      setActions((prev) => [...prev, action]);
    });

    // Full Actions State Update (e.g., after Undo or Redo)
    socketInstance.on('state-update', (data) => {
      setActions(data.actions || []);
    });

    // Canvas Cleared Event
    socketInstance.on('canvas-cleared', () => {
      setActions([]);
    });

    // User Joined Event
    socketInstance.on('user-joined', (data) => {
      if (data.activeUsers) setActiveUsers(data.activeUsers);
    });

    // User Left Event
    socketInstance.on('user-left', (data) => {
      if (data.activeUsers) setActiveUsers(data.activeUsers);
      setRemoteCursors((prev) => {
        const copy = { ...prev };
        delete copy[data.socketId];
        return copy;
      });
    });

    // Remote Cursor Positions
    socketInstance.on('cursor-update', (data) => {
      setRemoteCursors((prev) => ({
        ...prev,
        [data.socketId]: data,
      }));
    });

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const joinRoom = (roomId, username, userId, passcode) => {
    return new Promise((resolve, reject) => {
      if (!socketRef.current) return reject('Socket not initialized');
      
      socketRef.current.emit(
        'join-room',
        { roomId, username, userId, passcode },
        (res) => {
          if (res && res.success) {
            setCurrentRoom(roomId);
            resolve(res);
          } else {
            reject(res ? res.message : 'Failed to join room');
          }
        }
      );
    });
  };

  const leaveRoom = () => {
    if (socketRef.current) {
      socketRef.current.emit('leave-room');
    }
    setCurrentRoom(null);
    setActions([]);
    setActiveUsers([]);
    setRemoteCursors({});
  };

  const emitDrawAction = (action) => {
    if (socketRef.current && currentRoom) {
      // Instantly apply locally for smooth optimistic UI
      setActions((prev) => [...prev, action]);
      socketRef.current.emit('draw-action', action);
    }
  };

  const emitCursorMove = (coords) => {
    if (socketRef.current && currentRoom) {
      socketRef.current.emit('cursor-move', coords);
    }
  };

  const undo = () => {
    if (socketRef.current && currentRoom) {
      socketRef.current.emit('undo');
    }
  };

  const redo = () => {
    if (socketRef.current && currentRoom) {
      socketRef.current.emit('redo');
    }
  };

  const clearCanvas = () => {
    if (socketRef.current && currentRoom) {
      setActions([]);
      socketRef.current.emit('clear-canvas');
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        currentRoom,
        actions,
        activeUsers,
        currentUser,
        remoteCursors,
        joinRoom,
        leaveRoom,
        emitDrawAction,
        emitCursorMove,
        undo,
        redo,
        clearCanvas,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
