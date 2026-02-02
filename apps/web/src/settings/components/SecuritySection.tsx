'use client';

import { useState } from 'react';
import { ShieldIcon, KeyIcon, DevicePhoneIcon, BellIcon, EyeIcon, EyeSlashIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface SecuritySettings {
  twoFactorAuth: {
    enabled: boolean;
    method: 'sms' | 'app' | 'none';
    backupCodes: string[];
  };
  password: {
    lastChanged: string;
    strength: 'weak' | 'medium' | 'strong';
    expires: boolean;
  };
  sessions: {
    current: {
      device: string;
      location: string;
      ip: string;
      lastActive: string;
      isCurrent: boolean;
    }[];
    maxSessions: number;
  };
  login: {
    notifications: boolean;
    requireVerification: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'private' | 'friends';
    activityStatus: boolean;
  };
}

interface SecuritySectionProps {
  initialSettings?: SecuritySettings;
  onSave: (settings: Partial<SecuritySettings>) => Promise<void>;
  onChangePassword: (current: string, new: string) => Promise<void>;
  onGenerateBackupCodes: () => Promise<string[]>;
}

export function SecuritySection({
  initialSettings,
  onSave,
  onChangePassword,
  onGenerateBackupCodes
}: SecuritySectionProps) {
  const [settings, setSettings] = useState<SecuritySettings>(initialSettings || {
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
        },
        {
          device: 'Safari on iPhone',
          location: 'San Francisco, CA',
          ip: '192.168.1.2',
          lastActive: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
          isCurrent: false
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
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [isGeneratingCodes, setIsGeneratingCodes] = useState(false);

  const toggle2FA = async (enabled: boolean) => {
    setIsSaving(true);
    try {
      await onSave({ twoFactorAuth: { ...settings.twoFactorAuth, enabled } });
      setSettings(prev => ({
        ...prev,
        twoFactorAuth: { ...prev.twoFactorAuth, enabled }
      }));
    } catch (error) {
      console.error('Failed to toggle 2FA:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const update2FAMethod = (method: 'sms' | 'app' | 'none') => {
    setSettings(prev => ({
      ...prev,
      twoFactorAuth: { ...prev.twoFactorAuth, method }
    }));
  };

  const updateLoginSetting = (field: keyof SecuritySettings['login'], value: boolean) => {
    setSettings(prev => ({
      ...prev,
      login: { ...prev.login, [field]: value }
    }));
  };

  const updatePrivacySetting = (field: keyof SecuritySettings['privacy'], value: any) => {
    setSettings(prev => ({
      ...prev,
      privacy: { ...prev.privacy, [field]: value }
    }));
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('新密码和确认密码不匹配');
      return;
    }

    setIsSaving(true);
    try {
      await onChangePassword(passwordData.currentPassword, passwordData.newPassword);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setShowPasswordModal(false);
    } catch (error) {
      console.error('Failed to change password:', error);
      alert('密码更改失败，请重试');
    } finally {
      setIsSaving(false);
    }
  };

  const generateBackupCodes = async () => {
    setIsGeneratingCodes(true);
    try {
      const codes = await onGenerateBackupCodes();
      setBackupCodes(codes);
      setShowBackupCodes(true);
    } catch (error) {
      console.error('Failed to generate backup codes:', error);
    } finally {
      setIsGeneratingCodes(false);
    }
  };

  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case 'weak':
        return 'text-red-600';
      case 'medium':
        return 'text-yellow-600';
      case 'strong':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStrengthText = (strength: string) => {
    switch (strength) {
      case 'weak':
        return '弱';
      case 'medium':
        return '中等';
      case 'strong':
        return '强';
      default:
        return '未知';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">安全设置</h2>
        <p className="text-gray-600">管理您的账户安全和隐私设置</p>
      </div>

      {/* Two-Factor Authentication */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldIcon className="w-5 h-5" />
            双因素认证
          </CardTitle>
          <CardDescription>
            为您的账户添加额外的安全层
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">启用双因素认证</h4>
              <p className="text-sm text-gray-500">
                {settings.twoFactorAuth.enabled
                  ? '您的账户已启用双因素认证'
                  : '建议启用以保护您的账户'}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.twoFactorAuth.enabled}
                onChange={(e) => toggle2FA(e.target.checked)}
                className="sr-only peer"
                disabled={isSaving}
              />
              <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 ${isSaving ? 'opacity-50' : ''}`}></div>
            </label>
          </div>

          {settings.twoFactorAuth.enabled && (
            <div className="space-y-4 pt-4">
              <div>
                <h4 className="font-medium mb-2">认证方式</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { value: 'app', label: '认证器应用', icon: DevicePhoneIcon },
                    { value: 'sms', label: '短信验证', icon: BellIcon },
                  ].map((method) => (
                    <button
                      key={method.value}
                      onClick={() => update2FAMethod(method.value as any)}
                      className={`p-3 border rounded-lg text-left transition-colors ${
                        settings.twoFactorAuth.method === method.value
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <method.icon className="w-5 h-5 text-gray-600" />
                        <span>{method.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">备用验证码</h4>
                {settings.twoFactorAuth.backupCodes.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500">
                      请妥善保管这些备用验证码
                    </p>
                    <button
                      onClick={() => setShowBackupCodes(!showBackupCodes)}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      {showBackupCodes ? '隐藏验证码' : '显示验证码'}
                    </button>
                    {showBackupCodes && (
                      <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                          {settings.twoFactorAuth.backupCodes.map((code, index) => (
                            <div key={index} className="p-2 bg-white border rounded">
                              {code}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500">
                      您还没有生成备用验证码
                    </p>
                    <Button
                      onClick={generateBackupCodes}
                      disabled={isGeneratingCodes}
                      size="sm"
                    >
                      {isGeneratingCodes ? '生成中...' : '生成备用验证码'}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Password */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyIcon className="w-5 h-5" />
            密码管理
          </CardTitle>
          <CardDescription>
            管理您的账户密码
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-500">密码强度</Label>
              <div className="flex items-center gap-2">
                <span className={`font-medium ${getStrengthColor(settings.password.strength)}`}>
                  {getStrengthText(settings.password.strength)}
                </span>
                <div className={`w-2 h-2 rounded-full ${getStrengthColor(settings.password.strength).replace('text-', 'bg-')}`} />
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">最后更改</Label>
              <p className="text-sm">
                {new Date(settings.password.lastChanged).toLocaleDateString()}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">密码策略</Label>
              <p className="text-sm">
                {settings.password.expires ? '90天过期' : '永不过期'}
              </p>
            </div>
          </div>

          <Button
            onClick={() => setShowPasswordModal(true)}
            className="w-full"
          >
            更改密码
          </Button>

          {showPasswordModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium">更改密码</h3>
                  <button
                    onClick={() => setShowPasswordModal(false)}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="current-password">当前密码</Label>
                    <div className="relative">
                      <Input
                        id="current-password"
                        type={showPassword ? 'text' : 'password'}
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                        placeholder="输入当前密码"
                      />
                      <button
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="new-password">新密码</Label>
                    <div className="relative">
                      <Input
                        id="new-password"
                        type={showPassword ? 'text' : 'password'}
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                        placeholder="输入新密码"
                      />
                      <button
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="confirm-password">确认新密码</Label>
                    <div className="relative">
                      <Input
                        id="confirm-password"
                        type={showPassword ? 'text' : 'password'}
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        placeholder="再次输入新密码"
                      />
                      <button
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="text-xs text-gray-500">
                    <p>密码要求：</p>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      <li>至少8个字符</li>
                      <li>包含大小写字母</li>
                      <li>包含数字</li>
                      <li>包含特殊字符</li>
                    </ul>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <Button variant="outline" onClick={() => setShowPasswordModal(false)}>
                    取消
                  </Button>
                  <Button onClick={handlePasswordChange} disabled={isSaving}>
                    {isSaving ? '更改中...' : '更改密码'}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DevicePhoneIcon className="w-5 h-5" />
            活动会话
          </CardTitle>
          <CardDescription>
            管理您的登录会话
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {settings.sessions.current.map((session, index) => (
              <div
                key={index}
                className={`p-3 border rounded-lg ${session.isCurrent ? 'border-blue-600 bg-blue-50' : 'border-gray-200'}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${session.isCurrent ? 'bg-blue-600' : 'bg-gray-400'}`} />
                      <span className="font-medium">{session.device}</span>
                      {session.isCurrent && (
                        <span className="text-xs text-blue-600">当前会话</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {session.location} • {session.ip}
                    </p>
                    <p className="text-xs text-gray-400">
                      最后活动: {new Date(session.lastActive).toLocaleString()}
                    </p>
                  </div>
                  {!session.isCurrent && (
                    <Button variant="outline" size="sm">
                      登出
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">
                最多允许 {settings.sessions.maxSessions} 个活动会话
              </span>
              <Button variant="outline" size="sm">
                管理会话
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Login Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellIcon className="w-5 h-5" />
            登录安全
          </CardTitle>
          <CardDescription>
            设置登录相关的安全选项
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <h4 className="font-medium">登录通知</h4>
                <p className="text-sm text-gray-500">新设备登录时发送通知</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.login.notifications}
                  onChange={(e) => updateLoginSetting('notifications', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <h4 className="font-medium">需要二次验证</h4>
                <p className="text-sm text-gray-500">登录时需要验证码</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.login.requireVerification}
                  onChange={(e) => updateLoginSetting('requireVerification', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldIcon className="w-5 h-5" />
            隐私设置
          </CardTitle>
          <CardDescription>
            控制您的个人资料和活动可见性
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div>
              <h4 className="font-medium mb-2">个人资料可见性</h4>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'public', label: '公开' },
                  { value: 'friends', label: '好友' },
                  { value: 'private', label: '私密' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => updatePrivacySetting('profileVisibility', option.value)}
                    className={`p-2 border rounded-lg text-center transition-colors ${
                      settings.privacy.profileVisibility === option.value
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <h4 className="font-medium">显示活动状态</h4>
                <p className="text-sm text-gray-500">让其他用户看到您的在线状态</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.privacy.activityStatus}
                  onChange={(e) => updatePrivacySetting('activityStatus', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}