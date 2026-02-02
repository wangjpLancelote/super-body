'use client';

import { useState } from 'react';
import { XMarkIcon, CheckCircleIcon, AlertCircleIcon } from '@heroicons/react/24/outline';
import { AIAction } from '@/types/ai';

interface AIActionsProps {
  userId: string;
  onClose: () => void;
  onAction: (action: string, data?: any) => void;
}

export function AIActions({ userId, onClose, onAction }: AIActionsProps) {
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [actionData, setActionData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const actionSuggestions: AIAction[] = [
    {
      id: 'create-weekly-goals',
      title: '创建本周目标',
      description: '基于你的工作进度创建本周的 SMART 目标',
      type: 'create-todo',
      parameters: {
        title: '本周目标',
        description: '基于上周进展制定的本周工作目标',
        due_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
    },
    {
      id: 'review-pending-tasks',
      title: '审查待办任务',
      description: '查看所有待处理任务并优先级排序',
      type: 'search-documents',
      parameters: {
        query: '待办事项',
        limit: 10,
      },
    },
    {
      id: 'analyze-productivity',
      title: '生产力分析',
      description: '分析最近两周的任务完成情况',
      type: 'analyze-data',
      parameters: {
        date_range: '2_weeks',
        metrics: ['completion_rate', 'time_spent', 'category_breakdown'],
      },
    },
    {
      id: 'generate-summary',
      title: '生成工作总结',
      description: '自动生成本周工作总结报告',
      type: 'generate-report',
      parameters: {
        period: 'week',
        format: 'markdown',
      },
    },
  ];

  const handleExecuteAction = async (action: AIAction) => {
    setSelectedAction(action.id);
    setLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      setActionData({
        success: true,
        action: action.type,
        executedAt: new Date().toISOString(),
        message: `成功执行：${action.title}`,
      });

      onAction(action.id, action.parameters);

      // Reset after a delay
      setTimeout(() => {
        setSelectedAction(null);
        setActionData(null);
        onClose();
      }, 2000);

    } catch (error) {
      setActionData({
        success: false,
        action: action.type,
        error: '执行失败，请重试',
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePreviewAction = (action: AIAction) => {
    setActionData({
      success: true,
      action: action.type,
      preview: `将执行：${action.title}`,
      parameters: action.parameters,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">🎯 AI 建议</h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {!selectedAction ? (
            /* Action Selection */
            <div className="p-4">
              <p className="text-sm text-gray-600 mb-4">
                基于你的使用历史，AI 为你推荐以下操作：
              </p>
              <div className="space-y-3">
                {actionSuggestions.map((action) => (
                  <div
                    key={action.id}
                    className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all cursor-pointer"
                    onClick={() => handlePreviewAction(action)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <CheckCircleIcon className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 mb-1">{action.title}</h3>
                        <p className="text-sm text-gray-600">{action.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Additional Options */}
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-900 mb-3">其他操作</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      const customAction: AIAction = {
                        id: 'custom-create-todo',
                        title: '自定义创建任务',
                        description: '创建自定义待办事项',
                        type: 'create-todo',
                      };
                      handlePreviewAction(customAction);
                    }}
                    className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors text-left"
                  >
                    <p className="text-sm font-medium text-gray-900">✏️ 自定义任务</p>
                    <p className="text-xs text-gray-600 mt-1">创建自定义待办事项</p>
                  </button>
                  <button
                    onClick={() => {
                      const customAction: AIAction = {
                        id: 'bulk-update',
                        title: '批量更新',
                        description: '批量更新多个任务状态',
                        type: 'create-todo',
                      };
                      handlePreviewAction(customAction);
                    }}
                    className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors text-left"
                  >
                    <p className="text-sm font-medium text-gray-900">🔄 批量更新</p>
                    <p className="text-xs text-gray-600 mt-1">批量更新任务状态</p>
                  </button>
                </div>
              </div>
            </div>
          ) : actionData && !actionData.success ? (
            /* Error State */
            <div className="p-6 text-center">
              <AlertCircleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">执行失败</h3>
              <p className="text-gray-600 mb-4">{actionData.error}</p>
              <button
                onClick={() => {
                  setSelectedAction(null);
                  setActionData(null);
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                重新选择
              </button>
            </div>
          ) : actionData && actionData.preview ? (
            /* Preview State */
            <div className="p-4">
              <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-medium text-blue-900 mb-2">📋 预览操作</h3>
                <p className="text-blue-800 text-sm">{actionData.preview}</p>
              </div>

              {actionData.parameters && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">参数详情：</h4>
                  <pre className="text-xs text-gray-600 bg-gray-50 p-3 rounded-lg overflow-x-auto">
                    {JSON.stringify(actionData.parameters, null, 2)}
                  </pre>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => handleExecuteAction(actionSuggestions.find(a => a.id === selectedAction)!)}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? '执行中...' : '确认执行'}
                </button>
                <button
                  onClick={() => {
                    setSelectedAction(null);
                    setActionData(null);
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  取消
                </button>
              </div>
            </div>
          ) : (
            /* Success State */
            <div className="p-6 text-center">
              <CheckCircleIcon className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">操作成功</h3>
              <p className="text-gray-600">{actionData?.message}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}