'use client';

import { useState } from 'react';
import { DatabaseIcon, DownloadIcon, TrashIcon, CloudIcon, ShieldCheckIcon, AlertTriangleIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface DataUsage {
  totalSize: number;
  documentsSize: number;
  filesSize: number;
  backupsSize: number;
  lastSync: string;
}

interface DataSectionProps {
  dataUsage?: DataUsage;
  onExport: (format: 'json' | 'csv' | 'pdf' | 'excel') => Promise<void>;
  onDeleteAccount: () => Promise<void>;
  onClearCache: () => Promise<void>;
}

export function DataSection({
  dataUsage,
  onExport,
  onDeleteAccount,
  onClearCache
}: DataSectionProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [isClearingCache, setIsClearingCache] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<'json' | 'csv' | 'pdf' | 'excel'>('json');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await onExport(selectedFormat);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getExportIcon = (format: string) => {
    switch (format) {
      case 'json':
        return (
          <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center">
            <span className="text-xs font-bold text-green-600">JS</span>
          </div>
        );
      case 'csv':
        return (
          <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
            <span className="text-xs font-bold text-blue-600">CSV</span>
          </div>
        );
      case 'pdf':
        return (
          <div className="w-8 h-8 bg-red-100 rounded flex items-center justify-center">
            <span className="text-xs font-bold text-red-600">PDF</span>
          </div>
        );
      case 'excel':
        return (
          <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center">
            <span className="text-xs font-bold text-green-600">XLS</span>
          </div>
        );
      default:
        return <DownloadIcon className="w-8 h-8 text-gray-600" />;
    }
  };

  const defaultDataUsage: DataUsage = {
    totalSize: 1024 * 1024 * 1024, // 1GB
    documentsSize: 512 * 1024 * 1024, // 512MB
    filesSize: 256 * 1024 * 1024, // 256MB
    backupsSize: 256 * 1024 * 1024, // 256MB
    lastSync: new Date().toISOString()
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">数据管理</h2>
        <p className="text-gray-600">管理您的数据导出、存储和使用情况</p>
      </div>

      {/* Data Usage Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DatabaseIcon className="w-5 h-5" />
            存储使用情况
          </CardTitle>
          <CardDescription>
            查看您的数据存储使用情况
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">总存储空间</span>
              <span className="font-semibold">
                {formatFileSize(dataUsage?.totalSize || defaultDataUsage.totalSize)}
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm">文档</span>
                </div>
                <span className="text-sm font-medium">
                  {formatFileSize(dataUsage?.documentsSize || defaultDataUsage.documentsSize)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm">文件</span>
                </div>
                <span className="text-sm font-medium">
                  {formatFileSize(dataUsage?.filesSize || defaultDataUsage.filesSize)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span className="text-sm">备份</span>
                </div>
                <span className="text-sm font-medium">
                  {formatFileSize(dataUsage?.backupsSize || defaultDataUsage.backupsSize)}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">上次同步</span>
                <span className="text-sm">
                  {dataUsage?.lastSync
                    ? new Date(dataUsage.lastSync).toLocaleString()
                    : new Date().toLocaleString()
                  }
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Export */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DownloadIcon className="w-5 h-5" />
            数据导出
          </CardTitle>
          <CardDescription>
            导出您的个人数据以便备份或迁移
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { value: 'json', label: 'JSON', description: '结构化数据' },
              { value: 'csv', label: 'CSV', description: '表格数据' },
              { value: 'pdf', label: 'PDF', description: '文档格式' },
              { value: 'excel', label: 'Excel', description: '电子表格' },
            ].map((format) => (
              <button
                key={format.value}
                onClick={() => setSelectedFormat(format.value as any)}
                className={`p-4 border rounded-lg text-left transition-colors ${
                  selectedFormat === format.value
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  {getExportIcon(format.value)}
                  <div className="font-medium">{format.label}</div>
                </div>
                <div className="text-xs text-gray-500">{format.description}</div>
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <div>
              <p className="text-sm text-gray-600">
                将导出所有个人数据，包括文档、任务、文件等
              </p>
              <p className="text-xs text-gray-500 mt-1">
                文件大小预计: 100MB - 1GB
              </p>
            </div>
            <Button
              onClick={handleExport}
              disabled={isExporting}
              className="flex items-center gap-2"
            >
              <DownloadIcon className="w-4 h-4" />
              {isExporting ? '导出中...' : `导出为 ${selectedFormat.toUpperCase()}`}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Cache Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CloudIcon className="w-5 h-5" />
            缓存管理
          </CardTitle>
          <CardDescription>
            管理应用缓存以释放存储空间
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-gray-900">156</div>
                <div className="text-sm text-gray-500">缓存文件</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">42MB</div>
                <div className="text-sm text-gray-500">缓存大小</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">7天</div>
                <div className="text-sm text-gray-500">平均年龄</div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-sm text-gray-600">清理缓存将删除临时文件</span>
              <Button
                variant="outline"
                onClick={onClearCache}
                disabled={isClearingCache}
              >
                {isClearingCache ? '清理中...' : '清理缓存'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Data */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheckIcon className="w-5 h-5" />
            账户数据
          </CardTitle>
          <CardDescription>
            管理您的账户数据和安全设置
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                  <DatabaseIcon className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <div className="font-medium">数据备份</div>
                  <div className="text-sm text-gray-500">自动备份您的数据</div>
                </div>
              </div>
              <Button variant="outline" size="sm">配置</Button>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center">
                  <ShieldCheckIcon className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <div className="font-medium">数据加密</div>
                  <div className="text-sm text-gray-500">端到端加密保护</div>
                </div>
              </div>
              <span className="text-sm text-green-600 font-medium">已启用</span>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-100 rounded flex items-center justify-center">
                  <CloudIcon className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <div className="font-medium">数据迁移</div>
                  <div className="text-sm text-gray-500">迁移到其他服务</div>
                </div>
              </div>
              <Button variant="outline" size="sm">迁移</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangleIcon className="w-5 h-5" />
            危险区域
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 border border-red-200 rounded-lg bg-red-50">
              <h4 className="font-medium text-gray-900 mb-2">删除账户</h4>
              <p className="text-sm text-gray-600 mb-4">
                永久删除您的账户和所有相关数据。此操作无法撤销，所有数据将被永久丢失。
              </p>
              {showDeleteConfirm ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="confirm-delete"
                      className="rounded border-gray-300"
                    />
                    <label htmlFor="confirm-delete" className="text-sm">
                      我确认要永久删除我的账户和所有数据
                    </label>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowDeleteConfirm(false)}
                    >
                      取消
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={onDeleteAccount}
                      disabled={isDeletingAccount}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {isDeletingAccount ? '删除中...' : '确认删除账户'}
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  variant="destructive"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  删除账户
                </Button>
              )}
            </div>

            <div className="p-4 border border-yellow-200 rounded-lg bg-yellow-50">
              <h4 className="font-medium text-gray-900 mb-2">永久删除所有数据</h4>
              <p className="text-sm text-gray-600 mb-4">
                删除所有个人数据但保留账户（可用于重新开始）。
              </p>
              <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-50">
                删除所有数据
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}