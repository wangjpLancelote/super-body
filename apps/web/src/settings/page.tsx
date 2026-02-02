'use client';

import { useState, useEffect } from 'react';
import { User, Bell, Shield, CreditCard, Palette, Moon, Sun, Database, Download, Trash2, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SettingsForm } from '@/components/SettingsForm';
import { ProfileSection } from '@/settings/components/ProfileSection';
import { NotificationsSection } from '@/settings/components/NotificationsSection';
import { DataSection } from '@/settings/components/DataSection';
import { SecuritySection } from '@/settings/components/SecuritySection';
import { AppearanceSection } from '@/settings/components/AppearanceSection';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(true);
  const [exportModalOpen, setExportModalOpen] = useState(false);

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

  useEffect(() => {
    // Simulate loading settings from API
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleSaveSettings = async (settings: any) => {
    console.log('Saving settings:', settings);
    // In a real app, this would make an API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    return Promise.resolve();
  };

  const handleExport = async (format: 'json' | 'csv' | 'pdf' | 'excel') => {
    console.log('Exporting data in format:', format);
    // In a real app, this would make an API call to export data
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Create a fake download
    const blob = new Blob(['Mock exported data'], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `export.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    return Promise.resolve();
  };

  const handleDeleteAccount = async () => {
    if (confirm('确定要删除账户吗？此操作无法撤销。')) {
      console.log('Deleting account...');
      // In a real app, this would make an API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('账户删除成功');
    }
  };

  const handleClearCache = async () => {
    console.log('Clearing cache...');
    // In a real app, this would clear local storage and cache
    await new Promise(resolve => setTimeout(resolve, 1000));
    alert('缓存已清理');
  };

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
            {activeTab === 'profile' && (
              <ProfileSection
                initialData={mockSettings.profile}
                onSave={handleSaveSettings}
              />
            )}

            {activeTab === 'notifications' && (
              <NotificationsSection
                initialSettings={mockSettings.notifications}
                onSave={handleSaveSettings}
              />
            )}

            {activeTab === 'security' && (
              <SecuritySection
                initialSettings={mockSettings.security}
                onSave={handleSaveSettings}
                onChangePassword={async (current, newPass) => {
                  console.log('Changing password...');
                  await new Promise(resolve => setTimeout(resolve, 1000));
                  return Promise.resolve();
                }}
                onGenerateBackupCodes={async () => {
                  console.log('Generating backup codes...');
                  await new Promise(resolve => setTimeout(resolve, 1000));
                  return ['ABCD-EFGH-IJKL', 'MNOP-QRST-UVWX', 'YZ12-3456-7890'];
                }}
              />
            )}

            {activeTab === 'appearance' && (
              <AppearanceSection
                initialSettings={mockSettings.appearance}
                onSave={handleSaveSettings}
              />
            )}

            {activeTab === 'data' && (
              <DataSection
                onExport={handleExport}
                onDeleteAccount={handleDeleteAccount}
                onClearCache={handleClearCache}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}