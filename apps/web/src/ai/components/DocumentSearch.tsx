'use client';

import { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { DocumentSearchResult } from '@/types/ai';
import { AIService, mockResponses } from '@/services/aiService';

interface DocumentSearchProps {
  userId: string;
  onClose: () => void;
  onSearchResults: (results: DocumentSearchResult[]) => void;
}

export function DocumentSearch({ userId, onClose, onSearchResults }: DocumentSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<DocumentSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      // Try to use real service, fallback to mock
      const accessToken = ''; // In real app, get from auth
      let searchResults;

      if (accessToken) {
        const response = await AIService.searchDocuments({
          query,
          limit: 10,
          userId,
        }, accessToken);
        searchResults = response.documents.map(doc => ({
          id: doc.id,
          title: doc.title,
          content: doc.content,
          similarity: doc.similarity,
        }));
      } else {
        // Use mock response
        const mockResponse = mockResponses.searchDocuments(query);
        searchResults = mockResponse.documents.map(doc => ({
          id: doc.id,
          title: doc.title,
          content: doc.content,
          similarity: doc.similarity,
        }));
      }

      setResults(searchResults);
      setHasSearched(true);
    } catch (error) {
      console.error('Error searching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUseResults = () => {
    if (results.length > 0) {
      onSearchResults(results);
    }
  };

  const handleQuickSearch = (preset: string) => {
    setQuery(preset);
  };

  const presetQueries = [
    '项目进展',
    '会议记录',
    '技术文档',
    '工作总结',
    '学习笔记',
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">📄 搜索文档</h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-4 border-b">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="输入搜索关键词..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button
              onClick={handleSearch}
              disabled={loading || !query.trim()}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '搜索中...' : '搜索'}
            </button>
          </div>

          {/* Quick Search */}
          <div className="mt-3">
            <p className="text-xs text-gray-500 mb-2">快速搜索：</p>
            <div className="flex flex-wrap gap-2">
              {presetQueries.map((preset, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickSearch(preset)}
                  className="px-3 py-1 text-xs text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          )}

          {!loading && hasSearched && results.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">没有找到相关文档</p>
              <p className="text-xs text-gray-400 mt-2">试试其他关键词？</p>
            </div>
          )}

          {!loading && results.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-600">找到 {results.length} 个相关文档</p>
                <button
                  onClick={handleUseResults}
                  className="px-3 py-1 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  使用这些结果
                </button>
              </div>

              {results.map((result, index) => (
                <div
                  key={index}
                  className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-gray-900 flex-1">{result.title}</h3>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full ml-2">
                      {(result.similarity * 100).toFixed(1)}%
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-3">{result.content}</p>
                  <div className="mt-2 flex items-center text-xs text-gray-500">
                    <span>文档 #{index + 1}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}