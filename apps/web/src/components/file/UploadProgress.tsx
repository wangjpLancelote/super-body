'use client';

import React from 'react';

interface UploadProgressProps {
  progress: { [key: string]: number };
  onClose: (fileId: string) => void;
}

export function UploadProgress({ progress, onClose }: UploadProgressProps) {
  const files = Object.entries(progress);

  if (files.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm">
      {files.map(([fileId, progress]) => (
        <div
          key={fileId}
          className="bg-white rounded-lg shadow-lg border border-gray-200 p-3"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              正在上传...
            </span>
            <button
              onClick={() => onClose(fileId)}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="mt-1 text-xs text-gray-500 text-center">
            {progress}%
          </div>
        </div>
      ))}
    </div>
  );
}