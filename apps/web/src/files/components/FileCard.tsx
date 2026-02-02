'use client';

import React from 'react';
import { FileItem } from '../../types/file';

interface FileCardProps {
  file: FileItem;
  isSelected: boolean;
  onFileSelect: (fileId: string, selected: boolean) => void;
  uploadProgress?: number;
}

export function FileCard({ file, isSelected, onFileSelect, uploadProgress }: FileCardProps) {
  const fileType = file.type;
  const fileExtension = file.storage_path.split('.').pop()?.toLowerCase() || '';

  return (
    <div
      className={`bg-white rounded-lg shadow-sm border p-4 cursor-pointer transition-all ${
        isSelected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 hover:shadow-md'
      }`}
      onClick={() => onFileSelect(file.id, !isSelected)}
    >
      {/* File Preview */}
      <div className="mb-3">
        {fileType === 'image' ? (
          <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${file.storage_path}`}
              alt={file.storage_path}
              className="w-full h-full object-cover"
            />
            {uploadProgress !== undefined && uploadProgress < 100 && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="text-white text-sm font-medium">
                  {uploadProgress}%
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
            <FileIcon fileExtension={fileExtension} />
          </div>
        )}
      </div>

      {/* File Info */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-900 truncate">
          {file.storage_path.split('/').pop()}
        </h3>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">
            {fileType === 'image' ? '图片' : fileType === 'video' ? '视频' : '文件'}
          </span>
          <span className="text-xs text-gray-400">
            {formatDate(file.created_at)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">
            {formatFileSize(getFileSize(file))}
          </span>
        </div>
      </div>

      {/* Selection Checkbox */}
      <div className="mt-2">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onFileSelect(file.id, isSelected)}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
      </div>
    </div>
  );
}

function FileIcon({ fileExtension }: { fileExtension: string }) {
  const iconClasses = "w-12 h-12 text-gray-400";

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
    case 'mp4':
    case 'avi':
    case 'mov':
      return (
        <svg className={iconClasses} fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
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