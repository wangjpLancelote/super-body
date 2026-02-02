'use client';

import { useState, useRef, useEffect } from 'react';
import { ChatHistory } from './chat/ChatHistory';
import { ChatInput } from './chat/ChatInput';
import { ChatActions } from './chat/ChatActions';
import { DocumentSearch } from './DocumentSearch';
import { AIActions } from './AIActions';
import { AIResponse } from './AIResponse';
import { Message } from '@/types/ai';
import { AIService, mockResponses } from '@/services/aiService';
import { useAuth } from '@/auth/AuthContext';

interface AIAssistantProps {}

export function AIAssistant({ }: AIAssistantProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDocumentSearch, setShowDocumentSearch] = useState(false);
  const [showAIActions, setShowAIActions] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages are added
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize with welcome message
  useEffect(() => {
    const welcomeMessage: Message = {
      id: 'welcome-' + Date.now(),
      content: `你好！我是你的 AI 助手。我可以帮助你：

1. **搜索和总结文档** - 我可以帮你查找和总结你的文档内容
2. **管理待办事项** - 创建、查看和管理你的待办任务
3. **提供操作建议** - 基于你的数据和上下文提供智能建议
4. **数据分析** - 帮助你理解和分析数据

请告诉我你需要什么帮助！`,
      role: 'assistant',
      timestamp: new Date().toISOString(),
      type: 'text',
    };
    setMessages([welcomeMessage]);
  }, []);

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    // Get auth token from user session
    const accessToken = user?.session?.access_token || '';

    const userMessage: Message = {
      id: 'user-' + Date.now(),
      content,
      role: 'user',
      timestamp: new Date().toISOString(),
      type: 'text',
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setIsTyping(true);

    try {
      // Try to call real AI service, fall back to mock for demo
      let response;
      if (accessToken) {
        response = await AIService.chat({
          message: content,
          context: {
            userId: user?.id,
            chatHistory: messages.slice(-5), // Include last 5 messages for context
          },
        }, accessToken);
      } else {
        // Fallback to mock responses for demo
        if (content.includes('文档') || content.includes('搜索')) {
          response = mockResponses.searchDocuments(content);
          response = {
            ...response,
            content: `我找到了 ${response.documents.length} 个相关文档：`,
            type: 'search-results',
          };
        } else if (content.includes('创建') || content.includes('任务')) {
          const titleMatch = content.match(/创建(.+?)任务|创建(.+)/);
          const title = titleMatch ? (titleMatch[1] || titleMatch[2]) : '新任务';
          const createResponse = mockResponses.createTodo(title, content);
          response = {
            ...createResponse,
            content: createResponse.message || '任务创建成功！',
            type: 'action',
            data: createResponse.data,
          };
        } else {
          // Generic response
          response = mockResponses.welcome;
          response.content = `我理解你的问题："${content}"。让我帮你处理这个请求。`;
        }
      }

      const responseMessage: Message = {
        id: 'assistant-' + Date.now(),
        content: response.content,
        role: 'assistant',
        timestamp: new Date().toISOString(),
        type: response.type as any,
        data: response.data,
      };

      setMessages(prev => [...prev, responseMessage]);
      setIsLoading(false);
      setIsTyping(false);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: 'error-' + Date.now(),
        content: '抱歉，处理您的请求时出现了错误。请稍后再试。',
        role: 'assistant',
        timestamp: new Date().toISOString(),
        type: 'error',
      };

      setMessages(prev => [...prev, errorMessage]);
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const handleDocumentSearch = (results: any[]) => {
    // Handle document search results
    const searchMessage: Message = {
      id: 'search-result-' + Date.now(),
      content: `我找到了 ${results.length} 个相关文档：`,
      role: 'assistant',
      timestamp: new Date().toISOString(),
      type: 'search-results',
      data: results,
    };

    setMessages(prev => [...prev, searchMessage]);
    setShowDocumentSearch(false);
  };

  const handleAIAction = (action: string, data?: any) => {
    // Handle AI actions like creating todos, etc.
    const actionMessage: Message = {
      id: 'action-' + Date.now(),
      content: `正在执行操作：${action}`,
      role: 'assistant',
      timestamp: new Date().toISOString(),
      type: 'action',
      data,
    };

    setMessages(prev => [...prev, actionMessage]);
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">AI 助手</h1>
              <p className="text-xs sm:text-sm text-gray-600">智能助手，帮助您更好地管理任务和文档</p>
            </div>
            <div className="flex flex-wrap sm:flex-nowrap gap-2">
              <button
                onClick={() => setShowDocumentSearch(true)}
                className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap"
              >
                📄 搜索文档
              </button>
              <button
                onClick={() => setShowAIActions(true)}
                className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
              >
                🎯 AI 建议
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="bg-white rounded-xl shadow-lg h-[500px] sm:h-[600px] lg:h-[700px] flex flex-col">
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
            <ChatHistory
              messages={messages}
              isLoading={isLoading}
              isTyping={isTyping}
            />
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Area */}
          <div className="border-t p-3 sm:p-4">
            <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading || isTyping} />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-3 sm:mt-4 flex justify-center sm:justify-start">
          <ChatActions onAction={handleAIAction} />
        </div>
      </div>

      {/* Document Search Modal */}
      {showDocumentSearch && (
        <DocumentSearch
          userId={user?.id || ''}
          onClose={() => setShowDocumentSearch(false)}
          onSearchResults={handleDocumentSearch}
        />
      )}

      {/* AI Actions Modal */}
      {showAIActions && (
        <AIActions
          userId={user?.id || ''}
          onClose={() => setShowAIActions(false)}
          onAction={handleAIAction}
        />
      )}
    </div>
  );
}