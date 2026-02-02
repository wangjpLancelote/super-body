'use client';

import { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  className?: string;
}

export function SearchBar({ placeholder = "搜索文档、任务、联系人...", onSearch, className = "" }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const router = useRouter();

  // Handle search on Enter key
  const handleSearch = (searchQuery: string = query) => {
    if (!searchQuery.trim()) return;

    // If onSearch prop is provided, use it
    if (onSearch) {
      onSearch(searchQuery);
    } else {
      // Otherwise, navigate to search results page
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }

    setShowSuggestions(false);
    setQuery('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const clearQuery = () => {
    setQuery('');
    setShowSuggestions(false);
  };

  // Auto-hide suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (event.target instanceof Element) {
        if (!event.target.closest('.search-container')) {
          setShowSuggestions(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`search-container relative ${className}`}>
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pl-10"
        />
        {query && (
          <button
            onClick={clearQuery}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        )}
        <button
          onClick={() => handleSearch()}
          className="absolute right-12 top-1/2 transform -translate-y-1/2 px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          disabled={!query.trim()}
        >
          搜索
        </button>
      </div>

      {/* Search Suggestions */}
      {showSuggestions && query && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-64 overflow-y-auto">
          {/* Quick Search Categories */}
          <div className="p-2">
            <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
              快速搜索
            </div>
            <div className="space-y-1 p-2">
              {[
                { text: `文档中包含 "${query}"`, type: 'documents', action: () => handleSearch(`${query} 文档`) },
                { text: `任务包含 "${query}"`, type: 'tasks', action: () => handleSearch(`${query} 任务`) },
                { text: `分析 "${query}"`, type: 'analysis', action: () => handleSearch(`分析 ${query}`) },
              ].map((item, index) => (
                <button
                  key={index}
                  onClick={item.action}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">
                      {item.type === 'documents' && '📄'}
                      {item.type === 'tasks' && '📋'}
                      {item.type === 'analysis' && '📊'}
                    </span>
                    {item.text}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200"></div>

          {/* AI Suggestions */}
          <div className="p-2">
            <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
              AI 智能建议
            </div>
            <div className="space-y-1 p-2">
              {[
                `关于 ${query} 的详细分析`,
                `${query} 相关的工作计划`,
                `如何优化 ${query} 的流程`,
              ].map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSearch(suggestion)}
                  className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-blue-500">💡</span>
                    {suggestion}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}