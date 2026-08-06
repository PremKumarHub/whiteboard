import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';
import { Toolbar } from '../components/Toolbar';
import { WhiteboardCanvas } from '../components/WhiteboardCanvas';

export const WhiteboardPage = ({ roomId, passcode, onLeave }) => {
  const { user } = useAuth();
  const { joinRoom, leaveRoom, undo, redo, clearCanvas, currentRoom } = useSocket();

  const [activeTool, setActiveTool] = useState('pen');
  const [activeColor, setActiveColor] = useState('#3b82f6');
  const [strokeWidth, setStrokeWidth] = useState(4);
  const [isGrid, setIsGrid] = useState(true);
  const [joinStatus, setJoinStatus] = useState({ loading: true, error: null });

  const canvasElementRef = useRef(null);

  useEffect(() => {
    let mounted = true;

    const connectToRoom = async () => {
      try {
        const username = user ? user.username : 'Guest User';
        const userId = user ? user._id : null;
        await joinRoom(roomId, username, userId, passcode);
        if (mounted) {
          setJoinStatus({ loading: false, error: null });
        }
      } catch (err) {
        if (mounted) {
          setJoinStatus({ loading: false, error: err || 'Failed to join room' });
        }
      }
    };

    connectToRoom();

    return () => {
      mounted = false;
      leaveRoom();
    };
  }, [roomId, passcode]);

  // Global Keyboard Shortcuts (Ctrl+Z for Undo, Ctrl+Y for Redo)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  // Export Canvas as PNG image
  const handleExportCanvas = useCallback(() => {
    const canvas = canvasElementRef.current;
    if (!canvas) return;

    // Create temporary canvas with dark background for export
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = canvas.width;
    exportCanvas.height = canvas.height;
    const ctx = exportCanvas.getContext('2d');

    ctx.fillStyle = '#0b0f19';
    ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
    ctx.drawImage(canvas, 0, 0);

    const link = document.createElement('a');
    link.download = `whiteboard-${roomId}-${Date.now()}.png`;
    link.href = exportCanvas.toDataURL('image/png');
    link.click();
  }, [roomId]);

  if (joinStatus.loading) {
    return (
      <div
        style={{
          height: '100vh',
          width: '100vw',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: '16px',
          background: 'radial-gradient(circle at 50% 50%, #151d33 0%, #0b0f19 100%)',
        }}
      >
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            border: '3px solid var(--accent-primary)',
            borderTopColor: 'transparent',
            animation: 'spin 1s linear infinite',
          }}
        />
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        <div style={{ color: 'var(--text-secondary)', fontSize: '1rem', fontWeight: 500 }}>
          Connecting to Collaborative Room {roomId}...
        </div>
      </div>
    );
  }

  if (joinStatus.error) {
    return (
      <div
        style={{
          height: '100vh',
          width: '100vw',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'radial-gradient(circle at 50% 50%, #151d33 0%, #0b0f19 100%)',
        }}
      >
        <div className="modal-content glass-panel" style={{ textAlign: 'center' }}>
          <h3 style={{ fontSize: '1.4rem', color: '#f87171', marginBottom: '12px' }}>
            Unable to Join Room
          </h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
            {joinStatus.error}
          </p>
          <button onClick={onLeave} className="btn btn-primary" style={{ width: '100%' }}>
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Top Navbar */}
      <Navbar onLeaveRoom={onLeave} />

      {/* HTML5 Whiteboard Canvas Workspace */}
      <WhiteboardCanvas
        activeTool={activeTool}
        activeColor={activeColor}
        strokeWidth={strokeWidth}
        isGrid={isGrid}
        onCanvasReady={(el) => (canvasElementRef.current = el)}
      />

      {/* Bottom Floating Toolbar */}
      <Toolbar
        activeTool={activeTool}
        setActiveTool={setActiveTool}
        activeColor={activeColor}
        setActiveColor={setActiveColor}
        strokeWidth={strokeWidth}
        setStrokeWidth={setStrokeWidth}
        onUndo={undo}
        onRedo={redo}
        onClear={clearCanvas}
        onExport={handleExportCanvas}
        isGrid={isGrid}
        setIsGrid={setIsGrid}
      />
    </div>
  );
};
