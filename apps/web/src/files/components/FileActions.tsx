'use client';

import React, { useState } from 'react';
import { FileItem } from '../../types/file';
import { useAuth } from '../../auth/AuthProvider';
import { SupabaseClient } from '../../lib/supabase';
import { Dropdown } from '@headlessui/react';

interface FileActionsProps {
  file: FileItem;
  onDelete: (fileId: string) => void;
  onDownload: (file: FileItem) => void;
  onShare: (file: FileItem) => void;
}

export function FileActions({ file, onDelete, onDownload, onShare }: FileActionsProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { user } = useAuth();

  const supabase = getSupabaseBrowserClient();

  const handleDelete = async () => {
    if (!user) return;

    try {
      // Delete from storage first
      await supabase.storage
        .from('files')
        .remove([file.storage_path]);

      // Delete from database
      await supabase
        .from('files')
        .delete()
        .eq('id', file.id);

      onDelete(file.id);
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  const handleDownload = () => {
    onDownload(file);
  };

  const handleShare = () => {
    onShare(file);
  };

  const fileExtension = file.storage_path.split('.').pop()?.toLowerCase() || '';
  const isVideo = file.type === 'video' || ['mp4', 'webm', 'ogg', 'avi', 'mov'].includes(fileExtension);

  return (
    <Dropdown>
      <div className="relative">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="p-1 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
            />
          </svg>
        </button>

        <Transition
          show={isDropdownOpen}
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Dropdown.Menu className="absolute right-0 z-10 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 focus:outline-none">
            <Dropdown.Item
              as="button"
              onClick={handleDownload}
              className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              下载
            </Dropdown.Item>

            <Dropdown.Item
              as="button"
              onClick={handleShare}
              className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m9.032 4.026a9.001 9.001 0 010-5.684m-9.032 5.684a9.001 9.001 0 010-5.684"
                />
              </svg>
              分享
            </Dropdown.Item>

            <Dropdown.Divider className="my-1 border-gray-200" />

            <Dropdown.Item
              as="button"
              onClick={handleDelete}
              className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              删除
            </Dropdown.Item>
          </Dropdown.Menu>
        </Transition>
      </div>
    </Dropdown>
  );
}

function getSupabaseBrowserClient(): SupabaseClient {
  const { createSupabaseClient } = require('../../lib/supabase');
  return createSupabaseClient();
}