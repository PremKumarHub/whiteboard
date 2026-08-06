import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { WhiteboardPage } from './pages/WhiteboardPage';

function MainApp() {
  const { user, loading } = useAuth();
  const [activeRoom, setActiveRoom] = useState(null);
  const [roomPasscode, setRoomPasscode] = useState('');

  // Check URL query parameters for direct room link (e.g. ?room=ROOM-XY123)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room');
    if (roomParam) {
      setActiveRoom(roomParam.toUpperCase());
    }
  }, []);

  const handleJoinRoom = (roomId, passcode = '') => {
    setRoomPasscode(passcode);
    setActiveRoom(roomId);
    window.history.pushState({}, '', `?room=${roomId}`);
  };

  const handleLeaveRoom = () => {
    setActiveRoom(null);
    setRoomPasscode('');
    window.history.pushState({}, '', window.location.pathname);
  };

  if (loading) {
    return (
      <div
        style={{
          height: '100vh',
          width: '100vw',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0b0f19',
          color: 'var(--text-secondary)',
        }}
      >
        Initializing Zansphere Whiteboard...
      </div>
    );
  }

  // Step 1: If not authenticated/guest, show Auth page
  if (!user) {
    return <AuthPage onAuthSuccess={() => {}} />;
  }

  // Step 2: If in a room, render Whiteboard workspace
  if (activeRoom) {
    return (
      <WhiteboardPage
        roomId={activeRoom}
        passcode={roomPasscode}
        onLeave={handleLeaveRoom}
      />
    );
  }

  // Step 3: Otherwise render Dashboard
  return <DashboardPage onJoinRoom={handleJoinRoom} />;
}

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <MainApp />
      </SocketProvider>
    </AuthProvider>
  );
}
