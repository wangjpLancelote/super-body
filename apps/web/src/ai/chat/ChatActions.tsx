'use client';

import { useState } from 'react';
import {
  SparklesIcon,
  DocumentTextIcon,
  PlusCircleIcon,
  ChartBarIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

interface ChatActionsProps {
  onAction: (action: string, data?: any) => void;
}

export function ChatActions({ onAction }: ChatActionsProps) {
  const [isOpen, setIsOpen] = useState(false);

  const actionItems = [
    {
      id: 'summarize-docs',
      title: '总结文档',
      description: '自动总结最近的重要文档',
      icon: DocumentTextIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      id: 'create-todo',
      title: '创建任务',
      description: '基于对话创建新的待办事项',
      icon: PlusCircleIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      id: 'analyze-trends',
      title: '分析趋势',
      description: '分析我的任务完成趋势',
      icon: ChartBarIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      id: 'schedule-review',
      title: '安排回顾',
      description: '安排本周工作回顾',
      icon: ClockIcon,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ];

  const handleActionClick = (actionId: string, title: string) => {
    onAction(actionId, { title });
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <SparklesIcon className="w-4 h-4" />
        AI 快捷操作
        <svg
          className={`w-4 h-4 transform transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">AI 推荐操作</h3>
            <div className="space-y-2">
              {actionItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleActionClick(item.id, item.title)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  <div className={`p-2 rounded-lg ${item.bgColor}`}>
                    <item.icon className={`w-5 h-5 ${item.color}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{item.title}</p>
                    <p className="text-xs text-gray-500">{item.description}</p>
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