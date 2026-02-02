'use client';

import React, { useState, useRef } from 'react';
import { Dialog } from '@headlessui/react';

interface ImagePreviewProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  filename?: string;
}

export function ImagePreview({ isOpen, onClose, imageUrl, filename }: ImagePreviewProps) {
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const imageRef = useRef<HTMLImageElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true);
      dragStart.current = {
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && imageRef.current) {
      const container = imageRef.current.parentElement;
      if (container) {
        const rect = container.getBoundingClientRect();
        const maxX = (imageRef.current.width * zoom - rect.width) / 2;
        const maxY = (imageRef.current.height * zoom - rect.height) / 2;

        let newX = e.clientX - dragStart.current.x;
        let newY = e.clientY - dragStart.current.y;

        // Constrain movement
        newX = Math.max(-maxX, Math.min(maxX, newX));
        newY = Math.max(-maxY, Math.min(maxY, newY));

        setPosition({ x: newX, y: newY });
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.25, 0.5));
  };

  const handleZoomReset = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = filename || 'image.jpg';
    link.click();
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
        <Dialog.Panel className="max-w-7xl max-h-[90vh] bg-gray-900 rounded-lg overflow-hidden">
          {/* Toolbar */}
          <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between bg-gray-800 bg-opacity-90 rounded-lg p-2">
            <div className="flex items-center gap-2">
              <span className="text-white text-sm font-medium">
                {filename || 'Image Preview'}
              </span>
              <span className="text-gray-400 text-sm">
                ({Math.round(zoom * 100)}%)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleZoomOut}
                className="p-2 text-gray-300 hover:text-white rounded hover:bg-gray-700"
                disabled={zoom <= 0.5}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                </svg>
              </button>

              <button
                onClick={handleZoomReset}
                className="p-2 text-gray-300 hover:text-white rounded hover:bg-gray-700"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 0h-4m4 0l-5-5" />
                </svg>
              </button>

              <button
                onClick={handleZoomIn}
                className="p-2 text-gray-300 hover:text-white rounded hover:bg-gray-700"
                disabled={zoom >= 3}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v4m0 4h4m-4 4v-4m-4 4h4" />
                </svg>
              </button>

              <button
                onClick={handleDownload}
                className="p-2 text-gray-300 hover:text-white rounded hover:bg-gray-700"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>

              <button
                onClick={onClose}
                className="p-2 text-gray-300 hover:text-white rounded hover:bg-gray-700"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M6 18L18 6M6 6l12 12"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Image Container */}
          <div
            className="w-full h-full overflow-hidden cursor-move"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{ cursor: zoom > 1 ? 'grab' : 'default' }}
          >
            <img
              ref={imageRef}
              src={imageUrl}
              alt={filename || 'Preview'}
              className="block"
              style={{
                transform: `scale(${zoom}) translate(${position.x}px, ${position.y}px)`,
                transition: isDragging ? 'none' : 'transform 0.3s ease',
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
              }}
            />
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}