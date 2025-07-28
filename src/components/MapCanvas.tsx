import React, { useRef, useEffect, useState, useCallback } from 'react';

interface MapMarker {
  id: string;
  x: number;
  y: number;
  label: string;
  type: 'location' | 'poi' | 'danger' | 'treasure' | 'npc' | 'tile';
  description?: string;
  imageUrl?: string;
  tileSize?: { width: number; height: number };
}

interface MapCanvasProps {
  width: number;
  height: number;
  backgroundImage?: string;
  markers: MapMarker[];
  onCanvasClick?: (x: number, y: number) => void;
  onDrop?: (e: React.DragEvent<HTMLCanvasElement>) => void;
  onDragOver?: (e: React.DragEvent<HTMLCanvasElement>) => void;
  showGrid?: boolean;
  gridSize?: number;
  isEditing?: boolean;
  onHitTest?: (hitTestFn: (x: number, y: number) => string | null) => void;
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
  isEditing = false,
  onHitTest
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [loadedImages, setLoadedImages] = useState<Map<string, HTMLImageElement>>(new Map());

  // Hit test function to find marker at coordinates
  const hitTest = useCallback((x: number, y: number): string | null => {
    // Convert canvas coordinates to percentages
    const xPercent = (x / width) * 100;
    const yPercent = (y / height) * 100;

    // Check markers in reverse order (top-most first)
    for (let i = markers.length - 1; i >= 0; i--) {
      const marker = markers[i];
      
      if (marker.type === 'tile' && marker.tileSize) {
        // Calculate tile bounds in percentages
        const tileWidthPercent = (marker.tileSize.width * gridSize / width) * 100;
        const tileHeightPercent = (marker.tileSize.height * gridSize / height) * 100;
        
        const left = marker.x - (tileWidthPercent / 2);
        const right = marker.x + (tileWidthPercent / 2);
        const top = marker.y - (tileHeightPercent / 2);
        const bottom = marker.y + (tileHeightPercent / 2);
        
        if (xPercent >= left && xPercent <= right && yPercent >= top && yPercent <= bottom) {
          return marker.id;
        }
      } else {
        // For point markers, use a small hit area (12px radius)
        const hitRadius = 12;
        const markerX = (marker.x / 100) * width;
        const markerY = (marker.y / 100) * height;
        
        const distance = Math.sqrt(Math.pow(x - markerX, 2) + Math.pow(y - markerY, 2));
        if (distance <= hitRadius) {
          return marker.id;
        }
      }
    }
    
    return null;
  }, [markers, width, height, gridSize]);

  // Expose hit test function to parent
  useEffect(() => {
    if (onHitTest) {
      onHitTest(hitTest);
    }
  }, [hitTest, onHitTest]);

  // Load images for tiles
  useEffect(() => {
    const imagePromises: Promise<void>[] = [];
    const newLoadedImages = new Map(loadedImages);

    markers.forEach(marker => {
      if (marker.type === 'tile' && marker.imageUrl && !newLoadedImages.has(marker.imageUrl)) {
        const promise = new Promise<void>((resolve) => {
          const img = new Image();
          img.onload = () => {
            newLoadedImages.set(marker.imageUrl!, img);
            resolve();
          };
          img.onerror = () => {
            resolve(); // Continue even if image fails to load
          };
          img.src = marker.imageUrl!;
        });
        imagePromises.push(promise);
      }
    });

    if (imagePromises.length > 0) {
      Promise.all(imagePromises).then(() => {
        setLoadedImages(newLoadedImages);
      });
    }
  }, [markers, loadedImages]);

  // Main drawing effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw background
    if (backgroundImage && imageLoaded) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, width, height);
        drawContent();
      };
      img.src = backgroundImage;
    } else {
      // Set background color for blank maps
      ctx.fillStyle = '#1e293b'; // slate-800
      ctx.fillRect(0, 0, width, height);
      drawContent();
    }

    function drawContent() {
      // Draw grid
      if (showGrid) {
        drawGrid(ctx);
      }

      // Draw markers
      drawMarkers(ctx);
    }

    function drawGrid(ctx: CanvasRenderingContext2D) {
      ctx.strokeStyle = isDragOver ? 'rgba(34, 197, 94, 0.4)' : 'rgba(148, 163, 184, 0.2)';
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

    function drawMarkers(ctx: CanvasRenderingContext2D) {
      markers.forEach(marker => {
        const x = (marker.x / 100) * width;
        const y = (marker.y / 100) * height;

        if (marker.type === 'tile' && marker.imageUrl && marker.tileSize) {
          // Draw tile image
          const img = loadedImages.get(marker.imageUrl);
          if (img) {
            const tileWidth = marker.tileSize.width * gridSize;
            const tileHeight = marker.tileSize.height * gridSize;
            
            ctx.save();
            ctx.imageSmoothingEnabled = false; // For pixel art
            ctx.drawImage(
              img,
              x - tileWidth / 2,
              y - tileHeight / 2,
              tileWidth,
              tileHeight
            );
            ctx.restore();

            // Draw border for tiles
            ctx.strokeStyle = 'rgba(245, 158, 11, 0.5)'; // amber-500 with opacity
            ctx.lineWidth = 2;
            ctx.strokeRect(
              x - tileWidth / 2,
              y - tileHeight / 2,
              tileWidth,
              tileHeight
            );
          }
        } else {
          // Draw point markers
          const markerInfo = getMarkerTypeInfo(marker.type);
          
          // Draw marker circle
          ctx.beginPath();
          ctx.arc(x, y, 12, 0, 2 * Math.PI);
          ctx.fillStyle = markerInfo.color;
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.stroke();

          // Draw marker icon (emoji)
          ctx.font = '16px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = '#ffffff';
          ctx.fillText(markerInfo.icon, x, y);
        }
      });
    }

    function getMarkerTypeInfo(type: MapMarker['type']) {
      const markerTypes = {
        'location': { color: '#3b82f6', icon: '🏛️' }, // blue
        'poi': { color: '#10b981', icon: '⭐' }, // green
        'danger': { color: '#ef4444', icon: '⚠️' }, // red
        'treasure': { color: '#f59e0b', icon: '💰' }, // yellow
        'npc': { color: '#8b5cf6', icon: '👤' }, // purple
        'tile': { color: '#6b7280', icon: '🔲' } // gray
      };
      return markerTypes[type] || markerTypes.location;
    }

  }, [width, height, backgroundImage, imageLoaded, showGrid, gridSize, isDragOver, markers, loadedImages]);

  // Handle background image loading
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
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

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