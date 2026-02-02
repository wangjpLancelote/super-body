'use client';

import { useState, useEffect } from 'react';
import { User, Mail, Phone, Bell, Shield, CreditCard, Palette, Moon, Sun, HelpCircle, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface UserSettings {
  profile: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    bio: string;
  };
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    weeklyDigest: boolean;
    projectUpdates: boolean;
    mentionAlerts: boolean;
  };
  security: {
    twoFactorAuth: boolean;
    loginNotifications: boolean;
    sessionTimeout: number;
  };
  appearance: {
    theme: 'light' | 'dark' | 'system';
    compactMode: boolean;
    animations: boolean;
    sidebarCollapsed: boolean;
  };
  billing: {
    plan: 'free' | 'pro' | 'enterprise';
    paymentMethod: string;
    nextBilling: string;
  };
}

interface SettingsFormProps {
  initialSettings?: UserSettings;
  onSave: (settings: UserSettings) => void;
}

export function SettingsForm({ initialSettings, onSave }: SettingsFormProps) {
  const [settings, setSettings] = useState<UserSettings>(initialSettings || {
    profile: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      bio: ''
    },
    notifications: {
      email: true,
      push: true,
      sms: false,
      weeklyDigest: true,
      projectUpdates: true,
      mentionAlerts: true
    },
    security: {
      twoFactorAuth: false,
      loginNotifications: true,
      sessionTimeout: 30
    },
    appearance: {
      theme: 'system',
      compactMode: false,
      animations: true,
      sidebarCollapsed: false
    },
    billing: {
      plan: 'free',
      paymentMethod: '',
      nextBilling: ''
    }
  });

  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setHasChanges(JSON.stringify(settings) !== JSON.stringify(initialSettings));
  }, [settings, initialSettings]);

  const updateProfile = (field: keyof UserSettings['profile'], value: string) => {
    setSettings(prev => ({
      ...prev,
      profile: { ...prev.profile, [field]: value }
    }));
  };

  const updateNotification = (field: keyof UserSettings['notifications'], value: boolean) => {
    setSettings(prev => ({
      ...prev,
      notifications: { ...prev.notifications, [field]: value }
    }));
  };

  const updateSecurity = (field: keyof UserSettings['security'], value: any) => {
    setSettings(prev => ({
      ...prev,
      security: { ...prev.security, [field]: value }
    }));
  };

  const updateAppearance = (field: keyof UserSettings['appearance'], value: any) => {
    setSettings(prev => ({
      ...prev,
      appearance: { ...prev.appearance, [field]: value }
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(settings);
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const resetForm = () => {
    if (initialSettings) {
      setSettings(initialSettings);
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile Section */}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">名字</Label>
              <Input
                id="firstName"
                value={settings.profile.firstName}
                onChange={(e) => updateProfile('firstName', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="lastName">姓氏</Label>
              <Input
                id="lastName"
                value={settings.profile.lastName}
                onChange={(e) => updateProfile('lastName', e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">邮箱</Label>
              <Input
                id="email"
                type="email"
                value={settings.profile.email}
                onChange={(e) => updateProfile('email', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="phone">电话</Label>
              <Input
                id="phone"
                type="tel"
                value={settings.profile.phone}
                onChange={(e) => updateProfile('phone', e.target.value)}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="bio">个人简介</Label>
            <Textarea
              id="bio"
              value={settings.profile.bio}
              onChange={(e) => updateProfile('bio', e.target.value)}
              placeholder="介绍一下您自己..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notifications Section */}
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
            <label className="flex items-center space-x-3">
              <Checkbox
                checked={settings.notifications.email}
                onCheckedChange={(checked) => updateNotification('email', !!checked)}
              />
              <div>
                <span className="font-medium">邮件通知</span>
                <p className="text-sm text-gray-500">通过邮件接收重要更新</p>
              </div>
            </label>
            <label className="flex items-center space-x-3">
              <Checkbox
                checked={settings.notifications.push}
                onCheckedChange={(checked) => updateNotification('push', !!checked)}
              />
              <div>
                <span className="font-medium">推送通知</span>
                <p className="text-sm text-gray-500">在设备上接收实时通知</p>
              </div>
            </label>
            <label className="flex items-center space-x-3">
              <Checkbox
                checked={settings.notifications.sms}
                onCheckedChange={(checked) => updateNotification('sms', !!checked)}
              />
              <div>
                <span className="font-medium">短信通知</span>
                <p className="text-sm text-gray-500">通过短信接收紧急通知</p>
              </div>
            </label>
          </div>
          <div className="space-y-3">
            <h4 className="font-medium">邮件偏好设置</h4>
            <label className="flex items-center space-x-3">
              <Checkbox
                checked={settings.notifications.weeklyDigest}
                onCheckedChange={(checked) => updateNotification('weeklyDigest', !!checked)}
              />
              <span>每周摘要</span>
            </label>
            <label className="flex items-center space-x-3">
              <Checkbox
                checked={settings.notifications.projectUpdates}
                onCheckedChange={(checked) => updateNotification('projectUpdates', !!checked)}
              />
              <span>项目更新</span>
            </label>
            <label className="flex items-center space-x-3">
              <Checkbox
                checked={settings.notifications.mentionAlerts}
                onCheckedChange={(checked) => updateNotification('mentionAlerts', !!checked)}
              />
              <span>提及提醒</span>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Security Section */}
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
            <label className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Checkbox
                  checked={settings.security.twoFactorAuth}
                  onCheckedChange={(checked) => updateSecurity('twoFactorAuth', !!checked)}
                />
                <div>
                  <span className="font-medium">双因素认证</span>
                  <p className="text-sm text-gray-500">为您的账户添加额外的安全层</p>
                </div>
              </div>
              {settings.security.twoFactorAuth ? (
                <span className="text-sm text-green-600">已启用</span>
              ) : (
                <Button variant="outline" size="sm">启用</Button>
              )}
            </label>
            <label className="flex items-center space-x-3">
              <Checkbox
                checked={settings.security.loginNotifications}
                onCheckedChange={(checked) => updateSecurity('loginNotifications', !!checked)}
              />
              <span>登录通知</span>
            </label>
          </div>
          <div>
            <Label htmlFor="sessionTimeout">会话超时时间</Label>
            <select
              id="sessionTimeout"
              value={settings.security.sessionTimeout}
              onChange={(e) => updateSecurity('sessionTimeout', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value={15}>15 分钟</option>
              <option value={30}>30 分钟</option>
              <option value={60}>1 小时</option>
              <option value={120}>2 小时</option>
              <option value={-1}>永不超时</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Appearance Section */}
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
            <Label>主题</Label>
            <div className="grid grid-cols-3 gap-3 mt-2">
              <button
                onClick={() => updateAppearance('theme', 'light')}
                className={`p-3 border rounded-lg text-center transition-colors ${
                  settings.appearance.theme === 'light'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Sun className="w-5 h-5 mx-auto mb-1" />
                <span className="text-sm">浅色</span>
              </button>
              <button
                onClick={() => updateAppearance('theme', 'dark')}
                className={`p-3 border rounded-lg text-center transition-colors ${
                  settings.appearance.theme === 'dark'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Moon className="w-5 h-5 mx-auto mb-1" />
                <span className="text-sm">深色</span>
              </button>
              <button
                onClick={() => updateAppearance('theme', 'system')}
                className={`p-3 border rounded-lg text-center transition-colors ${
                  settings.appearance.theme === 'system'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="w-5 h-5 mx-auto mb-1 flex items-center justify-center">
                  <Sun className="w-3 h-3 text-gray-500" />
                  <Moon className="w-3 h-3 text-gray-500 -ml-2" />
                </div>
                <span className="text-sm">系统</span>
              </button>
            </div>
          </div>
          <div className="space-y-3">
            <label className="flex items-center space-x-3">
              <Checkbox
                checked={settings.appearance.compactMode}
                onCheckedChange={(checked) => updateAppearance('compactMode', !!checked)}
              />
              <span>紧凑模式</span>
            </label>
            <label className="flex items-center space-x-3">
              <Checkbox
                checked={settings.appearance.animations}
                onCheckedChange={(checked) => updateAppearance('animations', !!checked)}
              />
              <span>启用动画</span>
            </label>
            <label className="flex items-center space-x-3">
              <Checkbox
                checked={settings.appearance.sidebarCollapsed}
                onCheckedChange={(checked) => updateAppearance('sidebarCollapsed', !!checked)}
              />
              <span>收起侧边栏</span>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Billing Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            计费信息
          </CardTitle>
          <CardDescription>
            管理您的订阅和支付方式
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="text-sm font-medium text-gray-500">当前计划</div>
              <div className="text-lg font-semibold capitalize">
                {settings.billing.plan === 'free' && '免费版'}
                {settings.billing.plan === 'pro' && '专业版'}
                {settings.billing.plan === 'enterprise' && '企业版'}
              </div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="text-sm font-medium text-gray-500">下次计费</div>
              <div className="text-lg font-semibold">
                {settings.billing.nextBilling || 'N/A'}
              </div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="text-sm font-medium text-gray-500">支付方式</div>
              <div className="text-lg font-semibold">
                {settings.billing.paymentMethod || '未设置'}
              </div>
            </div>
          </div>
          <Button className="w-full">升级计划</Button>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600">危险区域</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 border border-red-200 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">删除账户</h4>
            <p className="text-sm text-gray-600 mb-4">
              永久删除您的账户和所有相关数据。此操作无法撤销。
            </p>
            <Button variant="destructive" className="bg-red-600 hover:bg-red-700">
              删除账户
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Save Actions */}
      <div className="flex items-center justify-between gap-3">
        <Button variant="outline" onClick={resetForm} disabled={!hasChanges}>
          重置
        </Button>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">
            {hasChanges ? '有未保存的更改' : '所有更改已保存'}
          </span>
          <Button
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
          >
            {isSaving ? '保存中...' : '保存设置'}
          </Button>
        </div>
      </div>
    </div>
  );
}