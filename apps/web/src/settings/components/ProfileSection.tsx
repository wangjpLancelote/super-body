'use client';

import { useState } from 'react';
import { UserCircleIcon, CameraIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface ProfileSectionProps {
  initialData?: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    bio: string;
    avatar?: string;
  };
  onSave: (data: any) => Promise<void>;
}

export function ProfileSection({ initialData, onSave }: ProfileSectionProps) {
  const [data, setData] = useState({
    firstName: initialData?.firstName || '',
    lastName: initialData?.lastName || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    bio: initialData?.bio || '',
    avatar: initialData?.avatar || ''
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showAvatarUpload, setShowAvatarUpload] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const handleInputChange = (field: keyof typeof data, value: string) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(data);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (initialData) {
      setData({
        firstName: initialData.firstName,
        lastName: initialData.lastName,
        email: initialData.email,
        phone: initialData.phone,
        bio: initialData.bio,
        avatar: initialData.avatar
      });
    }
    setIsEditing(false);
    setShowAvatarUpload(false);
    setAvatarPreview(null);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      // In a real app, you would upload this to a server
      setData(prev => ({ ...prev, avatar: file.name }));
    }
  };

  const getInitials = () => {
    return `${data.firstName.charAt(0)}${data.lastName.charAt(0)}`.toUpperCase();
  };

  if (!isEditing) {
    return (
      <div className="space-y-6">
        {/* Avatar Section */}
        <div className="flex items-center space-x-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
              {data.avatar ? (
                <img
                  src={data.avatar}
                  alt="Avatar"
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                getInitials()
              )}
            </div>
            <button
              onClick={() => setShowAvatarUpload(!showAvatarUpload)}
              className="absolute -bottom-1 -right-1 bg-white border border-gray-300 rounded-full p-1 shadow-sm hover:bg-gray-50"
            >
              <CameraIcon className="h-4 w-4 text-gray-600" />
            </button>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {data.firstName} {data.lastName}
            </h2>
            <p className="text-gray-600">{data.email}</p>
            <Button
              onClick={() => setIsEditing(true)}
              className="mt-2"
            >
              编辑资料
            </Button>
          </div>
        </div>

        {/* Quick Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <Label className="text-sm font-medium text-gray-500">电话</Label>
            <p className="text-gray-900">{data.phone || '未设置'}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <Label className="text-sm font-medium text-gray-500">邮箱</Label>
            <p className="text-gray-900">{data.email}</p>
          </div>
        </div>

        {/* Bio */}
        {data.bio && (
          <div className="p-4 bg-gray-50 rounded-lg">
            <Label className="text-sm font-medium text-gray-500">个人简介</Label>
            <p className="text-gray-900">{data.bio}</p>
          </div>
        )}

        {/* Avatar Upload Modal */}
        {showAvatarUpload && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl w-96 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">上传头像</h3>
                <button
                  onClick={() => setShowAvatarUpload(false)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="avatar-upload">选择图片</Label>
                  <Input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    支持 JPG, PNG, GIF 格式，最大 5MB
                  </p>
                </div>
                {avatarPreview && (
                  <div className="flex justify-center">
                    <img
                      src={avatarPreview}
                      alt="Avatar preview"
                      className="w-24 h-24 rounded-full object-cover"
                    />
                  </div>
                )}
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowAvatarUpload(false)}>
                    取消
                  </Button>
                  <Button onClick={() => setIsEditing(true)}>
                    保存头像
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">编辑个人资料</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleCancel}>
            取消
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? '保存中...' : '保存'}
          </Button>
        </div>
      </div>

      {/* Avatar Section */}
      <div className="flex items-center space-x-6">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Avatar preview"
                className="w-full h-full rounded-full object-cover"
              />
            ) : data.avatar ? (
              <img
                src={data.avatar}
                alt="Avatar"
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              getInitials()
            )}
          </div>
          <button
            onClick={() => setShowAvatarUpload(!showAvatarUpload)}
            className="absolute -bottom-1 -right-1 bg-white border border-gray-300 rounded-full p-1 shadow-sm hover:bg-gray-50"
          >
            <CameraIcon className="h-4 w-4 text-gray-600" />
          </button>
        </div>
        <div>
          <p className="text-sm text-gray-500">点击相机图标更换头像</p>
        </div>
      </div>

      {/* Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName">名字</Label>
          <Input
            id="firstName"
            value={data.firstName}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="lastName">姓氏</Label>
          <Input
            id="lastName"
            value={data.lastName}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="email">邮箱</Label>
          <Input
            id="email"
            type="email"
            value={data.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="phone">电话</Label>
          <Input
            id="phone"
            type="tel"
            value={data.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="bio">个人简介</Label>
        <Textarea
          id="bio"
          value={data.bio}
          onChange={(e) => handleInputChange('bio', e.target.value)}
          placeholder="介绍一下您自己..."
          rows={4}
        />
      </div>
    </div>
  );
}