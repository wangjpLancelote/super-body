import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  Linking,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Video } from 'expo-av';
import { supabase } from '../lib/supabase';
import { useAuth } from '../auth/AuthProvider';

interface FileItem {
  id: string;
  user_id: string;
  type: 'image' | 'video' | 'other';
  storage_path: string;
  created_at: string;
}

type PickedAsset = {
  uri: string;
  name: string;
  mimeType?: string;
};

const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'heic'];
const VIDEO_EXTENSIONS = ['mp4', 'mov', 'm4v', 'webm'];

function getFileNameFromUri(uri: string) {
  const parts = uri.split('/');
  return parts[parts.length - 1] || `file-${Date.now()}`;
}

function inferFileType(mimeType?: string, name?: string): FileItem['type'] {
  if (mimeType?.startsWith('image/')) return 'image';
  if (mimeType?.startsWith('video/')) return 'video';

  const ext = name?.split('.').pop()?.toLowerCase() || '';
  if (IMAGE_EXTENSIONS.includes(ext)) return 'image';
  if (VIDEO_EXTENSIONS.includes(ext)) return 'video';
  return 'other';
}

export default function FilesScreen() {
  const { user, signOut } = useAuth();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});

  const fetchFiles = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('files')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error) {
      setFiles((data ?? []) as FileItem[]);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel('files-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'files',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchFiles();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchFiles, user]);

  useEffect(() => {
    const loadSignedUrls = async () => {
      const updates: Record<string, string> = {};
      for (const file of files) {
        if (signedUrls[file.id]) continue;
        const { data, error } = await supabase.storage
          .from('files')
          .createSignedUrl(file.storage_path, 60 * 10);
        if (!error && data?.signedUrl) {
          updates[file.id] = data.signedUrl;
        }
      }
      if (Object.keys(updates).length > 0) {
        setSignedUrls((prev) => ({ ...prev, ...updates }));
      }
    };

    if (files.length) {
      loadSignedUrls();
    }
  }, [files, signedUrls]);

  const uploadAsset = async (asset: PickedAsset) => {
    if (!user) return;
    setUploading(true);

    try {
      const fileId = `file-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const fileType = inferFileType(asset.mimeType, asset.name);
      const storagePath = `files/${user.id}/${fileId}/${asset.name}`;

      const { error: insertError } = await supabase.from('files').insert({
        id: fileId,
        user_id: user.id,
        type: fileType,
        storage_path: storagePath,
      });

      if (insertError) {
        Alert.alert('Upload failed', insertError.message);
        return;
      }

      const response = await fetch(asset.uri);
      const blob = await response.blob();
      const { error: uploadError } = await supabase.storage
        .from('files')
        .upload(storagePath, blob, {
          contentType: asset.mimeType || 'application/octet-stream',
          upsert: false,
        });

      if (uploadError) {
        await supabase.from('files').delete().eq('id', fileId);
        Alert.alert('Upload failed', uploadError.message);
        return;
      }

      Alert.alert('Success', 'File uploaded successfully!');
      fetchFiles();
    } catch (error) {
      Alert.alert('Error', 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const pickMedia = async () => {
    if (uploading) return;
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Please grant media library access.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      quality: 0.8,
      allowsMultipleSelection: false,
    });

    if (result.canceled) return;
    const asset = result.assets[0];
    if (!asset?.uri) return;

    await uploadAsset({
      uri: asset.uri,
      name: asset.fileName || getFileNameFromUri(asset.uri),
      mimeType: asset.mimeType,
    });
  };

  const pickDocument = async () => {
    if (uploading) return;
    const result = await DocumentPicker.getDocumentAsync({
      copyToCacheDirectory: true,
      multiple: false,
    });

    if (result.canceled || !result.assets?.length) return;
    const asset = result.assets[0];
    if (!asset.uri) return;

    await uploadAsset({
      uri: asset.uri,
      name: asset.name || getFileNameFromUri(asset.uri),
      mimeType: asset.mimeType,
    });
  };

  const handleDelete = async (file: FileItem) => {
    Alert.alert('Delete File', 'Are you sure you want to delete this file?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await supabase.storage.from('files').remove([file.storage_path]);
          await supabase.from('files').delete().eq('id', file.id);
          setPreviewFile(null);
          fetchFiles();
        },
      },
    ]);
  };

  const openFile = async (file: FileItem) => {
    let url = signedUrls[file.id];
    if (!url) {
      const { data, error } = await supabase.storage
        .from('files')
        .createSignedUrl(file.storage_path, 60 * 10);
      if (!error && data?.signedUrl) {
        url = data.signedUrl;
        setSignedUrls((prev) => ({ ...prev, [file.id]: data.signedUrl }));
      }
    }

    if (!url) {
      Alert.alert('File unavailable', 'Please try again.');
      return;
    }
    await Linking.openURL(url);
  };

  const renderFileItem = ({ item }: { item: FileItem }) => {
    const fileUrl = signedUrls[item.id];
    const fileName = item.storage_path.split('/').pop();

    return (
      <TouchableOpacity style={styles.fileCard} onPress={() => setPreviewFile(item)}>
        {item.type === 'image' && fileUrl ? (
          <Image source={{ uri: fileUrl }} style={styles.imagePreview} />
        ) : (
          <View style={styles.fileIcon}>
            <Text style={styles.fileIconText}>{item.type === 'video' ? '🎬' : '📄'}</Text>
          </View>
        )}
        <View style={styles.fileInfo}>
          <Text style={styles.fileName}>{fileName}</Text>
          <Text style={styles.fileMeta}>
            {new Date(item.created_at).toLocaleDateString()} · {item.type.toUpperCase()}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const previewUrl = useMemo(() => {
    if (!previewFile) return null;
    return signedUrls[previewFile.id];
  }, [previewFile, signedUrls]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Files</Text>
        <TouchableOpacity style={styles.signOut} onPress={signOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.composer}>
        <TouchableOpacity style={styles.uploadButton} onPress={pickMedia} disabled={uploading}>
          <Text style={styles.uploadButtonText}>{uploading ? 'Uploading...' : 'Upload Photo/Video'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.uploadButtonSecondary} onPress={pickDocument} disabled={uploading}>
          <Text style={styles.uploadButtonSecondaryText}>Upload File</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <Text style={styles.loading}>Loading files...</Text>
      ) : (
        <FlatList
          data={files}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 120 }}
          renderItem={renderFileItem}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No files yet</Text>
              <Text style={styles.emptySubtitle}>Upload your first file to get started.</Text>
            </View>
          }
        />
      )}

      <Modal visible={!!previewFile} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>File Preview</Text>
              <TouchableOpacity onPress={() => setPreviewFile(null)}>
                <Text style={styles.modalClose}>Close</Text>
              </TouchableOpacity>
            </View>

            {previewFile?.type === 'image' && previewUrl ? (
              <Image source={{ uri: previewUrl }} style={styles.previewImage} />
            ) : previewFile?.type === 'video' && previewUrl ? (
              <Video
                source={{ uri: previewUrl }}
                style={styles.previewVideo}
                useNativeControls
                resizeMode="contain"
              />
            ) : (
              <View style={styles.previewPlaceholder}>
                <Text style={styles.previewPlaceholderText}>Preview not available</Text>
              </View>
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalButton} onPress={() => previewFile && openFile(previewFile)}>
                <Text style={styles.modalButtonText}>Open</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalDelete]}
                onPress={() => previewFile && handleDelete(previewFile)}
              >
                <Text style={[styles.modalButtonText, styles.modalDeleteText]}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0F14',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#F5F7FA',
  },
  signOut: {
    borderWidth: 1,
    borderColor: '#2E3A48',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  signOutText: {
    color: '#E2E8F0',
    fontSize: 12,
    fontWeight: '600',
  },
  composer: {
    backgroundColor: '#121823',
    borderRadius: 16,
    padding: 16,
    marginBottom: 18,
  },
  uploadButton: {
    height: 44,
    borderRadius: 10,
    backgroundColor: '#6EE7B7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  uploadButtonText: {
    color: '#0B0F14',
    fontWeight: '700',
  },
  uploadButtonSecondary: {
    height: 44,
    borderRadius: 10,
    backgroundColor: '#1F2937',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadButtonSecondaryText: {
    color: '#F5F7FA',
    fontWeight: '700',
  },
  loading: {
    color: '#9AA3AF',
    marginTop: 20,
  },
  fileCard: {
    backgroundColor: '#131B26',
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  imagePreview: {
    width: 56,
    height: 56,
    borderRadius: 12,
  },
  fileIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#0B0F14',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileIconText: {
    fontSize: 22,
  },
  fileInfo: {
    marginLeft: 12,
    flex: 1,
  },
  fileName: {
    color: '#F5F7FA',
    fontSize: 14,
    fontWeight: '600',
  },
  fileMeta: {
    color: '#9AA3AF',
    fontSize: 12,
    marginTop: 4,
  },
  emptyState: {
    alignItems: 'center',
    padding: 24,
  },
  emptyTitle: {
    color: '#F5F7FA',
    fontSize: 16,
    fontWeight: '600',
  },
  emptySubtitle: {
    color: '#9AA3AF',
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.92)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    color: '#F5F7FA',
    fontSize: 16,
    fontWeight: '700',
  },
  modalClose: {
    color: '#9AA3AF',
    fontSize: 12,
  },
  previewImage: {
    width: '100%',
    height: 240,
    borderRadius: 12,
    marginBottom: 12,
  },
  previewVideo: {
    width: '100%',
    height: 240,
    borderRadius: 12,
    marginBottom: 12,
  },
  previewPlaceholder: {
    height: 200,
    borderRadius: 12,
    backgroundColor: '#0B0F14',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  previewPlaceholderText: {
    color: '#9AA3AF',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
  },
  modalButton: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#1F2937',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonText: {
    color: '#F5F7FA',
    fontWeight: '700',
  },
  modalDelete: {
    backgroundColor: '#2D1B1B',
  },
  modalDeleteText: {
    color: '#FCA5A5',
  },
});
