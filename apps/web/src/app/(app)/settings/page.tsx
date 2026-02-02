'use client';

import { useState, useEffect } from 'react';
import { User, Bell, Shield, CreditCard, Palette, Moon, Sun, Database, Download, Trash2, LogOut } from 'lucide-react';
import { Button } from '@/lib/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/lib/ui/card';

// Mock data - in a real app, this would come from your API
const mockSettings = {
  profile: {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    bio: '热爱编程和设计的产品经理'
  },
  notifications: {
    email: {
      enabled: true,
      frequency: 'immediate',
      types: {
        mentions: true,
        comments: true,
        likes: false,
        follows: false,
        tasks: true,
        system: false
      }
    },
    push: {
      enabled: true,
      sound: true,
      badge: true,
      types: {
        mentions: true,
        comments: true,
        likes: false,
        follows: false,
        tasks: true,
        system: false
      }
    },
    sms: {
      enabled: false,
      emergencyOnly: true,
      types: {
        security: true,
        mentions: false,
        tasks: false
      }
    },
    digest: {
      enabled: true,
      frequency: 'weekly',
      time: '09:00'
    }
  },
  appearance: {
    theme: 'system',
    layout: 'sidebar',
    compactMode: false,
    animations: true,
    sidebarCollapsed: false,
    fontSize: 'medium',
    highContrast: false,
    reducedMotion: false
  },
  security: {
    twoFactorAuth: {
      enabled: false,
      method: 'none',
      backupCodes: []
    },
    password: {
      lastChanged: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      strength: 'medium',
      expires: true
    },
    sessions: {
      current: [
        {
          device: 'Chrome on MacBook Pro',
          location: 'San Francisco, CA',
          ip: '192.168.1.1',
          lastActive: new Date().toISOString(),
          isCurrent: true
        }
      ],
      maxSessions: 3
    },
    login: {
      notifications: true,
      requireVerification: false
    },
    privacy: {
      profileVisibility: 'private',
      activityStatus: true
    }
  }
};

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading settings from API
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);

  const tabs = [
    { id: 'profile', label: '个人资料', icon: User },
    { id: 'notifications', label: '通知设置', icon: Bell },
    { id: 'security', label: '安全设置', icon: Shield },
    { id: 'appearance', label: '外观设置', icon: Palette },
    { id: 'data', label: '数据管理', icon: Database },
  ];

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">加载设置中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Breadcrumb */}
      <div className="px-4 sm:px:6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">设置</h1>
        </div>
      </div>

      {/* Main Content */}
      <main className="px-4 sm:px:6 lg:px-8 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Settings Sidebar */}
          <div className="lg:col-span-1">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Settings Content */}
          <div className="lg:col-span-3">
            {/* Profile Section */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5" />
                      个人资料
                    </CardTitle>
                    <CardDescription>
                      管理您的个人信息和偏好设置
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-6">
                      <div className="relative">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                          JD
                        </div>
                        <button className="absolute -bottom-1 -right-1 bg-white border border-gray-300 rounded-full p-1 shadow-sm">
                          <svg className="h-4 w-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13l-3 3m0 0l-3-3m3 3V8" />
                          </svg>
                        </button>
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900">
                          {mockSettings.profile.firstName} {mockSettings.profile.lastName}
                        </h2>
                        <p className="text-gray-600">{mockSettings.profile.email}</p>
                        <button className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                          编辑资料
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>快速信息</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-500">电话</p>
                        <p className="text-gray-900">{mockSettings.profile.phone}</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-500">邮箱</p>
                        <p className="text-gray-900">{mockSettings.profile.email}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Notifications Section */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="w-5 h-5" />
                      通知设置
                    </CardTitle>
                    <CardDescription>
                      管理您希望接收的通知类型
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium">邮件通知</span>
                          <p className="text-sm text-gray-500">通过邮件接收重要更新</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium">推送通知</span>
                          <p className="text-sm text-gray-500">在设备上接收实时通知</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium">短信通知</span>
                          <p className="text-sm text-gray-500">通过短信接收紧急通知</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Security Section */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      安全设置
                    </CardTitle>
                    <CardDescription>
                      保护您的账户安全
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <span className="font-medium">双因素认证</span>
                          <p className="text-sm text-gray-500">为您的账户添加额外的安全层</p>
                        </div>
                        <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                          启用
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium">登录通知</span>
                          <p className="text-sm text-gray-500">在登录时收到通知</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Appearance Section */}
            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Palette className="w-5 h-5" />
                      外观设置
                    </CardTitle>
                    <CardDescription>
                      自定义界面外观和行为
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <span className="font-medium">主题</span>
                      <div className="grid grid-cols-3 gap-3 mt-2">
                        <button className="p-3 border rounded-lg text-center transition-colors bg-blue-50 border-blue-600">
                          <Sun className="w-5 h-5 mx-auto mb-1 text-blue-600" />
                          <span className="text-sm">浅色</span>
                        </button>
                        <button className="p-3 border rounded-lg text-center transition-colors hover:bg-gray-50">
                          <Moon className="w-5 h-5 mx-auto mb-1 text-gray-600" />
                          <span className="text-sm">深色</span>
                        </button>
                        <button className="p-3 border rounded-lg text-center transition-colors hover:bg-gray-50">
                          <div className="w-5 h-5 mx-auto mb-1 flex items-center justify-center">
                            <Sun className="w-3 h-3 text-gray-500" />
                            <Moon className="w-3 h-3 text-gray-500 -ml-2" />
                          </div>
                          <span className="text-sm">系统</span>
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Data Section */}
            {activeTab === 'data' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Database className="w-5 h-5" />
                      数据管理
                    </CardTitle>
                    <CardDescription>
                      管理您的数据导出、存储和使用情况
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-gray-900">1.2GB</div>
                        <div className="text-sm text-gray-500">总存储空间</div>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-gray-900">512MB</div>
                        <div className="text-sm text-gray-500">文档</div>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-gray-900">256MB</div>
                        <div className="text-sm text-gray-500">文件</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Download className="w-5 h-5" />
                      数据导出
                    </CardTitle>
                    <CardDescription>
                      导出您的个人数据以便备份或迁移
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <button className="p-4 border rounded-lg text-left transition-colors hover:bg-gray-50">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center">
                            <span className="text-xs font-bold text-green-600">JS</span>
                          </div>
                          <div className="font-medium">JSON</div>
                        </div>
                        <div className="text-xs text-gray-500">结构化数据</div>
                      </button>
                      <button className="p-4 border rounded-lg text-left transition-colors hover:bg-gray-50">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                            <span className="text-xs font-bold text-blue-600">CSV</span>
                          </div>
                          <div className="font-medium">CSV</div>
                        </div>
                        <div className="text-xs text-gray-500">表格数据</div>
                      </button>
                      <button className="p-4 border rounded-lg text-left transition-colors hover:bg-gray-50">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-8 h-8 bg-red-100 rounded flex items-center justify-center">
                            <span className="text-xs font-bold text-red-600">PDF</span>
                          </div>
                          <div className="font-medium">PDF</div>
                        </div>
                        <div className="text-xs text-gray-500">文档格式</div>
                      </button>
                      <button className="p-4 border rounded-lg text-left transition-colors hover:bg-gray-50">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center">
                            <span className="text-xs font-bold text-green-600">XLS</span>
                          </div>
                          <div className="font-medium">Excel</div>
                        </div>
                        <div className="text-xs text-gray-500">电子表格</div>
                      </button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-red-200">
                  <CardHeader>
                    <CardTitle className="text-red-600">危险区域</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="p-4 border border-red-200 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">删除账户</h4>
                      <p className="text-sm text-gray-600 mb-4">
                        永久删除您的账户和所有相关数据。此操作无法撤销。
                      </p>
                      <button className="px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition-colors">
                        删除账户
                      </button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}