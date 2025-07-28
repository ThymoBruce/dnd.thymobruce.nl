import React, { useRef, useEffect, useState } from 'react';

interface MapCanvasProps {
  width: number;
  height: number;
  backgroundImage?: string;
  markers: any[];
  onCanvasClick?: (x: number, y: number) => void;
  onDrop?: (e: React.DragEvent<HTMLCanvasElement>) => void;
  onDragOver?: (e: React.DragEvent<HTMLCanvasElement>) => void;
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
  onDrop,
  onDragOver,
  showGrid = false,
  gridSize = 25,
  isEditing = false
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

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
        if (showGrid) drawGrid(ctx);
      };
      img.src = backgroundImage;
    } else {
      // Always draw grid
      if (showGrid) drawGrid(ctx);
    }

    function drawGrid(ctx: CanvasRenderingContext2D) {
      ctx.strokeStyle = isDragOver ? 'rgba(34, 197, 94, 0.4)' : 'rgba(148, 163, 184, 0.2)'; // green when dragging over
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
  }, [width, height, backgroundImage, imageLoaded, showGrid, gridSize, isDragOver]);

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

  const handleDrop = (e: React.DragEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (onDrop) {
      onDrop(e);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    setIsDragOver(true);
    if (onDragOver) {
      onDragOver(e);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`max-w-full max-h-full border-2 transition-colors duration-200 ${
          isDragOver 
            ? 'border-green-500 shadow-lg shadow-green-500/20' 
            : 'border-slate-600'
        } ${isEditing ? 'cursor-crosshair' : 'cursor-default'}`}
        style={{
          backgroundColor: backgroundImage ? 'transparent' : '#1e293b'
        }}
      />
      
      {/* Drop Zone Indicator */}
      {isDragOver && (
        <div className="absolute inset-0 bg-green-500/10 border-2 border-green-500 border-dashed rounded-lg flex items-center justify-center pointer-events-none">
          <div className="bg-green-500 text-white px-4 py-2 rounded-lg font-semibold">
            Drop building block here
          </div>
        </div>
      )}
    </div>
  );
};

export default MapCanvas;