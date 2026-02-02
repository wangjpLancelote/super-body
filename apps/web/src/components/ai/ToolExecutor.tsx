'use client';

import { useState } from 'react';
import { CheckCircleIcon, XMarkIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

interface ToolExecutorProps {
  onToolExecute: (toolName: string, params: any) => Promise<any>;
}

interface ToolState {
  status: 'idle' | 'executing' | 'success' | 'error';
  message: string;
  result?: any;
}

export function ToolExecutor({ onToolExecute }: ToolExecutorProps) {
  const [toolState, setToolState] = useState<ToolState>({
    status: 'idle',
    message: '',
  });

  const executeTool = async (toolName: string, params: any) => {
    setToolState({
      status: 'executing',
      message: `正在执行 ${toolName}...`,
    });

    try {
      const result = await onToolExecute(toolName, params);
      setToolState({
        status: 'success',
        message: `${toolName} 执行成功！`,
        result,
      });

      // Auto reset after 3 seconds
      setTimeout(() => {
        setToolState({ status: 'idle', message: '' });
      }, 3000);
    } catch (error) {
      setToolState({
        status: 'error',
        message: `${toolName} 执行失败：${error instanceof Error ? error.message : '未知错误'}`,
      });
    }
  };

  const renderToolResult = () => {
    switch (toolState.status) {
      case 'executing':
        return (
          <div className="flex items-center gap-2 text-blue-600">
            <ArrowPathIcon className="w-4 h-4 animate-spin" />
            <span className="text-sm">{toolState.message}</span>
          </div>
        );
      case 'success':
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircleIcon className="w-4 h-4" />
              <span className="text-sm font-medium">{toolState.message}</span>
            </div>
            {toolState.result && (
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <pre className="text-xs text-gray-600 whitespace-pre-wrap">
                  {JSON.stringify(toolState.result, null, 2)}
                </pre>
              </div>
            )}
          </div>
        );
      case 'error':
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-red-600">
              <XMarkIcon className="w-4 h-4" />
              <span className="text-sm font-medium">{toolState.message}</span>
            </div>
            <button
              onClick={() => setToolState({ status: 'idle', message: '' })}
              className="text-xs text-red-600 hover:text-red-700 underline"
            >
              清除错误
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full">
      {/* Quick Tool Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <button
          onClick={() => executeTool('get_todos', { status: 'todo' })}
          disabled={toolState.status === 'executing'}
          className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <p className="text-sm font-medium text-gray-900">📋 查看待办</p>
          <p className="text-xs text-gray-500 mt-1">获取待办事项列表</p>
        </button>

        <button
          onClick={() => executeTool('create_todo', {
            title: '新任务',
            description: '这是一个新任务',
            dry_run: true
          })}
          disabled={toolState.status === 'executing'}
          className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <p className="text-sm font-medium text-gray-900">➕ 创建任务</p>
          <p className="text-xs text-gray-500 mt-1">创建新待办事项</p>
        </button>

        <button
          onClick={() => executeTool('search_documents', { query: '工作', limit: 5 })}
          disabled={toolState.status === 'executing'}
          className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <p className="text-sm font-medium text-gray-900">📄 搜索文档</p>
          <p className="text-xs text-gray-500 mt-1">智能搜索文档</p>
        </button>

        <button
          onClick={() => executeTool('get_stock_price', { symbol: 'AAPL' })}
          disabled={toolState.status === 'executing'}
          className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <p className="text-sm font-medium text-gray-900">📈 股价查询</p>
          <p className="text-xs text-gray-500 mt-1">查询股票价格</p>
        </button>
      </div>

      {/* Tool Result Display */}
      {toolState.status !== 'idle' && (
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="text-sm font-medium text-gray-900 mb-2">工具执行结果</h3>
          {renderToolResult()}
        </div>
      )}
    </div>
  );
}