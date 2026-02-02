'use client';

import { useState } from 'react';
import { BellIcon, EnvelopeIcon, MessageCircleIcon, UserCircleIcon, XMarkIcon, CheckIcon, ClockIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export type NotificationType = 'mention' | 'comment' | 'like' | 'follow' | 'system' | 'email' | 'task';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  priority: 'low' | 'medium' | 'high';
  metadata?: Record<string, any>;
}

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDismiss: (id: string) => void;
  onAction?: (url: string) => void;
}

export function NotificationItem({
  notification,
  onMarkAsRead,
  onDismiss,
  onAction
}: NotificationItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'mention':
        return <UserCircleIcon className="w-5 h-5 text-blue-600" />;
      case 'comment':
        return <MessageCircleIcon className="w-5 h-5 text-green-600" />;
      case 'like':
        return <BellIcon className="w-5 h-5 text-red-600" />;
      case 'follow':
        return <UserCircleIcon className="w-5 h-5 text-purple-600" />;
      case 'system':
        return <BellIcon className="w-5 h-5 text-gray-600" />;
      case 'email':
        return <EnvelopeIcon className="w-5 h-5 text-blue-600" />;
      case 'task':
        return <ClockIcon className="w-5 h-5 text-orange-600" />;
      default:
        return <BellIcon className="w-5 h-5 text-gray-600" />;
    }
  };

  const getNotificationColor = (priority: NotificationType['priority']) => {
    switch (priority) {
      case 'high':
        return 'border-red-200 bg-red-50';
      case 'medium':
        return 'border-yellow-200 bg-yellow-50';
      case 'low':
        return 'border-gray-200 bg-white';
      default:
        return 'border-gray-200 bg-white';
    }
  };

  const formatTime = (timestamp: string) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return '刚刚';
    if (diffInMinutes < 60) return `${diffInMinutes}分钟前`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}小时前`;
    return date.toLocaleDateString();
  };

  const handleMarkAsRead = async () => {
    setIsProcessing(true);
    try {
      await onMarkAsRead(notification.id);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAction = () => {
    if (notification.actionUrl && onAction) {
      onAction(notification.actionUrl);
    }
  };

  return (
    <Card
      className={`p-4 transition-all duration-200 ${
        notification.read
          ? 'bg-white opacity-70'
          : getNotificationColor(notification.priority)
      } ${notification.read ? '' : 'shadow-sm'}`}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="flex-shrink-0 mt-1">
          {getNotificationIcon(notification.type)}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h3 className={`font-medium ${notification.read ? 'text-gray-700' : 'text-gray-900'}`}>
                {notification.title}
              </h3>
              {!isExpanded && (
                <p className={`text-sm mt-1 ${notification.read ? 'text-gray-500' : 'text-gray-600'}`}>
                  {notification.message.length > 100
                    ? `${notification.message.substring(0, 100)}...`
                    : notification.message}
                </p>
              )}
              {isExpanded && (
                <div className="mt-2 space-y-2">
                  <p className="text-sm text-gray-600">
                    {notification.message}
                  </p>
                  {notification.metadata && (
                    <div className="text-xs text-gray-500">
                      <div>时间: {new Date(notification.timestamp).toLocaleString()}</div>
                      <div>类型: {notification.type}</div>
                      {notification.metadata.user && (
                        <div>用户: {notification.metadata.user}</div>
                      )}
                      {notification.metadata.item && (
                        <div>项目: {notification.metadata.item}</div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Expand/Collapse */}
              {!notification.read && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                  title={isExpanded ? '收起详情' : '展开详情'}
                >
                  <svg
                    className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              )}

              {/* Mark as Read */}
              {!notification.read && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMarkAsRead}
                  disabled={isProcessing}
                  className="p-1"
                >
                  {isProcessing ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <CheckIcon className="w-4 h-4" />
                  )}
                </Button>
              )}

              {/* Dismiss */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDismiss(notification.id)}
                className="p-1 text-gray-400 hover:text-red-600"
              >
                <XMarkIcon className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Time */}
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs text-gray-400">
              {formatTime(notification.timestamp)}
            </span>
            {notification.actionUrl && (
              <Button
                variant="link"
                size="sm"
                onClick={handleAction}
                className="text-xs text-blue-600 hover:text-blue-800 p-0 h-auto"
              >
                查看详情
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}