import 'react-native-gesture-handler';
import React from 'react';
import { ActivityIndicator, StatusBar, StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider, useAuth } from './src/auth/AuthProvider';
import AuthScreen from './src/auth/AuthScreen';
import TodosScreen from './src/todos/TodosScreen';
import FilesScreen from './src/files/FilesScreen';
import StocksScreen from './src/stocks/StocksScreen';
import AIAssistantScreen from './src/ai/AIAssistantScreen';

const Tab = createBottomTabNavigator();

function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: '#8CD98C',
        tabBarInactiveTintColor: '#9AA3AF',
        tabBarIcon: ({ color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'list';

          switch (route.name) {
            case 'Todos':
              iconName = 'checkmark-circle-outline';
              break;
            case 'Files':
              iconName = 'folder-outline';
              break;
            case 'Stocks':
              iconName = 'trending-up-outline';
              break;
            case 'AI':
              iconName = 'sparkles-outline';
              break;
            default:
              iconName = 'list';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Todos" component={TodosScreen} />
      <Tab.Screen name="Files" component={FilesScreen} />
      <Tab.Screen name="Stocks" component={StocksScreen} />
      <Tab.Screen name="AI" component={AIAssistantScreen} />
    </Tab.Navigator>
  );
}

function Root() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#8CD98C" />
      </View>
    );
  }

  return session ? (
    <NavigationContainer>
      <AppTabs />
    </NavigationContainer>
  ) : (
    <AuthScreen />
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={styles.appRoot}>
      <AuthProvider>
        <StatusBar barStyle="light-content" />
        <Root />
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: '#0B0F14',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appRoot: {
    flex: 1,
    backgroundColor: '#0B0F14',
  },
  tabBar: {
    backgroundColor: '#0B0F14',
    borderTopColor: '#1F2A37',
    borderTopWidth: 1,
    height: 64,
    paddingBottom: 8,
    paddingTop: 8,
  },
});
