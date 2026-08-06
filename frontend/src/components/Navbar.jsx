import React, { useState } from 'react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { UserListModal } from './UserListModal';
import {
  Share2,
  Users,
  Wifi,
  WifiOff,
  LogOut,
  Sparkles,
  Check,
  Copy,
} from 'lucide-react';

export const Navbar = ({ onLeaveRoom, roomInfo }) => {
  const { isConnected, currentRoom, activeUsers } = useSocket();
  const { user, logout } = useAuth();
  const [showUsersModal, setShowUsersModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    if (!currentRoom) return;
    navigator.clipboard.writeText(currentRoom);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <nav className="navbar glass-panel">
        {/* Brand Header */}
        <div className="brand">
          <div className="brand-icon">
            <Sparkles size={20} />
          </div>
          <span>Zansphere Board</span>
        </div>

        {/* Room Code Badge & Status */}
        {currentRoom && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              className="glass-card"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '6px 14px',
                borderRadius: '9999px',
              }}
            >
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: isConnected ? '#10b981' : '#ef4444',
                  boxShadow: isConnected ? '0 0 8px #10b981' : 'none',
                }}
              />
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Room:</span>
              <strong style={{ letterSpacing: '0.05em', color: '#a5b4fc' }}>{currentRoom}</strong>
              <button
                onClick={handleCopyCode}
                className="tool-btn"
                style={{ width: '28px', height: '28px' }}
                title="Copy Room Code"
              >
                {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
              </button>
            </div>
          </div>
        )}

        {/* Action Controls & Active Users Tray */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {/* Connection Indicator */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.85rem',
              color: isConnected ? '#10b981' : '#f87171',
            }}
          >
            {isConnected ? <Wifi size={16} /> : <WifiOff size={16} />}
            <span style={{ display: 'none', mdDisplay: 'inline' }}>
              {isConnected ? 'Live Sync' : 'Reconnecting...'}
            </span>
          </div>

          {/* Active Users Stack Trigger */}
          {currentRoom && (
            <button
              onClick={() => setShowUsersModal(true)}
              className="btn btn-secondary"
              style={{ padding: '6px 12px', fontSize: '0.85rem' }}
            >
              <Users size={16} />
              <span>{activeUsers.length} Online</span>
            </button>
          )}

          {/* User Profile / Leave Button */}
          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                {user.username}
              </span>
              <button
                onClick={onLeaveRoom || logout}
                className="btn btn-danger"
                style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                title="Leave Room"
              >
                <LogOut size={16} />
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Active Users Modal */}
      {showUsersModal && (
        <UserListModal
          users={activeUsers}
          onClose={() => setShowUsersModal(false)}
        />
      )}
    </>
  );
};
