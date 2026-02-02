'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Dialog } from '@headlessui/react';

interface PdfPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  pdfUrl: string;
  filename?: string;
}

export function PdfPreview({ isOpen, onClose, pdfUrl, filename }: PdfPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    if (!isOpen) return;

    const loadPDF = async () => {
      try {
        setLoading(true);

        // For now, let's create a simple placeholder for PDF viewing
        // In a real app, you would use PDF.js or similar
        setTotalPages(1);
      } catch (error) {
        console.error('Error loading PDF:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPDF();
  }, [isOpen, pdfUrl]);

  const goToPage = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.25, 2));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.25, 0.5));
  };

  const handleZoomReset = () => {
    setZoom(1);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = filename || 'document.pdf';
    link.click();
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
        <Dialog.Panel className="max-w-4xl max-h-[90vh] w-full bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center gap-4">
              <Dialog.Title className="text-lg font-semibold text-gray-900">
                {filename || 'PDF Preview'}
              </Dialog.Title>
              <span className="text-sm text-gray-500">
                {page} / {totalPages}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleZoomOut}
                className="p-2 text-gray-600 hover:text-gray-900 rounded hover:bg-gray-100"
                disabled={zoom <= 0.5}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                </svg>
              </button>

              <button
                onClick={handleZoomReset}
                className="p-2 text-gray-600 hover:text-gray-900 rounded hover:bg-gray-100"
              >
                100%
              </button>

              <button
                onClick={handleZoomIn}
                className="p-2 text-gray-600 hover:text-gray-900 rounded hover:bg-gray-100"
                disabled={zoom >= 2}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v4m0 4h4m-4 4v-4m-4 4h4" />
                </svg>
              </button>

              <button
                onClick={handleDownload}
                className="p-2 text-gray-600 hover:text-gray-900 rounded hover:bg-gray-100"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>

              <button
                onClick={onClose}
                className="p-2 text-gray-600 hover:text-gray-900 rounded hover:bg-gray-100"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* PDF Viewer */}
          <div className="flex-1 overflow-auto bg-gray-100 p-8">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center">
                <canvas ref={canvasRef} className="shadow-lg bg-white border border-gray-200" />
                <p className="mt-4 text-sm text-gray-600 text-center">
                  PDF预览功能需要安装PDF.js库。当前显示占位符。
                </p>
              </div>
            )}
          </div>

          {/* Footer Controls */}
          <div className="flex items-center justify-between p-4 border-t bg-gray-50">
            <div className="flex items-center gap-2">
              <button
                onClick={() => goToPage(page - 1)}
                disabled={page <= 1}
                className="px-3 py-1 text-gray-600 hover:text-gray-900 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                上一页
              </button>

              <span className="text-sm text-gray-600">
                第 {page} 页
              </span>

              <button
                onClick={() => goToPage(page + 1)}
                disabled={page >= totalPages}
                className="px-3 py-1 text-gray-600 hover:text-gray-900 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                下一页
              </button>
            </div>

            <div className="text-xs text-gray-500">
              缩放: {Math.round(zoom * 100)}%
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}