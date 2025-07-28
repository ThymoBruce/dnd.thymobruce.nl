import React, { useRef, useEffect, useState } from 'react';

interface MapCanvasProps {
  width: number;
  height: number;
  backgroundImage?: string;
  markers: any[];
  onCanvasClick?: (x: number, y: number) => void;
  showGrid?: boolean;
  gridSize?: number;
  isEditing?: boolean;
}

const MapCanvas: React.FC<MapCanvasProps> = ({
  width,
  height,
  backgroundImage,
  markers,
  onCanvasClick,
  showGrid = false,
  gridSize = 50,
  isEditing = false
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Set background color for blank maps
    if (!backgroundImage) {
      ctx.fillStyle = '#1e293b'; // slate-800
      ctx.fillRect(0, 0, width, height);
    }

    // Draw background image if provided
    if (backgroundImage && imageLoaded) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, width, height);
        drawGrid();
      };
      img.src = backgroundImage;
    } else {
      drawGrid();
    }

    function drawGrid() {
      if (!showGrid || !ctx) return;

      ctx.strokeStyle = 'rgba(148, 163, 184, 0.3)'; // slate-400 with opacity
      ctx.lineWidth = 1;

      // Draw vertical lines
      for (let x = 0; x <= width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      // Draw horizontal lines
      for (let y = 0; y <= height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    }
  }, [width, height, backgroundImage, imageLoaded, showGrid, gridSize]);

  useEffect(() => {
    if (backgroundImage) {
      const img = new Image();
      img.onload = () => setImageLoaded(true);
      img.onerror = () => setImageLoaded(false);
      img.src = backgroundImage;
    } else {
      setImageLoaded(true);
    }
  }, [backgroundImage]);

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!onCanvasClick) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    onCanvasClick(x, y);
  };

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      onClick={handleClick}
      className={`max-w-full max-h-full border border-slate-600 ${
        isEditing ? 'cursor-crosshair' : 'cursor-default'
      }`}
      style={{
        backgroundColor: backgroundImage ? 'transparent' : '#1e293b'
      }}
    />
  );
};

export default MapCanvas;