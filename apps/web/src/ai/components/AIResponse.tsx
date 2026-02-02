'use client';

import { useEffect } from 'react';
import { Message } from '@/types/ai';

interface AIResponseProps {
  message: Message;
  onComplete?: () => void;
}

export function AIResponse({ message, onComplete }: AIResponseProps) {
  const [displayContent, setDisplayContent] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    if (message.type !== 'text') {
      setDisplayContent(message.content);
      setIsTyping(false);
      return;
    }

    let currentIndex = 0;
    const content = message.content;

    const typeNextCharacter = () => {
      if (currentIndex < content.length) {
        setDisplayContent(content.substring(0, currentIndex + 1));
        currentIndex++;
        setTimeout(typeNextCharacter, 20); // Adjust typing speed here
      } else {
        setIsTyping(false);
        if (onComplete) {
          setTimeout(onComplete, 100);
        }
      }
    };

    // Start typing effect
    setTimeout(typeNextCharacter, 100);
  }, [message.content, message.type, onComplete]);

  const renderContent = () => {
    if (message.type === 'text') {
      return <span>{displayContent}</span>;
    }

    switch (message.type) {
      case 'search-results':
        return (
          <div className="space-y-2">
            <p className="font-medium text-blue-900">{message.content}</p>
            <div className="space-y-2 mt-2">
              {message.data?.map((result: any, index: number) => (
                <div key={index} className="p-3 bg-white rounded border border-blue-200">
                  <h4 className="font-medium text-sm text-blue-800 mb-1">{result.title}</h4>
                  <p className="text-xs text-gray-600 mb-2">
                    相似度: {(result.similarity * 100).toFixed(1)}%
                  </p>
                  <p className="text-sm text-gray-700 line-clamp-3">{result.content}</p>
                </div>
              ))}
            </div>
          </div>
        );
      case 'action':
        return (
          <div className="space-y-3">
            <p className="font-medium text-green-800">{message.content}</p>
            {message.data && (
              <div className="p-3 bg-white rounded border border-green-200">
                <pre className="text-xs text-gray-600 whitespace-pre-wrap">
                  {JSON.stringify(message.data, null, 2)}
                </pre>
              </div>
            )}
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-600">执行完成</span>
            </div>
          </div>
        );
      case 'error':
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="font-medium text-red-800">错误</span>
            </div>
            <p className="text-red-700">{message.content}</p>
          </div>
        );
      default:
        return <p className="text-gray-700">{message.content}</p>;
    }
  };

  const getAvatar = () => {
    switch (message.role) {
      case 'user':
        return (
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
            你
          </div>
        );
      case 'assistant':
        return (
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white">
            <span className="text-sm font-bold">AI</span>
          </div>
        );
      default:
        return null;
    }
  };

  const getBubbleStyles = () => {
    const baseStyles = 'rounded-lg p-3 break-words';

    if (message.role === 'user') {
      return `${baseStyles} bg-blue-600 text-white ml-auto max-w-[80%]`;
    }

    switch (message.type) {
      case 'error':
        return `${baseStyles} bg-red-50 text-red-700 mr-auto max-w-[80%]`;
      case 'search-results':
        return `${baseStyles} bg-blue-50 text-gray-800 mr-auto max-w-[90%] border border-blue-200`;
      case 'action':
        return `${baseStyles} bg-green-50 text-green-800 mr-auto max-w-[90%] border border-green-200`;
      default:
        return `${baseStyles} bg-gray-50 text-gray-800 mr-auto max-w-[90%]`;
    }
  };

  return (
    <div className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
      {message.role === 'assistant' && getAvatar()}
      <div className={getBubbleStyles()}>
        {isTyping && message.type === 'text' ? (
          <div className="flex items-center gap-1">
            <span className="text-sm">{displayContent}</span>
            <div className="flex space-x-1">
              <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        ) : (
          renderContent()
        )}
      </div>
      {message.role === 'user' && getAvatar()}
    </div>
  );
}