'use client';

import React from 'react';

interface FileSortProps {
  sortBy: 'created_at' | 'name' | 'type';
  sortOrder: 'asc' | 'desc';
  onSortChange: (sortBy: 'created_at' | 'name' | 'type', sortOrder: 'asc' | 'desc') => void;
}

export function FileSort({ sortBy, sortOrder, onSortChange }: FileSortProps) {
  const handleSortChange = (newSortBy: 'created_at' | 'name' | 'type') => {
    if (sortBy === newSortBy) {
      // Toggle order if same sort field
      const newSortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
      onSortChange(newSortBy, newSortOrder);
    } else {
      // New sort field, default to descending
      onSortChange(newSortBy, 'desc');
    }
  };

  const sortOptions = [
    {
      value: 'created_at' as const,
      label: '按时间',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    {
      value: 'name' as const,
      label: '按名称',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      ),
    },
    {
      value: 'type' as const,
      label: '按类型',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
          />
        </svg>
      ),
    },
  ];

  return (
    <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg p-1">
      {sortOptions.map((option) => (
        <button
          key={option.value}
          onClick={() => handleSortChange(option.value)}
          className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            sortBy === option.value
              ? 'bg-blue-100 text-blue-700'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          {option.icon}
          {option.label}
          {sortBy === option.value && (
            <svg
              className={`w-4 h-4 ${
                sortOrder === 'asc' ? 'rotate-180' : ''
              }`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </button>
      ))}
    </div>
  );
}