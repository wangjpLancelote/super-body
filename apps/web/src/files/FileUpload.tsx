'use client';

import React, { useState, useCallback, useRef } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { SupabaseClient } from '../lib/supabase';
import { FileItem, FileType, FileFormData } from '../types/file';
import { detectFileType } from '../lib/fileUtils';

interface FileUploadProps {
  onUploadComplete: () => void;
  onProgress: (fileId: string, progress: number) => void;
  onComplete: (fileId: string) => void;
}

export function FileUpload({ onUploadComplete, onProgress, onComplete }: FileUploadProps) {
  const { user } = useAuth();
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const supabase = getSupabaseBrowserClient();

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }, []);

  const handleFileSelect = useCallback(() => {
    if (fileInputRef.current?.files) {
      handleFiles(fileInputRef.current.files);
    }
  }, []);

  const handleFiles = async (files: FileList) => {
    if (!user || uploading) return;

    setUploading(true);

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const fileId = crypto.randomUUID();
        const fileType = detectFileType(file);

        // Create file record first
        const fileData: Omit<FileItem, 'created_at' | 'updated_at'> = {
          id: fileId,
          user_id: user.id,
          type: fileType,
          storage_path: `files/${user.id}/${fileId}/${file.name}`,
        };

        const { error: insertError } = await supabase
          .from('files')
          .insert([fileData]);

        if (insertError) {
          console.error('Error creating file record:', insertError);
          return;
        }

        // Upload file to storage
        const { error: uploadError } = await supabase.storage
          .from('files')
          .upload(fileData.storage_path, file, {
            contentType: file.type,
            onUploadProgress: (progress) => {
              const percentage = Math.round((progress.loaded / progress.total) * 100);
              onProgress(fileId, percentage);
            },
          });

        if (uploadError) {
          console.error('Error uploading file:', uploadError);
          await supabase.from('files').delete().eq('id', fileId);
          return;
        }

        onComplete(fileId);
      });

      await Promise.all(uploadPromises);
      onUploadComplete();
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileSelect}
          disabled={uploading}
        />

        <div className="space-y-2">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
            aria-hidden="true"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <p className="text-lg text-gray-600">
            {uploading ? '上传中...' : '拖拽文件到此处或点击上传'}
          </p>
          <p className="text-sm text-gray-500">
            支持图片、视频、PDF等多种格式
          </p>
        </div>
      </div>

      <div className="text-xs text-gray-500">
        <p>• 支持多文件同时上传</p>
        <p>• 单个文件最大 10MB</p>
        <p>• 文件将存储在您的个人空间</p>
      </div>
    </div>
  );
}

function getSupabaseBrowserClient(): SupabaseClient {
  const { createSupabaseClient } = require('../lib/supabase');
  return createSupabaseClient();
}