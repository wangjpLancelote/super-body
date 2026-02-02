'use client';

import { useState, useEffect } from 'react';
import { SparklesIcon, LightBulbIcon } from '@heroicons/react/24/outline';
import { Message } from '@/types/ai';

interface AIPoweredProps {
  message: string;
  onSuggestionSelect: (suggestion: string) => void;
}

interface AIPoweredSuggestion {
  id: string;
  text: string;
  type: 'question' | 'action' | 'insight';
  confidence: number;
}

export function AIPowered({ message, onSuggestionSelect }: AIPoweredProps) {
  const [suggestions, setSuggestions] = useState<AIPoweredSuggestion[]>([]);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    // Generate AI-powered suggestions based on message
    const generateSuggestions = () => {
      const baseSuggestions: AIPoweredSuggestion[] = [];

      if (message.trim()) {
        // Question suggestions
        if (message.includes('总结') || message.includes('分析')) {
          baseSuggestions.push({
            id: 'summarize-analysis',
            text: `分析"${message}"并提供详细总结`,
            type: 'question',
            confidence: 0.9,
          });
        }

        // Action suggestions
        if (message.includes('任务') || message.includes('待办')) {
          baseSuggestions.push({
            id: 'create-todo-action',
            text: `基于"${message}"创建待办事项`,
            type: 'action',
            confidence: 0.8,
          });
        }

        // Insight suggestions
        if (message.includes('趋势') || message.includes('分析')) {
          baseSuggestions.push({
            id: 'data-insight',
            text: `查看相关数据洞察`,
            type: 'insight',
            confidence: 0.7,
          });
        }

        // Generic suggestions
        baseSuggestions.push(
          {
            id: 'more-specific',
            text: `更具体地问：${message}具体指什么？`,
            type: 'question',
            confidence: 0.6,
          },
          {
            id: 'alternative',
            text: `换个角度：是否需要我从其他方面分析？`,
            type: 'insight',
            confidence: 0.5,
          }
        );
      }

      // Sort by confidence and take top 3
      return baseSuggestions
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 3);
    };

    if (message.length > 2) {
      const newSuggestions = generateSuggestions();
      setSuggestions(newSuggestions);
      setIsActive(newSuggestions.length > 0);
    } else {
      setSuggestions([]);
      setIsActive(false);
    }
  }, [message]);

  const handleSuggestionClick = (suggestion: AIPoweredSuggestion) => {
    onSuggestionSelect(suggestion.text);
    setIsActive(false);
  };

  const getIconByType = (type: AIPoweredSuggestion['type']) => {
    switch (type) {
      case 'question':
        return <LightBulbIcon className="w-4 h-4 text-blue-500" />;
      case 'action':
        return <SparklesIcon className="w-4 h-4 text-green-500" />;
      case 'insight':
        return <LightBulbIcon className="w-4 h-4 text-purple-500" />;
      default:
        return <SparklesIcon className="w-4 h-4 text-gray-500" />;
    }
  };

  const getColorByType = (type: AIPoweredSuggestion['type']) => {
    switch (type) {
      case 'question':
        return 'border-blue-200 bg-blue-50 hover:bg-blue-100';
      case 'action':
        return 'border-green-200 bg-green-50 hover:bg-green-100';
      case 'insight':
        return 'border-purple-200 bg-purple-50 hover:bg-purple-100';
      default:
        return 'border-gray-200 bg-gray-50 hover:bg-gray-100';
    }
  };

  if (!isActive || suggestions.length === 0) {
    return null;
  }

  return (
    <div className="mt-3 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <SparklesIcon className="w-5 h-5 text-yellow-500" />
        <h3 className="text-sm font-medium text-gray-900">AI 智能建议</h3>
      </div>

      <div className="space-y-2">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion.id}
            onClick={() => handleSuggestionClick(suggestion)}
            className={`w-full flex items-start gap-3 p-3 rounded-lg border transition-colors text-left ${getColorByType(suggestion.type)}`}
          >
            <div className="flex-shrink-0 mt-0.5">
              {getIconByType(suggestion.type)}
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-900">{suggestion.text}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-gray-500">置信度</span>
                <div className="flex-1 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-blue-500 h-1.5 rounded-full transition-all"
                    style={{ width: `${suggestion.confidence * 100}%` }}
                  ></div>
                </div>
                <span className="text-xs text-gray-500">
                  {(suggestion.confidence * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-3 pt-3 border-t border-gray-100">
        <button
          onClick={() => setIsActive(false)}
          className="text-xs text-gray-500 hover:text-gray-700"
        >
          ✨ 关闭智能建议
        </button>
      </div>
    </div>
  );
}