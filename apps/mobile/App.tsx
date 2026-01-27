import React from 'react';
import { ActivityIndicator, StatusBar, StyleSheet, View } from 'react-native';
import { AuthProvider, useAuth } from './src/auth/AuthProvider';
import AuthScreen from './src/auth/AuthScreen';
import TodosScreen from './src/todos/TodosScreen';

function Root() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#8CD98C" />
      </View>
    );
  }

  return session ? <TodosScreen /> : <AuthScreen />;
}

export default function App() {
  return (
    <AuthProvider>
      <StatusBar barStyle="light-content" />
      <Root />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: '#0B0F14',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
