'use client';

import { useState, useRef } from 'react';
import { XMarkIcon, DownloadIcon, FileTextIcon, TableCellsIcon, DocumentTextIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';

interface ExportOptions {
  format: 'json' | 'csv' | 'pdf' | 'excel';
  includeImages: boolean;
  includeMetadata: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
  selectedTypes?: string[];
  customFields?: string[];
}

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (options: ExportOptions) => void;
}

export function ExportModal({ isOpen, onClose, onExport }: ExportModalProps) {
  const [format, setFormat] = useState<'json' | 'csv' | 'pdf' | 'excel'>('json');
  const [includeImages, setIncludeImages] = useState(false);
  const [includeMetadata, setIncludeMetadata] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [customFields, setCustomFields] = useState<string[]>([]);
  const [exportName, setExportName] = useState('export');
  const [isExporting, setIsExporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const availableTypes = ['documents', 'tasks', 'files', 'ai-data'];
  const defaultFields = ['id', 'title', 'description', 'created_at', 'updated_at'];
  const optionalFields = ['tags', 'priority', 'status', 'file_size', 'author'];

  const toggleType = (type: string) => {
    if (selectedTypes.includes(type)) {
      setSelectedTypes(selectedTypes.filter(t => t !== type));
    } else {
      setSelectedTypes([...selectedTypes, type]);
    }
  };

  const toggleField = (field: string) => {
    if (customFields.includes(field)) {
      setCustomFields(customFields.filter(f => f !== field));
    } else {
      setCustomFields([...customFields, field]);
    }
  };

  const handleExport = async () => {
    if (selectedTypes.length === 0) {
      alert('请至少选择一种数据类型');
      return;
    }

    setIsExporting(true);
    const options: ExportOptions = {
      format,
      includeImages,
      includeMetadata,
      selectedTypes,
      customFields
    };

    if (startDate && endDate) {
      options.dateRange = { start: startDate, end: endDate };
    }

    try {
      await onExport(options);
      onClose();
    } catch (error) {
      console.error('Export failed:', error);
      alert('导出失败，请重试');
    } finally {
      setIsExporting(false);
    }
  };

  const handleClose = () => {
    if (!isExporting) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">导出数据</h2>
          <button
            onClick={handleClose}
            disabled={isExporting}
            className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Export Name */}
          <div>
            <Label htmlFor="export-name" className="block text-sm font-medium text-gray-700 mb-2">
              导出文件名
            </Label>
            <Input
              id="export-name"
              value={exportName}
              onChange={(e) => setExportName(e.target.value)}
              placeholder="输入导出文件名"
            />
          </div>

          {/* Format Selection */}
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-3">导出格式</Label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'json', label: 'JSON', icon: FileTextIcon, description: '结构化数据格式' },
                { value: 'csv', label: 'CSV', icon: TableCellsIcon, description: '表格数据格式' },
                { value: 'pdf', label: 'PDF', icon: DocumentTextIcon, description: '文档格式' },
                { value: 'excel', label: 'Excel', icon: TableCellsIcon, description: '电子表格' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setFormat(option.value as any)}
                  className={`p-4 border rounded-lg text-left transition-colors ${
                    format === option.value
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <option.icon className={`w-5 h-5 ${
                      format === option.value ? 'text-blue-600' : 'text-gray-500'
                    }`} />
                    <div>
                      <div className="font-medium">{option.label}</div>
                      <div className="text-xs text-gray-500">{option.description}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Data Types */}
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-3">选择数据类型</Label>
            <div className="grid grid-cols-2 gap-3">
              {availableTypes.map((type) => (
                <label
                  key={type}
                  className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                >
                  <Checkbox
                    checked={selectedTypes.includes(type)}
                    onCheckedChange={() => toggleType(type)}
                  />
                  <span className="font-medium capitalize">
                    {type === 'documents' && '文档'}
                    {type === 'tasks' && '任务'}
                    {type === 'files' && '文件'}
                    {type === 'ai-data' && 'AI数据'}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-3">日期范围</Label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="start-date" className="block text-xs text-gray-500 mb-1">开始日期</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="end-date" className="block text-xs text-gray-500 mb-1">结束日期</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Export Options */}
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-3">导出选项</Label>
            <div className="space-y-3">
              <label className="flex items-center space-x-3">
                <Checkbox
                  checked={includeImages}
                  onCheckedChange={(checked) => setIncludeImages(!!checked)}
                />
                <span>包含图片</span>
              </label>
              <label className="flex items-center space-x-3">
                <Checkbox
                  checked={includeMetadata}
                  onCheckedChange={(checked) => setIncludeMetadata(!!checked)}
                />
                <span>包含元数据</span>
              </label>
            </div>
          </div>

          {/* Custom Fields */}
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-3">自定义字段</Label>
            <div className="space-y-2">
              <p className="text-sm text-gray-500 mb-2">选择要包含的字段（默认包含基础字段）</p>
              <div className="grid grid-cols-2 gap-2">
                {optionalFields.map((field) => (
                  <label
                    key={field}
                    className="flex items-center space-x-2 p-2 border rounded cursor-pointer hover:bg-gray-50"
                  >
                    <Checkbox
                      checked={customFields.includes(field)}
                      onCheckedChange={() => toggleField(field)}
                    />
                    <span className="text-sm capitalize">
                      {field === 'tags' && '标签'}
                      {field === 'priority' && '优先级'}
                      {field === 'status' && '状态'}
                      {field === 'file_size' && '文件大小'}
                      {field === 'author' && '作者'}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 p-6 border-t bg-gray-50">
          <Button variant="outline" onClick={handleClose} disabled={isExporting}>
            取消
          </Button>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">
              将导出 {selectedTypes.length} 种数据类型
            </span>
            <Button
              onClick={handleExport}
              disabled={isExporting || selectedTypes.length === 0}
              className="flex items-center gap-2"
            >
              <ArrowDownTrayIcon className="w-4 h-4" />
              {isExporting ? '导出中...' : '开始导出'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}