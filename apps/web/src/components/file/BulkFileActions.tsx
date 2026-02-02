'use client';

import React from 'react';

interface BulkFileActionsProps {
  selectedCount: number;
  onDelete: () => void;
  onClearSelection: () => void;
}

export function BulkFileActions({ selectedCount, onDelete, onClearSelection }: BulkFileActionsProps) {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
      <div className="flex items-center">
        <span className="text-blue-800 font-medium">
          已选择 {selectedCount} 个文件
        </span>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onDelete}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
          删除选中
        </button>

        <button
          onClick={onClearSelection}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
        >
          取消选择
        </button>
      </div>
    </div>
  );
}