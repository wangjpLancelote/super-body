'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { SupabaseClient } from '../lib/supabase';
import { FileItem, FileType } from '../types/file';
import { FileGallery } from './FileGallery';
import { FileUpload } from './FileUpload';
import { SearchFiles } from '../components/file/SearchFiles';
import { BulkFileActions } from '../components/file/BulkFileActions';
import { FileSort } from '../components/file/FileSort';
import { UploadProgress } from '../components/file/UploadProgress';

export default function FilesPage() {
  const { user } = useAuth();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'created_at' | 'name' | 'type'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [loading, setLoading] = useState(true);

  const supabase = getSupabaseBrowserClient();

  // Load files from Supabase
  const loadFiles = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('files')
        .select('*')
        .eq('user_id', user.id)
        .order(sortBy, { ascending: sortOrder === 'asc' });

      if (error) throw error;
      setFiles(data || []);
    } catch (error) {
      console.error('Error loading files:', error);
    } finally {
      setLoading(false);
    }
  }, [user, sortBy, sortOrder, supabase]);

  // Setup Realtime subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('file-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'files',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('File change:', payload);
          loadFiles();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, supabase, loadFiles]);

  // Initial load
  useEffect(() => {
    if (user) {
      loadFiles();
    }
  }, [user, loadFiles]);

  const handleFileSelect = (fileId: string, selected: boolean) => {
    if (selected) {
      setSelectedFiles([...selectedFiles, fileId]);
    } else {
      setSelectedFiles(selectedFiles.filter(id => id !== fileId));
    }
  };

  const handleBulkSelect = (selected: boolean) => {
    if (selected) {
      setSelectedFiles(files.map(f => f.id));
    } else {
      setSelectedFiles([]);
    }
  };

  const handleDeleteSelected = async () => {
    if (!user || selectedFiles.length === 0) return;

    try {
      // Delete from storage first
      for (const fileId of selectedFiles) {
        const file = files.find(f => f.id === fileId);
        if (file) {
          await supabase.storage
            .from('files')
            .remove([file.storage_path]);
        }
      }

      // Delete from database
      const { error } = await supabase
        .from('files')
        .delete()
        .in('id', selectedFiles);

      if (error) throw error;

      setSelectedFiles([]);
      loadFiles();
    } catch (error) {
      console.error('Error deleting files:', error);
    }
  };

  const handleUploadProgress = (fileId: string, progress: number) => {
    setUploadProgress(prev => ({ ...prev, [fileId]: progress }));
  };

  const clearUploadProgress = (fileId: string) => {
    setUploadProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[fileId];
      return newProgress;
    });
  };

  // Filter files based on search term
  const filteredFiles = files.filter(file => {
    if (!searchTerm) return true;
    return file.storage_path.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">文件管理</h1>

        {/* Upload Section */}
        <div className="mb-8">
          <FileUpload
            onUploadComplete={loadFiles}
            onProgress={handleUploadProgress}
            onComplete={clearUploadProgress}
          />
        </div>

        {/* Search and Sort Controls */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <SearchFiles
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />
          <FileSort
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSortChange={setSort}
          />
        </div>

        {/* Bulk Actions */}
        {selectedFiles.length > 0 && (
          <BulkFileActions
            selectedCount={selectedFiles.length}
            onDelete={handleDeleteSelected}
            onClearSelection={() => setSelectedFiles([])}
          />
        )}

        {/* File Gallery */}
        <div className="mt-6">
          <FileGallery
            files={filteredFiles}
            selectedFiles={selectedFiles}
            onFileSelect={handleFileSelect}
            loading={loading}
            uploadProgress={uploadProgress}
          />
        </div>
      </div>

      {/* Upload Progress Indicators */}
      {Object.keys(uploadProgress).length > 0 && (
        <UploadProgress
          progress={uploadProgress}
          onClose={clearUploadProgress}
        />
      )}
    </div>
  );
}

function getSupabaseBrowserClient(): SupabaseClient {
  const { createSupabaseClient } = require('../lib/supabase');
  return createSupabaseClient();
}