'use client';

import { useState } from 'react';
import { BellIcon, EnvelopeIcon, MessageCircleIcon, UserCircleIcon, ShieldIcon, CheckIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface NotificationSettings {
  email: {
    enabled: boolean;
    frequency: 'immediate' | 'daily' | 'weekly' | 'none';
    types: {
      mentions: boolean;
      comments: boolean;
      likes: boolean;
      follows: boolean;
      tasks: boolean;
      system: boolean;
    };
  };
  push: {
    enabled: boolean;
    sound: boolean;
    badge: boolean;
    types: {
      mentions: boolean;
      comments: boolean;
      likes: boolean;
      follows: boolean;
      tasks: boolean;
      system: boolean;
    };
  };
  sms: {
    enabled: boolean;
    emergencyOnly: boolean;
    types: {
      security: boolean;
      mentions: boolean;
      tasks: boolean;
    };
  };
  digest: {
    enabled: boolean;
    frequency: 'daily' | 'weekly' | 'monthly';
    time: string;
  };
}

interface NotificationsSectionProps {
  initialSettings?: NotificationSettings;
  onSave: (settings: NotificationSettings) => Promise<void>;
}

export function NotificationsSection({ initialSettings, onSave }: NotificationsSectionProps) {
  const [settings, setSettings] = useState<NotificationSettings>(initialSettings || {
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
  });

  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const toggleEmailEnabled = (enabled: boolean) => {
    setSettings(prev => ({ ...prev, email: { ...prev.email, enabled } }));
  };

  const setEmailFrequency = (frequency: 'immediate' | 'daily' | 'weekly' | 'none') => {
    setSettings(prev => ({ ...prev, email: { ...prev.email, frequency } }));
  };

  const toggleEmailType = (type: keyof NotificationSettings['email']['types'], value: boolean) => {
    setSettings(prev => ({
      ...prev,
      email: {
        ...prev.email,
        types: { ...prev.email.types, [type]: value }
      }
    }));
  };

  const togglePushEnabled = (enabled: boolean) => {
    setSettings(prev => ({ ...prev, push: { ...prev.push, enabled } }));
  };

  const togglePushSound = (sound: boolean) => {
    setSettings(prev => ({ ...prev, push: { ...prev.push, sound } }));
  };

  const togglePushBadge = (badge: boolean) => {
    setSettings(prev => ({ ...prev, push: { ...prev.push, badge } }));
  };

  const togglePushType = (type: keyof NotificationSettings['push']['types'], value: boolean) => {
    setSettings(prev => ({
      ...prev,
      push: {
        ...prev.push,
        types: { ...prev.push.types, [type]: value }
      }
    }));
  };

  const toggleSMSEnabled = (enabled: boolean) => {
    setSettings(prev => ({ ...prev, sms: { ...prev.sms, enabled } }));
  };

  const toggleSMSEmergencyOnly = (emergencyOnly: boolean) => {
    setSettings(prev => ({ ...prev, sms: { ...prev.sms, emergencyOnly } }));
  };

  const toggleSMSType = (type: keyof NotificationSettings['sms']['types'], value: boolean) => {
    setSettings(prev => ({
      ...prev,
      sms: {
        ...prev.sms,
        types: { ...prev.sms.types, [type]: value }
      }
    }));
  };

  const toggleDigestEnabled = (enabled: boolean) => {
    setSettings(prev => ({ ...prev, digest: { ...prev.digest, enabled } }));
  };

  const setDigestFrequency = (frequency: 'daily' | 'weekly' | 'monthly') => {
    setSettings(prev => ({ ...prev, digest: { ...prev.digest, frequency } }));
  };

  const setDigestTime = (time: string) => {
    setSettings(prev => ({ ...prev, digest: { ...prev.digest, time } }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(settings);
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to save notifications settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const checkChanges = () => {
    setHasChanges(
      JSON.stringify(settings) !== JSON.stringify(initialSettings)
    );
  };

  const notificationTypes = [
    { key: 'mentions', label: '提及', icon: UserCircleIcon },
    { key: 'comments', label: '评论', icon: MessageCircleIcon },
    { key: 'likes', label: '点赞', icon: BellIcon },
    { key: 'follows', label: '关注', icon: UserCircleIcon },
    { key: 'tasks', label: '任务', icon: BellIcon },
    { key: 'system', label: '系统', icon: ShieldIcon },
  ];

  const renderFrequencySelector = (
    value: string,
    onChange: (v: any) => void,
    options: { value: string; label: string }[]
  ) => (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
    >
      {options.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">通知设置</h2>
          <p className="text-gray-600">管理您希望接收的通知方式</p>
        </div>
        <Button
          onClick={handleSave}
          disabled={!hasChanges || isSaving}
        >
          {isSaving ? '保存中...' : '保存设置'}
        </Button>
      </div>

      {/* Email Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <EnvelopeIcon className="w-5 h-5" />
            邮件通知
          </CardTitle>
          <CardDescription>
            通过电子邮件接收通知
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-medium">启用邮件通知</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.email.enabled}
                onChange={(e) => toggleEmailEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {settings.email.enabled && (
            <>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>频率</span>
                  {renderFrequencySelector(
                    settings.email.frequency,
                    setEmailFrequency,
                    [
                      { value: 'immediate', label: '即时' },
                      { value: 'daily', label: '每日摘要' },
                      { value: 'weekly', label: '每周摘要' },
                      { value: 'none', label: '从不' }
                    ]
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">邮件类型</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {notificationTypes.map(({ key, label, icon: Icon }) => (
                    <label
                      key={key}
                      className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        checked={settings.email.types[key as keyof NotificationSettings['email']['types']]}
                        onChange={(e) => toggleEmailType(key as any, e.target.checked)}
                      />
                      <Icon className="w-4 h-4 text-gray-500" />
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Push Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellIcon className="w-5 h-5" />
            推送通知
          </CardTitle>
          <CardDescription>
            在设备上接收实时通知
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-medium">启用推送通知</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.push.enabled}
                onChange={(e) => togglePushEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {settings.push.enabled && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <span>声音</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.push.sound}
                      onChange={(e) => togglePushSound(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <span>徽章</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.push.badge}
                      onChange={(e) => togglePushBadge(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">推送类型</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {notificationTypes.map(({ key, label, icon: Icon }) => (
                    <label
                      key={key}
                      className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        checked={settings.push.types[key as keyof NotificationSettings['push']['types']]}
                        onChange={(e) => togglePushType(key as any, e.target.checked)}
                      />
                      <Icon className="w-4 h-4 text-gray-500" />
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* SMS Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircleIcon className="w-5 h-5" />
            短信通知
          </CardTitle>
          <CardDescription>
            通过短信接收重要通知（仅限紧急情况）
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-medium">启用短信通知</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.sms.enabled}
                onChange={(e) => toggleSMSEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {settings.sms.enabled && (
            <>
              <div className="flex items-center justify-between">
                <span>仅紧急通知</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.sms.emergencyOnly}
                    onChange={(e) => toggleSMSEmergencyOnly(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div>
                <h4 className="font-medium mb-3">短信类型</h4>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={settings.sms.types.security}
                      onChange={(e) => toggleSMSType('security', e.target.checked)}
                    />
                    <span>安全警报</span>
                  </label>
                  {!settings.sms.emergencyOnly && (
                    <>
                      <label className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                        <input
                          type="checkbox"
                          checked={settings.sms.types.mentions}
                          onChange={(e) => toggleSMSType('mentions', e.target.checked)}
                        />
                        <span>提及通知</span>
                      </label>
                      <label className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                        <input
                          type="checkbox"
                          checked={settings.sms.types.tasks}
                          onChange={(e) => toggleSMSType('tasks', e.target.checked)}
                        />
                        <span>任务提醒</span>
                      </label>
                    </>
                  )}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Digest Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellIcon className="w-5 h-5" />
            摘要通知
          </CardTitle>
          <CardDescription>
            定期接收活动摘要
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-medium">启用摘要通知</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.digest.enabled}
                onChange={(e) => toggleDigestEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {settings.digest.enabled && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">频率</label>
                  {renderFrequencySelector(
                    settings.digest.frequency,
                    setDigestFrequency,
                    [
                      { value: 'daily', label: '每日' },
                      { value: 'weekly', label: '每周' },
                      { value: 'monthly', label: '每月' }
                    ]
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">时间</label>
                  <input
                    type="time"
                    value={settings.digest.time}
                    onChange={(e) => setDigestTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Summary */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">通知状态</h4>
              <p className="text-sm text-gray-500">
                邮件: {settings.email.enabled ? '已启用' : '已禁止'} |
                推送: {settings.push.enabled ? '已启用' : '已禁止'} |
                短信: {settings.sms.enabled ? '已启用' : '已禁止'}
              </p>
            </div>
            {hasChanges && (
              <span className="text-sm text-blue-600">有未保存的更改</span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}