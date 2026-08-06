import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sparkles, ArrowRight, UserCheck, Shield, Lock, Mail, User } from 'lucide-react';

export const AuthPage = ({ onAuthSuccess }) => {
  const { login, register, setGuestUser } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [isGuest, setIsGuest] = useState(false);

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [guestName, setGuestName] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      if (isGuest) {
        if (!guestName.trim()) {
          setError('Please enter a display name');
          setSubmitting(false);
          return;
        }
        setGuestUser(guestName.trim());
        onAuthSuccess();
      } else if (isRegister) {
        const res = await register(username, email, password);
        if (res.success) {
          onAuthSuccess();
        } else {
          setError(res.message || 'Registration failed');
        }
      } else {
        const res = await login(email, password);
        if (res.success) {
          onAuthSuccess();
        } else {
          setError(res.message || 'Login failed');
        }
      }
    } catch (err) {
      setError(err.message || 'Authentication error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        background: 'radial-gradient(circle at 50% 30%, #172036 0%, #0b0f19 100%)',
      }}
    >
      <div className="modal-content glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '440px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            className="brand-icon"
            style={{ width: '48px', height: '48px', margin: '0 auto 14px auto', borderRadius: '14px' }}
          >
            <Sparkles size={26} />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '6px' }}>
            Zansphere Whiteboard
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Real-time collaborative canvas for teams and creators
          </p>
        </div>

        {/* Mode Selector Tabs */}
        <div
          className="glass-card"
          style={{
            display: 'flex',
            padding: '4px',
            borderRadius: '12px',
            marginBottom: '24px',
            background: 'rgba(0,0,0,0.3)',
          }}
        >
          <button
            type="button"
            onClick={() => {
              setIsGuest(false);
              setIsRegister(false);
              setError('');
            }}
            style={{
              flex: 1,
              padding: '8px',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              color: !isGuest && !isRegister ? 'white' : 'var(--text-muted)',
              background: !isGuest && !isRegister ? 'var(--accent-primary)' : 'transparent',
              transition: 'all 0.2s',
            }}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => {
              setIsGuest(false);
              setIsRegister(true);
              setError('');
            }}
            style={{
              flex: 1,
              padding: '8px',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              color: !isGuest && isRegister ? 'white' : 'var(--text-muted)',
              background: !isGuest && isRegister ? 'var(--accent-primary)' : 'transparent',
              transition: 'all 0.2s',
            }}
          >
            Register
          </button>
          <button
            type="button"
            onClick={() => {
              setIsGuest(true);
              setError('');
            }}
            style={{
              flex: 1,
              padding: '8px',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              color: isGuest ? 'white' : 'var(--text-muted)',
              background: isGuest ? 'var(--accent-secondary)' : 'transparent',
              transition: 'all 0.2s',
            }}
          >
            Guest
          </button>
        </div>

        {error && (
          <div
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#fca5a5',
              padding: '10px 14px',
              borderRadius: '10px',
              fontSize: '0.85rem',
              marginBottom: '16px',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {isGuest ? (
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '6px', color: 'var(--text-secondary)' }}>
                Display Name
              </label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="e.g. Alex Engineer"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="input-field"
                  style={{ paddingLeft: '42px' }}
                  required
                />
              </div>
            </div>
          ) : (
            <>
              {isRegister && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '6px', color: 'var(--text-secondary)' }}>
                    Username
                  </label>
                  <div style={{ position: 'relative' }}>
                    <User size={18} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-muted)' }} />
                    <input
                      type="text"
                      placeholder="Username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="input-field"
                      style={{ paddingLeft: '42px' }}
                      required
                    />
                  </div>
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '6px', color: 'var(--text-secondary)' }}>
                  Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-muted)' }} />
                  <input
                    type="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field"
                    style={{ paddingLeft: '42px' }}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '6px', color: 'var(--text-secondary)' }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-muted)' }} />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field"
                    style={{ paddingLeft: '42px' }}
                    required
                  />
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', marginTop: '10px' }}
          >
            <span>{submitting ? 'Connecting...' : isGuest ? 'Continue as Guest' : isRegister ? 'Create Account' : 'Sign In'}</span>
            <ArrowRight size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};
