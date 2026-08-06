import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useSocket } from '../context/SocketContext';
import { redrawCanvas } from '../utils/canvasRenderer';
import { MousePointer2 } from 'lucide-react';

export const WhiteboardCanvas = ({
  activeTool,
  activeColor,
  strokeWidth,
  isGrid,
  onCanvasReady,
}) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  const { actions, emitDrawAction, emitCursorMove, remoteCursors } = useSocket();

  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPoints, setCurrentPoints] = useState([]);
  const [startPos, setStartPos] = useState(null);
  const [activePreview, setActivePreview] = useState(null);

  // Resize canvas to match display size & crisp devicePixelRatio
  const updateCanvasDimensions = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const dpr = window.devicePixelRatio || 1;
    const width = container.clientWidth;
    const height = container.clientHeight;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    redrawCanvas(canvas, actions, activePreview);
  }, [actions, activePreview]);

  useEffect(() => {
    updateCanvasDimensions();
    window.addEventListener('resize', updateCanvasDimensions);
    return () => window.removeEventListener('resize', updateCanvasDimensions);
  }, [updateCanvasDimensions]);

  // Redraw canvas whenever room actions update
  useEffect(() => {
    if (canvasRef.current) {
      redrawCanvas(canvasRef.current, actions, activePreview);
    }
  }, [actions, activePreview]);

  // Pass canvas ref back for image export
  useEffect(() => {
    if (onCanvasReady) {
      onCanvasReady(canvasRef.current);
    }
  }, [onCanvasReady]);

  // Helper to extract relative mouse/touch coordinates
  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    let clientX, clientY;
    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  // Mouse / Touch Event Handlers
  const handleStart = (e) => {
    const coords = getCoordinates(e);
    setIsDrawing(true);
    setStartPos(coords);

    if (activeTool === 'text') {
      const userText = prompt('Enter text for whiteboard:');
      if (userText && userText.trim()) {
        const textAction = {
          id: `text_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          type: 'text',
          tool: 'text',
          color: activeColor,
          strokeWidth,
          x: coords.x,
          y: coords.y,
          text: userText.trim(),
        };
        emitDrawAction(textAction);
      }
      setIsDrawing(false);
      return;
    }

    if (activeTool === 'pen' || activeTool === 'eraser') {
      setCurrentPoints([coords]);
      setActivePreview({
        id: 'preview',
        type: 'stroke',
        tool: activeTool,
        color: activeColor,
        strokeWidth,
        points: [coords],
      });
    }
  };

  const handleMove = (e) => {
    const coords = getCoordinates(e);

    // Emit live user cursor position
    emitCursorMove(coords);

    if (!isDrawing || activeTool === 'text') return;

    if (activeTool === 'pen' || activeTool === 'eraser') {
      const updatedPoints = [...currentPoints, coords];
      setCurrentPoints(updatedPoints);
      setActivePreview({
        id: 'preview',
        type: 'stroke',
        tool: activeTool,
        color: activeColor,
        strokeWidth,
        points: updatedPoints,
      });
    } else if (activeTool === 'line') {
      setActivePreview({
        id: 'preview',
        type: 'shape',
        tool: 'line',
        color: activeColor,
        strokeWidth,
        points: [startPos, coords],
      });
    } else if (activeTool === 'rectangle') {
      const width = coords.x - startPos.x;
      const height = coords.y - startPos.y;
      setActivePreview({
        id: 'preview',
        type: 'shape',
        tool: 'rectangle',
        color: activeColor,
        strokeWidth,
        x: startPos.x,
        y: startPos.y,
        width,
        height,
      });
    } else if (activeTool === 'circle') {
      const radius = Math.sqrt(
        Math.pow(coords.x - startPos.x, 2) + Math.pow(coords.y - startPos.y, 2)
      );
      setActivePreview({
        id: 'preview',
        type: 'shape',
        tool: 'circle',
        color: activeColor,
        strokeWidth,
        x: startPos.x,
        y: startPos.y,
        radius,
      });
    }
  };

  const handleEnd = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    if (activePreview) {
      const finalAction = {
        ...activePreview,
        id: `action_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      };
      emitDrawAction(finalAction);
    }

    setCurrentPoints([]);
    setStartPos(null);
    setActivePreview(null);
  };

  return (
    <div
      ref={containerRef}
      className={`canvas-wrapper ${isGrid ? 'grid-bg' : ''}`}
      onMouseDown={handleStart}
      onMouseMove={handleMove}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
      onTouchStart={handleStart}
      onTouchMove={handleMove}
      onTouchEnd={handleEnd}
    >
      <canvas ref={canvasRef} />

      {/* Render Remote User Live Cursors */}
      {Object.values(remoteCursors).map((cursor) => (
        <div
          key={cursor.socketId}
          className="remote-cursor"
          style={{
            transform: `translate3d(${cursor.x}px, ${cursor.y}px, 0)`,
          }}
        >
          <MousePointer2
            size={18}
            color={cursor.color || '#3b82f6'}
            style={{
              fill: cursor.color || '#3b82f6',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))',
            }}
          />
          <div
            className="cursor-tag"
            style={{ backgroundColor: cursor.color || '#3b82f6' }}
          >
            {cursor.username}
          </div>
        </div>
      ))}
    </div>
  );
};
