'use client';

import React, { useState } from 'react';
import { FileItem } from '../../types/file';
import { ImagePreview } from '../../components/preview/ImagePreview';
import { VideoPreview } from '../../components/preview/VideoPreview';
import { PdfPreview } from '../../components/preview/PdfPreview';

interface FilePreviewProps {
  file: FileItem;
  isOpen: boolean;
  onClose: () => void;
}

export function FilePreview({ file, isOpen, onClose }: FilePreviewProps) {
  const [videoState, setVideoState] = useState({
    isPlaying: false,
    progress: 0,
    duration: 0,
  });

  const getFileUrl = () => {
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${file.storage_path}`;
  };

  const fileExtension = file.storage_path.split('.').pop()?.toLowerCase() || '';
  const isImage = file.type === 'image' || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(fileExtension);
  const isVideo = file.type === 'video' || ['mp4', 'webm', 'ogg', 'avi', 'mov'].includes(fileExtension);
  const isPdf = fileExtension === 'pdf';

  return (
    <>
      {isImage && (
        <ImagePreview
          isOpen={isOpen}
          onClose={onClose}
          imageUrl={getFileUrl()}
          filename={file.storage_path.split('/').pop()}
        />
      )}

      {isVideo && (
        <VideoPreview
          isOpen={isOpen}
          onClose={onClose}
          videoUrl={getFileUrl()}
          filename={file.storage_path.split('/').pop()}
          onVideoStateChange={setVideoState}
        />
      )}

      {isPdf && (
        <PdfPreview
          isOpen={isOpen}
          onClose={onClose}
          pdfUrl={getFileUrl()}
          filename={file.storage_path.split('/').pop()}
        />
      )}
    </>
  );
}