import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../auth/AuthProvider';

type Todo = {
  id: string;
  title: string;
  description: string | null;
  status: 'todo' | 'doing' | 'done';
  created_at: string;
};

export default function TodosScreen() {
  const { user, role, signOut } = useAuth();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchTodos = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error) {
      setTodos((data ?? []) as Todo[]);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel('todos-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'todos',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchTodos();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchTodos, user]);

  const handleCreate = async () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;

    await supabase.from('todos').insert({
      title: trimmedTitle,
      description: description.trim() || null,
      status: 'todo',
      user_id: user?.id,
    });

    setTitle('');
    setDescription('');
  };

  const handleToggle = async (todo: Todo) => {
    const nextStatus = todo.status === 'done' ? 'todo' : 'done';
    await supabase
      .from('todos')
      .update({ status: nextStatus })
      .eq('id', todo.id);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Your Todos</Text>
          <Text style={styles.subtitle}>Role: {role}</Text>
        </View>
        <TouchableOpacity style={styles.signOut} onPress={signOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.composer}>
        <TextInput
          style={styles.input}
          placeholder="New todo title"
          placeholderTextColor="#9BA0A8"
          value={title}
          onChangeText={setTitle}
        />
        <TextInput
          style={styles.input}
          placeholder="Description (optional)"
          placeholderTextColor="#9BA0A8"
          value={description}
          onChangeText={setDescription}
        />
        <TouchableOpacity style={styles.addButton} onPress={handleCreate}>
          <Text style={styles.addButtonText}>Add Todo</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator color="#8CD98C" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={todos}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 120 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.todoCard,
                item.status === 'done' && styles.todoDone,
              ]}
              onPress={() => handleToggle(item)}
            >
              <Text
                style={[
                  styles.todoTitle,
                  item.status === 'done' && styles.todoTitleDone,
                ]}
              >
                {item.title}
              </Text>
              {item.description ? (
                <Text style={styles.todoDescription}>{item.description}</Text>
              ) : null}
              <Text style={styles.todoMeta}>Status: {item.status}</Text>
            </TouchableOpacity>
          )}
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
  subtitle: {
    fontSize: 13,
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
  composer: {
    backgroundColor: '#121823',
    borderRadius: 16,
    padding: 16,
    marginBottom: 18,
  },
  input: {
    height: 44,
    borderRadius: 10,
    backgroundColor: '#0B0F14',
    paddingHorizontal: 12,
    color: '#F5F7FA',
    marginBottom: 10,
  },
  addButton: {
    height: 44,
    borderRadius: 10,
    backgroundColor: '#6EE7B7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#0B0F14',
    fontWeight: '700',
  },
  todoCard: {
    backgroundColor: '#131B26',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  todoDone: {
    backgroundColor: '#0E1F19',
  },
  todoTitle: {
    color: '#F5F7FA',
    fontSize: 16,
    fontWeight: '700',
  },
  todoTitleDone: {
    textDecorationLine: 'line-through',
    color: '#9AA3AF',
  },
  todoDescription: {
    color: '#B8C0CC',
    marginTop: 6,
  },
  todoMeta: {
    color: '#6B7280',
    fontSize: 12,
    marginTop: 10,
  },
});
