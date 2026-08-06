import React, { useState } from 'react';
import {
  Pencil,
  Eraser,
  Square,
  Circle as CircleIcon,
  Minus,
  Type,
  Undo2,
  Redo2,
  Trash2,
  Download,
  Grid,
  Palette,
  Sliders,
} from 'lucide-react';

const COLORS = [
  '#3b82f6', // Blue
  '#ef4444', // Red
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ec4899', // Pink
  '#8b5cf6', // Purple
  '#06b6d4', // Cyan
  '#ffffff', // White
];

const STROKE_SIZES = [2, 4, 8, 14];

export const Toolbar = ({
  activeTool,
  setActiveTool,
  activeColor,
  setActiveColor,
  strokeWidth,
  setStrokeWidth,
  onUndo,
  onRedo,
  onClear,
  onExport,
  isGrid,
  setIsGrid,
}) => {
  const [showColors, setShowColors] = useState(false);
  const [showSizes, setShowSizes] = useState(false);

  return (
    <div className="floating-toolbar glass-panel animate-fade-in">
      {/* Pen */}
      <button
        onClick={() => setActiveTool('pen')}
        className={`tool-btn ${activeTool === 'pen' ? 'active' : ''}`}
        title="Pen Tool"
      >
        <Pencil size={18} />
      </button>

      {/* Eraser */}
      <button
        onClick={() => setActiveTool('eraser')}
        className={`tool-btn ${activeTool === 'eraser' ? 'active' : ''}`}
        title="Eraser Tool"
      >
        <Eraser size={18} />
      </button>

      {/* Line */}
      <button
        onClick={() => setActiveTool('line')}
        className={`tool-btn ${activeTool === 'line' ? 'active' : ''}`}
        title="Line Tool"
      >
        <Minus size={18} />
      </button>

      {/* Rectangle */}
      <button
        onClick={() => setActiveTool('rectangle')}
        className={`tool-btn ${activeTool === 'rectangle' ? 'active' : ''}`}
        title="Rectangle Tool"
      >
        <Square size={18} />
      </button>

      {/* Circle */}
      <button
        onClick={() => setActiveTool('circle')}
        className={`tool-btn ${activeTool === 'circle' ? 'active' : ''}`}
        title="Circle Tool"
      >
        <CircleIcon size={18} />
      </button>

      {/* Text */}
      <button
        onClick={() => setActiveTool('text')}
        className={`tool-btn ${activeTool === 'text' ? 'active' : ''}`}
        title="Text Tool"
      >
        <Type size={18} />
      </button>

      <div className="toolbar-divider" />

      {/* Color Selector */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => {
            setShowColors(!showColors);
            setShowSizes(false);
          }}
          className="tool-btn"
          title="Color Swatch"
        >
          <div
            style={{
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              backgroundColor: activeColor,
              border: '2px solid white',
            }}
          />
        </button>

        {showColors && (
          <div className="color-picker-dropdown glass-panel">
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => {
                  setActiveColor(c);
                  setShowColors(false);
                }}
                className={`color-swatch ${activeColor === c ? 'selected' : ''}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Stroke Width Selector */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => {
            setShowSizes(!showSizes);
            setShowColors(false);
          }}
          className="tool-btn"
          title="Stroke Width"
        >
          <Sliders size={18} />
        </button>

        {showSizes && (
          <div className="color-picker-dropdown glass-panel" style={{ gap: '10px' }}>
            {STROKE_SIZES.map((size) => (
              <button
                key={size}
                onClick={() => {
                  setStrokeWidth(size);
                  setShowSizes(false);
                }}
                className="tool-btn"
                style={{
                  width: '32px',
                  height: '32px',
                  backgroundColor: strokeWidth === size ? 'var(--accent-primary)' : 'rgba(255,255,255,0.1)',
                }}
              >
                <div
                  style={{
                    width: `${size}px`,
                    height: `${size}px`,
                    borderRadius: '50%',
                    backgroundColor: 'white',
                  }}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="toolbar-divider" />

      {/* Undo */}
      <button onClick={onUndo} className="tool-btn" title="Undo (Ctrl+Z)">
        <Undo2 size={18} />
      </button>

      {/* Redo */}
      <button onClick={onRedo} className="tool-btn" title="Redo (Ctrl+Y)">
        <Redo2 size={18} />
      </button>

      {/* Clear Canvas */}
      <button onClick={onClear} className="tool-btn" title="Clear Canvas">
        <Trash2 size={18} color="#f87171" />
      </button>

      <div className="toolbar-divider" />

      {/* Grid Toggle */}
      <button
        onClick={() => setIsGrid(!isGrid)}
        className={`tool-btn ${isGrid ? 'active' : ''}`}
        title="Toggle Grid Overlay"
      >
        <Grid size={18} />
      </button>

      {/* Export PNG */}
      <button onClick={onExport} className="tool-btn" title="Export as Image">
        <Download size={18} />
      </button>
    </div>
  );
};
