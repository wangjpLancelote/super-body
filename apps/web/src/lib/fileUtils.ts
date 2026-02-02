import { FileType } from '../types/file';

export function detectFileType(file: File): FileType {
  const mimeType = file.type.toLowerCase();
  const extension = file.name.split('.').pop()?.toLowerCase() || '';

  // Image types
  if (
    mimeType.startsWith('image/') ||
    extension === 'jpg' ||
    extension === 'jpeg' ||
    extension === 'png' ||
    extension === 'gif' ||
    extension === 'webp' ||
    extension === 'bmp' ||
    extension === 'svg'
  ) {
    return 'image';
  }

  // Video types
  if (
    mimeType.startsWith('video/') ||
    extension === 'mp4' ||
    extension === 'webm' ||
    extension === 'ogg' ||
    extension === 'avi' ||
    extension === 'mov'
  ) {
    return 'video';
  }

  // PDF
  if (mimeType === 'application/pdf' || extension === 'pdf') {
    return 'other';
  }

  // Document types
  if (
    mimeType.startsWith('text/') ||
    extension === 'txt' ||
    extension === 'md' ||
    extension === 'doc' ||
    extension === 'docx' ||
    extension === 'xls' ||
    extension === 'xlsx' ||
    extension === 'ppt' ||
    extension === 'pptx'
  ) {
    return 'other';
  }

  // Default
  return 'other';
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || '';
}