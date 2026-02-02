'use client';

import { useState, KeyboardEvent } from 'react';
import { PaperAirplaneIcon, MicrophoneIcon } from '@heroicons/react/24/outline';

interface ChatInputProps {
  onSendMessage: (content: string) => void;
  isLoading: boolean;
}

export function ChatInput({ onSendMessage, isLoading }: ChatInputProps) {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    const trimmedMessage = message.trim();
    if (trimmedMessage && !isLoading) {
      onSendMessage(trimmedMessage);
      setMessage('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickAction = (action: string) => {
    setMessage(action);
    setTimeout(handleSend, 100);
  };

  const quickActions = [
    { text: '帮我总结最近的文档', emoji: '📄' },
    { text: '列出我的所有待办事项', emoji: '📋' },
    { text: '创建一个新的待办事项', emoji: '✏️' },
    { text: '分析我的工作进度', emoji: '📊' },
  ];

  return (
    <div className="space-y-4">
      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2">
        {quickActions.map((action, index) => (
          <button
            key={index}
            onClick={() => handleQuickAction(action.text)}
            disabled={isLoading}
            className="px-3 py-1 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {action.emoji} {action.text}
          </button>
        ))}
      </div>

      {/* Main Input */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入消息..."
            disabled={isLoading}
            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            rows={2}
          />
          <button
            onClick={() => {
              // Voice input feature placeholder
              console.log('Voice input would be implemented here');
            }}
            disabled={isLoading}
            className="absolute right-2 bottom-2 p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            title="语音输入（即将推出）"
          >
            <MicrophoneIcon className="w-5 h-5" />
          </button>
        </div>
        <button
          onClick={handleSend}
          disabled={!message.trim() || isLoading}
          className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          <PaperAirplaneIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Input Guidelines */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>💡 提示：使用 Enter 发送消息，Shift + Enter 换行</p>
        <p>🎯 可以要求我：搜索文档、创建任务、总结内容、分析数据等</p>
      </div>
    </div>
  );
}