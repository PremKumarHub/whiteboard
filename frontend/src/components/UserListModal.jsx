import React from 'react';
import { X, Users, Shield, UserCheck } from 'lucide-react';

export const UserListModal = ({ users, onClose }) => {
  return (
    <div className="modal-overlay animate-fade-in" onClick={onClose}>
      <div
        className="modal-content glass-panel"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '20px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Users size={20} color="var(--accent-primary)" />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Room Active Participants</h3>
          </div>
          <button onClick={onClose} className="tool-btn" style={{ width: '32px', height: '32px' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '300px', overflowY: 'auto' }}>
          {users.map((u) => (
            <div
              key={u.socketId}
              className="glass-card"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  className="user-avatar-badge"
                  style={{ backgroundColor: u.color || 'var(--accent-primary)' }}
                >
                  {u.username ? u.username.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{u.username}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Joined: {new Date(u.joinedAt || Date.now()).toLocaleTimeString()}
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.75rem',
                  color: '#10b981',
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  padding: '4px 8px',
                  borderRadius: '9999px',
                }}
              >
                <UserCheck size={12} />
                <span>Active</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
