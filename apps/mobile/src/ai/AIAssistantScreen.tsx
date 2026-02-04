import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { chatWithAI, searchDocuments } from './aiService';
import { useAuth } from '../auth/AuthProvider';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function AIAssistantScreen() {
  const { signOut } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        '你好！我是你的 AI 助手。你可以在这里提问，或在下方搜索你的文档。',
    },
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<
    Array<{ id: string; title?: string; content?: string; similarity?: number }>
  >([]);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || sending) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmed,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setSending(true);

    const response = await chatWithAI(trimmed);
    const assistantMessage: ChatMessage = {
      id: `assistant-${Date.now()}`,
      role: 'assistant',
      content: response?.response || '抱歉，我暂时无法回答这个问题。',
    };

    setMessages((prev) => [...prev, assistantMessage]);
    setSending(false);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim() || searchLoading) return;

    setSearchLoading(true);
    const results = await searchDocuments(searchQuery.trim());
    setSearchResults(results.documents || []);
    setSearchLoading(false);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: 'padding', android: undefined })}
      style={styles.container}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>AI Assistant</Text>
          <Text style={styles.subtitle}>Dry-run enabled for all actions</Text>
        </View>
        <TouchableOpacity style={styles.signOut} onPress={signOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.chatCard}>
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.chatContent}
          keyboardShouldPersistTaps="handled"
        >
          {messages.map((message) => (
            <View
              key={message.id}
              style={[
                styles.messageBubble,
                message.role === 'user'
                  ? styles.messageUser
                  : styles.messageAssistant,
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  message.role === 'user'
                    ? styles.messageTextUser
                    : styles.messageTextAssistant,
                ]}
              >
                {message.content}
              </Text>
            </View>
          ))}
          {sending ? (
            <View style={styles.messageBubble}>
              <ActivityIndicator color="#8CD98C" />
            </View>
          ) : null}
        </ScrollView>
      </View>

      <View style={styles.composer}>
        <TextInput
          style={styles.input}
          placeholder="Ask something..."
          placeholderTextColor="#9BA0A8"
          value={input}
          onChangeText={setInput}
          multiline
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchCard}>
        <Text style={styles.searchTitle}>Document Search</Text>
        <Text style={styles.searchSubtitle}>Search your knowledge base</Text>
        <View style={styles.searchRow}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search documents"
            placeholderTextColor="#9BA0A8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
          />
          <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
            <Text style={styles.searchButtonText}>Search</Text>
          </TouchableOpacity>
        </View>

        {searchLoading ? (
          <ActivityIndicator color="#8CD98C" style={{ marginTop: 12 }} />
        ) : (
          <View style={styles.resultsList}>
            {searchResults.length === 0 ? (
              <Text style={styles.emptyResults}>No results yet.</Text>
            ) : (
              searchResults.map((doc) => (
                <View key={doc.id} style={styles.resultCard}>
                  <Text style={styles.resultTitle}>{doc.title || 'Untitled Document'}</Text>
                  <Text style={styles.resultContent} numberOfLines={3}>
                    {doc.content || 'No preview available.'}
                  </Text>
                  {typeof doc.similarity === 'number' ? (
                    <Text style={styles.resultMeta}>
                      Similarity: {(doc.similarity * 100).toFixed(1)}%
                    </Text>
                  ) : null}
                </View>
              ))
            )}
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
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
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#F5F7FA',
  },
  subtitle: {
    fontSize: 12,
    color: '#9AA3AF',
    marginTop: 4,
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
  chatCard: {
    backgroundColor: '#121823',
    borderRadius: 16,
    padding: 12,
    maxHeight: 300,
  },
  chatContent: {
    paddingBottom: 12,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    maxWidth: '85%',
  },
  messageUser: {
    backgroundColor: '#8CD98C',
    alignSelf: 'flex-end',
  },
  messageAssistant: {
    backgroundColor: '#1F2937',
    alignSelf: 'flex-start',
  },
  messageText: {
    fontSize: 14,
  },
  messageTextUser: {
    color: '#0B0F14',
  },
  messageTextAssistant: {
    color: '#F5F7FA',
  },
  composer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  input: {
    flex: 1,
    minHeight: 44,
    borderRadius: 12,
    backgroundColor: '#0B0F14',
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#F5F7FA',
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  sendButton: {
    width: 80,
    borderRadius: 12,
    backgroundColor: '#8CD98C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonText: {
    color: '#0B0F14',
    fontWeight: '700',
  },
  searchCard: {
    marginTop: 16,
    backgroundColor: '#121823',
    borderRadius: 16,
    padding: 16,
  },
  searchTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F5F7FA',
  },
  searchSubtitle: {
    fontSize: 12,
    color: '#9AA3AF',
    marginBottom: 12,
  },
  searchRow: {
    flexDirection: 'row',
    gap: 10,
  },
  searchInput: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#0B0F14',
    paddingHorizontal: 12,
    color: '#F5F7FA',
  },
  searchButton: {
    height: 44,
    borderRadius: 10,
    paddingHorizontal: 16,
    backgroundColor: '#6EE7B7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchButtonText: {
    color: '#0B0F14',
    fontWeight: '700',
  },
  resultsList: {
    marginTop: 12,
  },
  emptyResults: {
    color: '#9AA3AF',
    fontSize: 12,
  },
  resultCard: {
    backgroundColor: '#0B0F14',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  resultTitle: {
    color: '#F5F7FA',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  resultContent: {
    color: '#9AA3AF',
    fontSize: 12,
    marginBottom: 6,
  },
  resultMeta: {
    color: '#6EE7B7',
    fontSize: 11,
  },
});
