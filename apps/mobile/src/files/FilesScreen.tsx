import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../auth/AuthProvider';

interface FileItem {
  id: string;
  user_id: string;
  type: 'image' | 'video' | 'other';
  storage_path: string;
  created_at: string;
}

export default function FilesScreen() {
  const { user, signOut } = useAuth();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);

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
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchFiles, user]);

  const selectFile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase.storage
        .from('files')
        .upload(`${user.id}/${Date.now()}`, new Blob(['test content']), {
          contentType: 'text/plain',
        });

      if (error) {
        Alert.alert('Upload failed', error.message);
        return;
      }

      await supabase.from('files').insert({
        user_id: user.id,
        type: 'other',
        storage_path: data.path,
      });

      Alert.alert('Success', 'File uploaded successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to upload file');
    }
  };

  const getFileUrl = (filePath: string) => {
    return `${supabase.supabaseUrl}/storage/v1/object/public/files/${filePath}`;
  };

  const renderFileItem = ({ item }: { item: FileItem }) => {
    const fileUrl = getFileUrl(item.storage_path);

    if (item.type === 'image') {
      return (
        <View style={styles.fileCard}>
          <Image
            source={{ uri: fileUrl }}
            style={styles.imagePreview}
            resizeMode="cover"
          />
          <View style={styles.fileInfo}>
            <Text style={styles.fileName}>
              {item.storage_path.split('/').pop()}
            </Text>
            <Text style={styles.fileMeta}>
              {new Date(item.created_at).toLocaleDateString()}
            </Text>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.fileCard}>
        <View style={styles.fileIcon}>
          <Text style={styles.fileIconText}>📄</Text>
        </View>
        <View style={styles.fileInfo}>
          <Text style={styles.fileName}>
            {item.storage_path.split('/').pop()}
          </Text>
          <Text style={styles.fileMeta}>
            {new Date(item.created_at).toLocaleDateString()}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Files</Text>
        <TouchableOpacity style={styles.signOut} onPress={signOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.composer}>
        <TouchableOpacity style={styles.uploadButton} onPress={selectFile}>
          <Text style={styles.uploadButtonText}>Upload File</Text>
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
        />
      )}
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
  },
  uploadButtonText: {
    color: '#0B0F14',
    fontWeight: '700',
  },
  loading: {
    color: '#B8C0CC',
    textAlign: 'center',
    marginTop: 20,
  },
  fileCard: {
    backgroundColor: '#131B26',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  imagePreview: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginRight: 16,
  },
  fileIcon: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  fileIconText: {
    fontSize: 24,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    color: '#F5F7FA',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  fileMeta: {
    color: '#6B7280',
    fontSize: 12,
  },
});