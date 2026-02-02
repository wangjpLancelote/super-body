'use client';

import React from 'react';
import { FileItem } from '../types/file';

interface FileGalleryProps {
  files: FileItem[];
  selectedFiles: string[];
  onFileSelect: (fileId: string, selected: boolean) => void;
  loading: boolean;
  uploadProgress: { [key: string]: number };
}

export function FileGallery({ files, selectedFiles, onFileSelect, loading, uploadProgress }: FileGalleryProps) {
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
        <FileItem
          key={file.id}
          file={file}
          isSelected={selectedFiles.includes(file.id)}
          onFileSelect={onFileSelect}
          uploadProgress={uploadProgress[file.id]}
        />
      ))}
    </div>
  );
}

// FileItem component
interface FileItemProps {
  file: FileItem;
  isSelected: boolean;
  onFileSelect: (fileId: string, selected: boolean) => void;
  uploadProgress?: number;
}

function FileItem({ file, isSelected, onFileSelect, uploadProgress }: FileItemProps) {
  const fileType = file.type;
  const fileExtension = file.storage_path.split('.').pop()?.toLowerCase() || '';

  return (
    <div
      className={`bg-white rounded-lg shadow-sm border ${
        isSelected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'
      } overflow-hidden transition-all hover:shadow-md`}
    >
      {/* File Preview */}
      <div className="relative aspect-square bg-gray-100">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => onFileSelect(file.id, e.target.checked)}
          className="absolute top-2 left-2 z-10 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />

        {fileType === 'image' ? (
          <img
            src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${file.storage_path}`}
            alt={file.storage_path}
            className="w-full h-full object-cover"
          />
        ) : fileType === 'video' ? (
          <video
            src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${file.storage_path}`}
            className="w-full h-full object-cover"
            muted
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FileIcon fileExtension={fileExtension} />
          </div>
        )}

        {uploadProgress !== undefined && uploadProgress < 100 && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="text-white text-sm font-medium">
              {uploadProgress}%
            </div>
          </div>
        )}
      </div>

      {/* File Info */}
      <div className="p-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium text-gray-900 truncate">
            {file.storage_path.split('/').pop()}
          </span>
          <span className="text-xs text-gray-500">
            {formatFileSize(getFileSize(file))}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">
            {fileType === 'image' ? '图片' : fileType === 'video' ? '视频' : '文件'}
          </span>
          <span className="text-xs text-gray-400">
            {formatDate(file.created_at)}
          </span>
        </div>
      </div>
    </div>
  );
}

function FileIcon({ fileExtension }: { fileExtension: string }) {
  const iconClasses = "w-16 h-16 text-gray-400";

  switch (fileExtension) {
    case 'pdf':
      return (
        <svg className={iconClasses} fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
            clipRule="evenodd"
          />
        </svg>
      );
    case 'doc':
    case 'docx':
      return (
        <svg className={iconClasses} fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
            clipRule="evenodd"
          />
        </svg>
      );
    case 'xls':
    case 'xlsx':
      return (
        <svg className={iconClasses} fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
            clipRule="evenodd"
          />
        </svg>
      );
    default:
      return (
        <svg className={iconClasses} fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
            clipRule="evenodd"
          />
        </svg>
      );
  }
}

function getFileSize(file: FileItem): number {
  // This should be implemented based on your actual data structure
  // For now, return a placeholder value
  return Math.random() * 10000000; // Random size between 0 and 10MB
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return '今天';
  if (days === 1) return '昨天';
  if (days < 7) return `${days}天前`;
  if (days < 30) return `${Math.floor(days / 7)}周前`;
  if (days < 365) return `${Math.floor(days / 30)}月前`;
  return `${Math.floor(days / 365)}年前`;
}