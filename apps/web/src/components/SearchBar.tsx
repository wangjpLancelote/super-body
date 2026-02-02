'use client';

import { useState, useEffect, useRef } from 'react';
import { MagnifyingGlassIcon, XMarkIcon, FunnelIcon, ClockIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { searchDocuments } from '@/services/aiService';

interface AdvancedSearchParams {
  query: string;
  type?: 'all' | 'documents' | 'tasks' | 'files';
  dateRange?: {
    start: string;
    end: string;
  };
  tags?: string[];
  status?: string[];
  priority?: string[];
  size?: string[];
}

interface SearchHistoryItem {
  id: string;
  query: string;
  type: 'all' | 'documents' | 'tasks' | 'files';
  timestamp: string;
}

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (params: AdvancedSearchParams) => void;
  className?: string;
}

export function SearchBar({ placeholder = "搜索文档、任务、联系人...", onSearch, className = "" }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchType, setSearchType] = useState<'all' | 'documents' | 'tasks' | 'files'>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const handleSearch = (searchParams: AdvancedSearchParams = { query, type: searchType }) => {
    if (!searchParams.query.trim()) return;

    // Add date range if provided
    if (startDate && endDate) {
      searchParams.dateRange = { start: startDate, end: endDate };
    }

    // Add tags if selected
    if (selectedTags.length > 0) {
      searchParams.tags = selectedTags;
    }

    // If onSearch prop is provided, use it
    if (onSearch) {
      onSearch(searchParams);
    } else {
      // Otherwise, navigate to search results page with params
      const params = new URLSearchParams();
      params.set('q', searchParams.query);
      if (searchParams.type && searchParams.type !== 'all') {
        params.set('type', searchParams.type);
      }
      if (searchParams.dateRange) {
        params.set('start', searchParams.dateRange.start);
        params.set('end', searchParams.dateRange.end);
      }
      if (searchParams.tags && searchParams.tags.length > 0) {
        params.set('tags', searchParams.tags.join(','));
      }

      router.push(`/search?${params.toString()}`);
    }

    setShowSuggestions(false);
    setQuery('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const clearFilters = () => {
    setStartDate('');
    setEndDate('');
    setSelectedTags([]);
  };

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
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
          className="w-full pl-10 pr-20 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
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

        <button
          onClick={() => setShowFilters(!showFilters)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
          title="高级筛选"
        >
          <FunnelIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-4 max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-900">高级筛选</h3>
              <button
                onClick={clearFilters}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                清除筛选
              </button>
            </div>

            {/* Search Type Filter */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">搜索类型</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'all', label: '全部' },
                  { value: 'documents', label: '文档' },
                  { value: 'tasks', label: '任务' },
                  { value: 'files', label: '文件' },
                ].map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setSearchType(type.value as any)}
                    className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                      searchType === type.value
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Date Range Filter */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">日期范围</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  placeholder="开始日期"
                />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  placeholder="结束日期"
                />
              </div>
            </div>

            {/* Tags Filter */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">标签</label>
              <div className="flex flex-wrap gap-2">
                {availableTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1 text-sm rounded-full transition-colors ${
                      selectedTags.includes(tag)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
              {selectedTags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {selectedTags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
                    >
                      {tag}
                      <button
                        onClick={() => toggleTag(tag)}
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Apply Filters Button */}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowFilters(false)}
                className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => {
                  handleSearch();
                  setShowFilters(false);
                }}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                应用筛选
              </button>
            </div>
          </div>
        </div>
      )}

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
                { text: `文档中包含 "${query}"`, type: 'documents', action: () => handleSearch({ query, type: 'documents' }) },
                { text: `任务包含 "${query}"`, type: 'tasks', action: () => handleSearch({ query, type: 'tasks' }) },
                { text: `文件包含 "${query}"`, type: 'files', action: () => handleSearch({ query, type: 'files' }) },
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
                      {item.type === 'files' && '📁'}
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
                  onClick={() => handleSearch({ query: suggestion })}
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