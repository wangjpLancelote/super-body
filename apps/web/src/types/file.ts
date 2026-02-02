export interface FileItem {
  id: string;
  user_id: string;
  type: FileType;
  storage_path: string;
  created_at: string;
  updated_at: string;
}

export type FileType = 'image' | 'video' | 'other';

export interface FileUploadResult {
  path: string;
  error?: string;
}

export interface FileFormData {
  file: File;
  type: FileType;
}

export interface FileStats {
  total: number;
  byType: Record<FileType, number>;
}

export interface FileUrlOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
}