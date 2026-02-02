'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  DocumentTextIcon,
  CheckCircleIcon,
  ClockIcon,
  AlertCircleIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { searchDocuments } from '@/ai/vector';

interface SearchResult {
  id: string;
  title: string;
  content: string;
  similarity: number;
  type: 'document' | 'todo' | 'analysis';
}

interface SearchResultsProps {
  query?: string;
  className?: string;
}

export function SearchResults({ query, className = "" }: SearchResultsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(query || searchParams.get('q') || '');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'documents' | 'tasks' | 'analysis'>('all');

  useEffect(() => {
    if (query) {
      setSearchTerm(query);
    }
  }, [query]);

  const performSearch = async (term: string) => {
    if (!term.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      // Simulate search results
      await new Promise(resolve => setTimeout(resolve, 500));

      // Mock search results for different types
      const mockResults: SearchResult[] = [];

      // Document results
      if (activeTab === 'all' || activeTab === 'documents') {
        mockResults.push(
          {
            id: `doc-${Date.now()}-1`,
            title: `${term}相关项目文档`,
            content: `这是关于${term}的详细项目文档，包含了技术规范、实施计划和注意事项。文档涵盖了多个方面，包括架构设计、开发流程和质量保证等内容。`,
            similarity: 0.95,
            type: 'document',
          },
          {
            id: `doc-${Date.now()}-2`,
            title: `${term}技术报告`,
            content: `技术报告详细分析了${term}的实现方案，包括技术选型、性能优化和未来发展方向。报告提供了具体的数据支持和代码示例。`,
            similarity: 0.88,
            type: 'document',
          }
        );
      }

      // Todo results
      if (activeTab === 'all' || activeTab === 'tasks') {
        mockResults.push(
          {
            id: `todo-${Date.now()}`,
            title: `完成${term}相关任务`,
            content: '任务描述：需要在本周完成相关功能的开发和测试工作',
            similarity: 0.92,
            type: 'todo',
          }
        );
      }

      // Analysis results
      if (activeTab === 'all' || activeTab === 'analysis') {
        mockResults.push(
          {
            id: `analysis-${Date.now()}`,
            title: `${term}数据分析报告`,
            content: `通过分析${term}相关的数据，我们发现了一些关键趋势和模式。这些洞察可以帮助我们更好地理解当前状况并制定改进计划。`,
            similarity: 0.85,
            type: 'analysis',
          }
        );
      }

      // Sort by similarity
      const sortedResults = mockResults.sort((a, b) => b.similarity - a.similarity);
      setResults(sortedResults);
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchTerm) {
      performSearch(searchTerm);
    }
  }, [searchTerm, activeTab]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    router.push(`/search?q=${encodeURIComponent(term)}`);
  };

  const getResultIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'document':
        return <DocumentTextIcon className="w-5 h-5 text-blue-500" />;
      case 'todo':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'analysis':
        return <SparklesIcon className="w-5 h-5 text-purple-500" />;
      default:
        return <DocumentTextIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (type: SearchResult['type']) => {
    switch (type) {
      case 'document':
        return (
          <span className="px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-full">
            文档
          </span>
        );
      case 'todo':
        return (
          <span className="px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">
            任务
          </span>
        );
      case 'analysis':
        return (
          <span className="px-2 py-1 text-xs font-medium text-purple-700 bg-purple-100 rounded-full">
            分析
          </span>
        );
      default:
        return null;
    }
  };

  if (!searchTerm) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <DocumentTextIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">开始搜索</h3>
        <p className="text-gray-600">输入关键词来搜索文档、任务和分析结果</p>
      </div>
    );
  }

  return (
    <div className={`max-w-4xl mx-auto ${className}`}>
      {/* Search Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">搜索结果</h2>
        <p className="text-gray-600">找到 {results.length} 个相关结果</p>
      </div>

      {/* Search Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {[
            { key: 'all', label: '全部', count: results.length },
            { key: 'documents', label: '文档', count: results.filter(r => r.type === 'document').length },
            { key: 'tasks', label: '任务', count: results.filter(r => r.type === 'todo').length },
            { key: 'analysis', label: '分析', count: results.filter(r => r.type === 'analysis').length },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
              <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                {tab.count}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      )}

      {/* Results */}
      {!loading && results.length === 0 && (
        <div className="text-center py-12">
          <AlertCircleIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">未找到相关结果</h3>
          <p className="text-gray-600 mb-4">试试其他关键词或调整搜索条件</p>
          <button
            onClick={() => handleSearch('')}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            清除搜索
          </button>
        </div>
      )}

      {!loading && results.length > 0 && (
        <div className="space-y-4">
          {results.map((result) => (
            <div
              key={result.id}
              className="p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer"
              onClick={() => {
                if (result.type === 'todo') {
                  router.push(`/todos/${result.id}`);
                } else if (result.type === 'document') {
                  router.push(`/documents/${result.id}`);
                } else {
                  // Handle analysis results
                  console.log('Show analysis:', result.id);
                }
              }}
            >
              <div className="flex items-start gap-3">
                {getResultIcon(result.type)}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-gray-900">{result.title}</h3>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(result.type)}
                      <span className="text-xs text-gray-500">
                        {(result.similarity * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-3 mb-3">
                    {result.content}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>点击查看详情</span>
                      {result.type === 'document' && <span>📄 文档</span>}
                      {result.type === 'todo' && <span>📋 任务</span>}
                      {result.type === 'analysis' && <span>📊 分析</span>}
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date().toLocaleDateString('zh-CN')}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Load More */}
          <div className="text-center py-4">
            <button
              onClick={() => {
                // Simulate loading more results
                const moreResults: SearchResult[] = [
                  {
                    id: `doc-${Date.now()}-3`,
                    title: `${searchTerm} 相关项目资料`,
                    content: '这是另一个相关的文档资料...',
                    similarity: 0.78,
                    type: 'document',
                  }
                ];
                setResults(prev => [...prev, ...moreResults]);
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              加载更多结果
            </button>
          </div>
        </div>
      )}
    </div>
  );
}