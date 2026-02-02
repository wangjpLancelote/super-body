'use client';

import { useState, useEffect } from 'react';
import { PaletteIcon, SunIcon, MoonIcon, ComputerIcon, SmartphoneIcon, BellIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface AppearanceSettings {
  theme: 'light' | 'dark' | 'system';
  layout: 'sidebar' | 'topbar' | 'compact';
  compactMode: boolean;
  animations: boolean;
  sidebarCollapsed: boolean;
  fontSize: 'small' | 'medium' | 'large';
  highContrast: boolean;
  reducedMotion: boolean;
}

interface AppearanceSectionProps {
  initialSettings?: AppearanceSettings;
  onSave: (settings: AppearanceSettings) => Promise<void>;
}

export function AppearanceSection({
  initialSettings,
  onSave
}: AppearanceSectionProps) {
  const [settings, setSettings] = useState<AppearanceSettings>(initialSettings || {
    theme: 'system',
    layout: 'sidebar',
    compactMode: false,
    animations: true,
    sidebarCollapsed: false,
    fontSize: 'medium',
    highContrast: false,
    reducedMotion: false
  });

  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setHasChanges(JSON.stringify(settings) !== JSON.stringify(initialSettings));
  }, [settings, initialSettings]);

  const updateTheme = (theme: 'light' | 'dark' | 'system') => {
    setSettings(prev => ({ ...prev, theme }));
    // Apply theme to document
    if (theme === 'light') {
      document.documentElement.classList.remove('dark');
    } else if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      // System theme - let browser decide
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  const updateLayout = (layout: 'sidebar' | 'topbar' | 'compact') => {
    setSettings(prev => ({ ...prev, layout }));
  };

  const toggleSetting = (field: keyof AppearanceSettings) => {
    setSettings(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(settings);
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to save appearance settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const resetSettings = () => {
    if (initialSettings) {
      setSettings(initialSettings);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">外观设置</h2>
          <p className="text-gray-600">自定义界面外观和行为</p>
        </div>
        <div className="flex items-center gap-3">
          {hasChanges && (
            <span className="text-sm text-blue-600">有未保存的更改</span>
          )}
          <Button
            variant="outline"
            onClick={resetSettings}
            disabled={!hasChanges}
          >
            重置
          </Button>
          <Button
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
          >
            {isSaving ? '保存中...' : '保存设置'}
          </Button>
        </div>
      </div>

      {/* Theme Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PaletteIcon className="w-5 h-5" />
            主题
          </CardTitle>
          <CardDescription>
            选择您喜欢的界面主题
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {[
              { value: 'light', label: '浅色', icon: SunIcon, description: '明亮清新的界面' },
              { value: 'dark', label: '深色', icon: MoonIcon, description: '护眼的深色主题' },
              { value: 'system', label: '系统', icon: ComputerIcon, description: '跟随系统设置' },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => updateTheme(option.value as any)}
                className={`p-4 border rounded-lg text-left transition-colors ${
                  settings.theme === option.value
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <option.icon className={`w-6 h-6 ${
                    settings.theme === option.value ? 'text-blue-600' : 'text-gray-500'
                  }`} />
                  <div>
                    <div className="font-medium">{option.label}</div>
                  </div>
                </div>
                <div className="text-xs text-gray-500">{option.description}</div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Layout Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ComputerIcon className="w-5 h-5" />
            布局
          </CardTitle>
          <CardDescription>
            选择界面布局方式
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {[
              { value: 'sidebar', label: '侧边栏', icon: SmartphoneIcon, description: '传统的侧边导航' },
              { value: 'topbar', label: '顶部栏', icon: ComputerIcon, description: '顶部导航栏' },
              { value: 'compact', label: '紧凑', icon: BellIcon, description: '节省空间的紧凑布局' },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => updateLayout(option.value as any)}
                className={`p-4 border rounded-lg text-left transition-colors ${
                  settings.layout === option.value
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <option.icon className={`w-6 h-6 ${
                    settings.layout === option.value ? 'text-blue-600' : 'text-gray-500'
                  }`} />
                  <div>
                    <div className="font-medium">{option.label}</div>
                  </div>
                </div>
                <div className="text-xs text-gray-500">{option.description}</div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Display Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellIcon className="w-5 h-5" />
            显示选项
          </CardTitle>
          <CardDescription>
            自定义界面显示效果
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">紧凑模式</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.compactMode}
                    onChange={() => toggleSetting('compactMode')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <p className="text-sm text-gray-500">减少间距和边距，显示更多内容</p>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">启用动画</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.animations}
                    onChange={() => toggleSetting('animations')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <p className="text-sm text-gray-500">为界面元素添加动画效果</p>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">收起侧边栏</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.sidebarCollapsed}
                    onChange={() => toggleSetting('sidebarCollapsed')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <p className="text-sm text-gray-500">默认收起导航侧边栏</p>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">减少动画</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.reducedMotion}
                    onChange={() => toggleSetting('reducedMotion')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <p className="text-sm text-gray-500">减少动画以降低视觉干扰</p>
            </div>
          </div>

          <div className="pt-4 border-t">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium">字体大小</span>
                <p className="text-sm text-gray-500">调整界面字体大小</p>
              </div>
              <select
                value={settings.fontSize}
                onChange={(e) => setSettings(prev => ({ ...prev, fontSize: e.target.value as any }))}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="small">小</option>
                <option value="medium">中</option>
                <option value="large">大</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Accessibility Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircleIcon className="w-5 h-5" />
            无障碍选项
          </CardTitle>
          <CardDescription>
            提升可访问性，让所有人都能轻松使用
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <h4 className="font-medium">高对比度模式</h4>
                <p className="text-sm text-gray-500">使用高对比度配色方案</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.highContrast}
                  onChange={() => toggleSetting('highContrast')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">无障碍提示</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• 高对比度模式对视力障碍用户友好</li>
                <li>• 减少动画对前庭障碍患者有益</li>
                <li>• 大字体帮助低视力用户阅读</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle>预览效果</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="w-full h-32 bg-gray-100 rounded-lg mb-2"></div>
              <p className="text-sm text-gray-500">默认主题</p>
            </div>
            <div className="text-center">
              <div className="w-full h-32 bg-gray-800 text-white rounded-lg mb-2"></div>
              <p className="text-sm text-gray-500">深色主题</p>
            </div>
            <div className="text-center">
              <div className="w-full h-32 bg-gray-100 rounded-lg mb-2 flex flex-col gap-1 p-2">
                <div className="h-2 bg-gray-300 rounded"></div>
                <div className="h-2 bg-gray-300 rounded w-3/4"></div>
                <div className="h-2 bg-gray-300 rounded w-1/2"></div>
              </div>
              <p className="text-sm text-gray-500">紧凑模式</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Live Preview Status */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full">
          <CheckCircleIcon className="w-4 h-4" />
          <span className="text-sm">实时预览已启用</span>
        </div>
      </div>
    </div>
  );
}