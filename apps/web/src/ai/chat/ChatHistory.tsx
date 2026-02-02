'use client';

import { Message } from '@/types/ai';

interface ChatHistoryProps {
  messages: Message[];
  isLoading: boolean;
  isTyping: boolean;
}

export function ChatHistory({ messages, isLoading, isTyping }: ChatHistoryProps) {
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getMessageStyles = (message: Message) => {
    const baseStyles = 'flex gap-3 p-3 rounded-lg max-w-[80%] break-words';

    switch (message.role) {
      case 'user':
        return `${baseStyles} justify-end`;
      case 'assistant':
        return `${baseStyles} justify-start`;
      default:
        return baseStyles;
    }
  };

  const getContentStyles = (message: Message) => {
    const baseStyles = 'flex-1';

    switch (message.type) {
      case 'error':
        return `${baseStyles} text-red-700 bg-red-50`;
      case 'search-results':
        return `${baseStyles} text-gray-800 bg-blue-50 border border-blue-200`;
      case 'action':
        return `${baseStyles} text-green-700 bg-green-50 border border-green-200`;
      default:
        if (message.role === 'user') {
          return `${baseStyles} text-gray-800 bg-gray-100`;
        } else {
          return `${baseStyles} text-gray-800 bg-gray-50`;
        }
    }
  };

  const renderMessageContent = (message: Message) => {
    switch (message.type) {
      case 'search-results':
        return (
          <div className="space-y-2">
            <p className="font-medium text-blue-900">{message.content}</p>
            <div className="space-y-2 mt-2">
              {message.data?.map((result: any, index: number) => (
                <div key={index} className="p-2 bg-white rounded border border-blue-200">
                  <h4 className="font-medium text-sm text-blue-800">{result.title}</h4>
                  <p className="text-xs text-gray-600 mt-1">
                    相似度: {(result.similarity * 100).toFixed(1)}%
                  </p>
                  <p className="text-sm text-gray-700 mt-1 line-clamp-2">
                    {result.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        );
      case 'action':
        return (
          <div className="space-y-2">
            <p className="font-medium text-green-800">{message.content}</p>
            {message.data && (
              <div className="p-2 bg-white rounded border border-green-200">
                <pre className="text-xs text-gray-600">{JSON.stringify(message.data, null, 2)}</pre>
              </div>
            )}
          </div>
        );
      default:
        return <p className="text-sm leading-relaxed">{message.content}</p>;
    }
  };

  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={getMessageStyles(message)}
        >
          <div className={getContentStyles(message)}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {renderMessageContent(message)}
              </div>
              <div className="text-xs text-gray-500 ml-2 flex-shrink-0">
                {formatTime(message.timestamp)}
              </div>
            </div>
          </div>
        </div>
      ))}

      {isTyping && (
        <div className="flex gap-3 justify-start">
          <div className="flex-1 bg-gray-50 rounded-lg p-3 max-w-[80%]">
            <div className="flex items-center gap-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
              <span className="text-gray-500 text-sm">AI 正在输入...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}