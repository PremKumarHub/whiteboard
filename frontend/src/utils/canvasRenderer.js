/**
 * Canvas Renderer Engine
 * Handles high-DPI canvas rendering for smooth real-time drawing actions
 */

export const renderAction = (ctx, action) => {
  if (!ctx || !action) return;

  const { tool, color, strokeWidth, points, x, y, width, height, radius, text } = action;

  ctx.save();
  ctx.beginPath();
  ctx.strokeStyle = tool === 'eraser' ? '#0b0f19' : color || '#3b82f6';
  ctx.fillStyle = tool === 'eraser' ? '#0b0f19' : color || '#3b82f6';
  ctx.lineWidth = tool === 'eraser' ? (strokeWidth || 10) * 2 : strokeWidth || 3;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  if (tool === 'pen' || tool === 'eraser') {
    if (points && points.length > 0) {
      if (points.length === 1) {
        ctx.arc(points[0].x, points[0].y, (strokeWidth || 3) / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length - 1; i++) {
          const xc = (points[i].x + points[i + 1].x) / 2;
          const yc = (points[i].y + points[i + 1].y) / 2;
          ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
        }
        ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
        ctx.stroke();
      }
    }
  } else if (tool === 'line') {
    if (points && points.length >= 2) {
      const start = points[0];
      const end = points[points.length - 1];
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();
    }
  } else if (tool === 'rectangle') {
    if (x !== undefined && y !== undefined && width !== undefined && height !== undefined) {
      ctx.strokeRect(x, y, width, height);
    }
  } else if (tool === 'circle') {
    if (x !== undefined && y !== undefined && radius !== undefined) {
      ctx.arc(x, y, Math.abs(radius), 0, 2 * Math.PI);
      ctx.stroke();
    }
  } else if (tool === 'text') {
    if (x !== undefined && y !== undefined && text) {
      ctx.font = `${(strokeWidth || 3) * 5 + 12}px Outfit, sans-serif`;
      ctx.fillText(text, x, y);
    }
  }

  ctx.restore();
};

export const redrawCanvas = (canvas, actions, activePreview = null) => {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Render all saved room actions
  actions.forEach((action) => {
    renderAction(ctx, action);
  });

  // Render current user active shape preview if drawing
  if (activePreview) {
    renderAction(ctx, activePreview);
  }
};
