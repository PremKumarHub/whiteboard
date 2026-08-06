import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Plus,
  LogIn,
  Users,
  Lock,
  Globe,
  Sparkles,
  Search,
  ArrowRight,
  LogOut,
  Shield,
} from 'lucide-react';

export const DashboardPage = ({ onJoinRoom }) => {
  const { user, logout } = useAuth();

  const [publicRooms, setPublicRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(true);

  // Join Room by Code state
  const [joinCode, setJoinCode] = useState('');
  const [joinPasscode, setJoinPasscode] = useState('');
  const [requiresPasscode, setRequiresPasscode] = useState(false);
  const [joinError, setJoinError] = useState('');

  // Create Room Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchRooms = async () => {
    setLoadingRooms(true);
    try {
      const res = await api.listPublicRooms();
      if (res.success) {
        setPublicRooms(res.data.rooms || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingRooms(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    setCreating(true);

    try {
      const res = await api.createRoom(roomName, isPrivate, passcode);
      if (res.success) {
        onJoinRoom(res.data.room.roomId, passcode);
      }
    } catch (err) {
      alert(err.message || 'Failed to create room');
    } finally {
      setCreating(false);
    }
  };

  const handleJoinByCode = async (e) => {
    e.preventDefault();
    setJoinError('');

    if (!joinCode.trim()) {
      setJoinError('Please enter a valid Room ID');
      return;
    }

    const targetCode = joinCode.trim().toUpperCase();

    try {
      const res = await api.getRoomDetails(targetCode);
      if (!res.success) {
        setJoinError(res.message || 'Room not found');
        return;
      }

      const room = res.data.room;

      if (room.isPrivate && !requiresPasscode) {
        setRequiresPasscode(true);
        return;
      }

      if (room.isPrivate && requiresPasscode) {
        const verifyRes = await api.verifyPasscode(targetCode, joinPasscode);
        if (!verifyRes.success) {
          setJoinError('Incorrect room passcode');
          return;
        }
      }

      onJoinRoom(targetCode, joinPasscode);
    } catch (err) {
      setJoinError(err.message || 'Failed to join room');
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        background: 'radial-gradient(circle at 50% 20%, #151e36 0%, #0b0f19 100%)',
        padding: '32px 24px',
      }}
    >
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        {/* Header Bar */}
        <header
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '40px',
          }}
        >
          <div className="brand">
            <div className="brand-icon">
              <Sparkles size={22} />
            </div>
            <span style={{ fontSize: '1.4rem' }}>Zansphere Whiteboard</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>
              Welcome, {user ? user.username : 'Guest'}
            </span>
            <button onClick={logout} className="btn btn-secondary" style={{ padding: '8px 14px' }}>
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/* Hero Section & Actions Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '24px',
            marginBottom: '48px',
          }}
        >
          {/* Card 1: Create New Room */}
          <div className="glass-card animate-fade-in" style={{ padding: '32px' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'rgba(99, 102, 241, 0.15)',
                color: 'var(--accent-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px',
              }}
            >
              <Plus size={26} />
            </div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '8px' }}>
              Create a Room
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '24px' }}>
              Start a new whiteboard session and invite team members to draw together in real-time.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px' }}
            >
              <Plus size={18} />
              <span>New Whiteboard Room</span>
            </button>
          </div>

          {/* Card 2: Join Existing Room */}
          <div className="glass-card animate-fade-in" style={{ padding: '32px' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'rgba(139, 92, 246, 0.15)',
                color: 'var(--accent-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px',
              }}
            >
              <LogIn size={26} />
            </div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '8px' }}>
              Join by Room Code
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '20px' }}>
              Enter a unique Room ID (e.g. ROOM-ABC123) to jump straight into an active board.
            </p>

            {joinError && (
              <div
                style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#fca5a5',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  marginBottom: '12px',
                }}
              >
                {joinError}
              </div>
            )}

            <form onSubmit={handleJoinByCode} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input
                type="text"
                placeholder="ROOM-ID (e.g. ROOM-X7Y9Z)"
                value={joinCode}
                onChange={(e) => {
                  setJoinCode(e.target.value);
                  setRequiresPasscode(false);
                }}
                className="input-field"
                required
              />

              {requiresPasscode && (
                <input
                  type="password"
                  placeholder="Enter Room Passcode"
                  value={joinPasscode}
                  onChange={(e) => setJoinPasscode(e.target.value)}
                  className="input-field"
                  required
                />
              )}

              <button type="submit" className="btn btn-secondary" style={{ padding: '12px' }}>
                <span>Join Room</span>
                <ArrowRight size={18} />
              </button>
            </form>
          </div>
        </div>

        {/* Public Active Whiteboards Section */}
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Globe size={22} color="var(--accent-cyan)" />
              <h3 style={{ fontSize: '1.3rem', fontWeight: 700 }}>Public Collaborative Rooms</h3>
            </div>
            <button onClick={fetchRooms} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
              Refresh
            </button>
          </div>

          {loadingRooms ? (
            <div style={{ color: 'var(--text-muted)', padding: '24px 0' }}>Loading rooms...</div>
          ) : publicRooms.length === 0 ? (
            <div
              className="glass-card"
              style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}
            >
              No active public rooms found. Create the first room above!
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '16px',
              }}
            >
              {publicRooms.map((room) => (
                <div
                  key={room.roomId}
                  className="glass-card"
                  style={{
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{room.name}</h4>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          color: '#a5b4fc',
                          backgroundColor: 'rgba(99, 102, 241, 0.15)',
                          padding: '2px 8px',
                          borderRadius: '6px',
                        }}
                      >
                        {room.roomId}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
                      Created by {room.creatorName || 'Guest'}
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--accent-emerald)' }}>
                      <Users size={14} />
                      <span>{room.activeUsersCount || 0} active</span>
                    </div>
                    <button
                      onClick={() => onJoinRoom(room.roomId)}
                      className="btn btn-primary"
                      style={{ padding: '6px 14px', fontSize: '0.85rem' }}
                    >
                      Join
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Room Modal */}
      {showCreateModal && (
        <div className="modal-overlay animate-fade-in" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content glass-panel" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '16px' }}>
              Create Whiteboard Room
            </h3>

            <form onSubmit={handleCreateRoom} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '6px', color: 'var(--text-secondary)' }}>
                  Room Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Brainstorming Session"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  className="input-field"
                  required
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <input
                  type="checkbox"
                  id="private-check"
                  checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <label htmlFor="private-check" style={{ fontSize: '0.9rem', cursor: 'pointer' }}>
                  Protect Room with Passcode
                </label>
              </div>

              {isPrivate && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '6px', color: 'var(--text-secondary)' }}>
                    Set Room Passcode
                  </label>
                  <input
                    type="password"
                    placeholder="Enter passcode"
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    className="input-field"
                    required
                  />
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button type="submit" disabled={creating} className="btn btn-primary" style={{ flex: 1 }}>
                  {creating ? 'Creating...' : 'Create & Launch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
