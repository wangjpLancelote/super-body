'use client';

import React from 'react';
import { FileItem } from '../../types/file';
import { FileItemComponent } from './FileItem';

interface FileGridProps {
  files: FileItem[];
  selectedFiles: string[];
  onFileSelect: (fileId: string, selected: boolean) => void;
  onDelete: (fileId: string) => void;
  onDownload: (file: FileItem) => void;
  onShare: (file: FileItem) => void;
  loading: boolean;
  uploadProgress: { [key: string]: number };
}

export function FileGrid({ files, selectedFiles, onFileSelect, onDelete, onDownload, onShare, loading, uploadProgress }: FileGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="bg-gray-200 aspect-square rounded-lg mb-2"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="text-center py-12">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">暂无文件</h3>
        <p className="mt-1 text-sm text-gray-500">开始上传您的第一个文件</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {files.map((file) => (
        <FileItemComponent
          key={file.id}
          file={file}
          isSelected={selectedFiles.includes(file.id)}
          onFileSelect={onFileSelect}
          onDelete={onDelete}
          onDownload={onDownload}
          onShare={onShare}
          uploadProgress={uploadProgress[file.id]}
        />
      ))}
    </div>
  );
}