import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
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
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTitle, setEditingTitle] = useState('');
  const [editingDescription, setEditingDescription] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'todo' | 'doing' | 'done'>('all');

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

  const handleDelete = async (id: string) => {
    await supabase.from('todos').delete().eq('id', id);
  };

  const handleToggle = async (todo: Todo) => {
    const statusOrder = ['todo', 'doing', 'done'];
    const currentIndex = statusOrder.indexOf(todo.status);
    const nextStatus = statusOrder[(currentIndex + 1) % statusOrder.length] as 'todo' | 'doing' | 'done';

    await supabase
      .from('todos')
      .update({ status: nextStatus })
      .eq('id', todo.id);
  };

  const openEditModal = (todo: Todo) => {
    setEditingTodo(todo);
    setEditingTitle(todo.title);
    setEditingDescription(todo.description || '');
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingTodo(null);
    setEditingTitle('');
    setEditingDescription('');
  };

  const handleUpdate = async () => {
    if (!editingTodo) return;

    await supabase
      .from('todos')
      .update({
        title: editingTitle.trim(),
        description: editingDescription.trim() || null,
      })
      .eq('id', editingTodo.id);

    closeEditModal();
  };

  const filteredTodos = todos.filter(todo =>
    statusFilter === 'all' || todo.status === statusFilter
  );

  const todoCounts = {
    all: todos.length,
    todo: todos.filter(t => t.status === 'todo').length,
    doing: todos.filter(t => t.status === 'doing').length,
    done: todos.filter(t => t.status === 'done').length,
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

      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, statusFilter === 'all' && styles.filterButtonActive]}
          onPress={() => setStatusFilter('all')}
        >
          <Text style={[styles.filterText, statusFilter === 'all' && styles.filterTextActive]}>
            All ({todoCounts.all})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, statusFilter === 'todo' && styles.filterButtonActive]}
          onPress={() => setStatusFilter('todo')}
        >
          <Text style={[styles.filterText, statusFilter === 'todo' && styles.filterTextActive]}>
            Todo ({todoCounts.todo})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, statusFilter === 'doing' && styles.filterButtonActive]}
          onPress={() => setStatusFilter('doing')}
        >
          <Text style={[styles.filterText, statusFilter === 'doing' && styles.filterTextActive]}>
            Doing ({todoCounts.doing})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, statusFilter === 'done' && styles.filterButtonActive]}
          onPress={() => setStatusFilter('done')}
        >
          <Text style={[styles.filterText, statusFilter === 'done' && styles.filterTextActive]}>
            Done ({todoCounts.done})
          </Text>
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
          data={filteredTodos}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 120 }}
          renderItem={({ item }) => (
            <View style={[styles.todoCard, item.status === 'done' && styles.todoDone]}>
              <TouchableOpacity
                style={styles.todoContent}
                onPress={() => handleToggle(item)}
              >
                <View style={styles.todoTitleContainer}>
                  <Text
                    style={[
                      styles.todoTitle,
                      item.status === 'done' && styles.todoTitleDone,
                    ]}
                  >
                    {item.title}
                  </Text>
                  <View style={[
                    styles.statusDot,
                    item.status === 'todo' && styles.statusDotTodo,
                    item.status === 'doing' && styles.statusDotDoing,
                    item.status === 'done' && styles.statusDotDone,
                  ]} />
                </View>
                {item.description ? (
                  <Text style={styles.todoDescription}>{item.description}</Text>
                ) : null}
                <View style={styles.todoActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => openEditModal(item)}
                  >
                    <Text style={styles.actionText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.actionButtonDelete]}
                    onPress={() => handleDelete(item.id)}
                  >
                    <Text style={[styles.actionText, styles.actionTextDelete]}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            </View>
          )}
        />
      )}

      <Modal
        visible={showEditModal}
        animationType="slide"
        transparent={false}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Edit Todo</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Todo title"
              placeholderTextColor="#9BA0A8"
              value={editingTitle}
              onChangeText={setEditingTitle}
            />
            <TextInput
              style={[styles.modalInput, styles.modalTextarea]}
              placeholder="Description (optional)"
              placeholderTextColor="#9BA0A8"
              value={editingDescription}
              onChangeText={setEditingDescription}
              multiline
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalButtonCancel}
                onPress={closeEditModal}
              >
                <Text style={styles.modalButtonTextCancel}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButtonSave}
                onPress={handleUpdate}
              >
                <Text style={styles.modalButtonTextSave}>Save</Text>
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
  filterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 18,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#16261F',
    borderWidth: 1,
    borderColor: '#2B3A32',
  },
  filterButtonActive: {
    backgroundColor: '#8CD98C',
    borderColor: '#8CD98C',
  },
  filterText: {
    color: '#B2B8B0',
    fontSize: 12,
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#102316',
    fontWeight: '700',
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
    fontSize: 16,
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
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  todoDone: {
    backgroundColor: '#0E1F19',
    borderColor: '#0E1F19',
  },
  todoContent: {
    flex: 1,
  },
  todoTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  todoTitle: {
    color: '#F5F7FA',
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  todoTitleDone: {
    textDecorationLine: 'line-through',
    color: '#9AA3AF',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#6B7280',
    marginLeft: 8,
  },
  statusDotTodo: {
    backgroundColor: '#F59E0B',
  },
  statusDotDoing: {
    backgroundColor: '#3B82F6',
  },
  statusDotDone: {
    backgroundColor: '#10B981',
  },
  todoDescription: {
    color: '#B8C0CC',
    marginTop: 4,
    fontSize: 14,
    lineHeight: 20,
  },
  todoActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 12,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
  },
  actionButtonDelete: {
    backgroundColor: '#7F1D1D',
    borderColor: '#991B1B',
  },
  actionText: {
    color: '#E2E8F0',
    fontSize: 12,
    fontWeight: '500',
  },
  actionTextDelete: {
    color: '#FECACA',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#0B0F14',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#16261F',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#F5F7FA',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalInput: {
    height: 48,
    borderRadius: 12,
    backgroundColor: '#0B0F14',
    paddingHorizontal: 14,
    color: '#F5F7FA',
    fontSize: 16,
    marginBottom: 12,
  },
  modalTextarea: {
    height: 100,
    textAlignVertical: 'top',
    paddingVertical: 12,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 16,
  },
  modalButtonCancel: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonSave: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#6EE7B7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonTextCancel: {
    color: '#E2E8F0',
    fontWeight: '600',
    fontSize: 16,
  },
  modalButtonTextSave: {
    color: '#0B0F14',
    fontWeight: '700',
    fontSize: 16,
  },
});
