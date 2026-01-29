import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from './AuthProvider';

export default function AuthScreen() {
  const { signInWithEmail, signUpWithEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = () => {
    if (!email.trim()) {
      Alert.alert('Email Required', 'Please enter your email address.');
      return false;
    }

    if (!email.includes('@')) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return false;
    }

    if (!password) {
      Alert.alert('Password Required', 'Please enter your password.');
      return false;
    }

    if (password.length < 6) {
      Alert.alert('Password Too Short', 'Password must be at least 6 characters.');
      return false;
    }

    return true;
  };

  const handleAuth = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const error = isSignUp
        ? await signUpWithEmail(email.trim(), password)
        : await signInWithEmail(email.trim(), password);

      if (error) {
        Alert.alert(
          isSignUp ? 'Sign up failed' : 'Sign in failed',
          error,
          [{ text: 'OK' }]
        );
      } else if (isSignUp) {
        Alert.alert(
          'Success!',
          'Check your email to confirm your account.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert(
        'Error',
        'An unexpected error occurred. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: 'padding', android: undefined })}
      style={styles.container}
    >
      <View style={styles.card}>
        <Text style={styles.title}>Super Body</Text>
        <Text style={styles.subtitle}>
          {isSignUp ? 'Create Account' : 'Sign in to continue'}
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#9BA0A8"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          value={email}
          onChangeText={setEmail}
          onSubmitEditing={() => passwordInputRef?.focus()}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#9BA0A8"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
          ref={(ref) => passwordInputRef = ref}
        />

        <TouchableOpacity
          style={styles.showPasswordButton}
          onPress={() => setShowPassword(!showPassword)}
        >
          <Text style={styles.showPasswordText}>
            {showPassword ? 'Hide' : 'Show'} Password
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleAuth}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Loading...' : (isSignUp ? 'Create Account' : 'Sign In')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.buttonOutline, loading && styles.buttonDisabled]}
          onPress={() => {
            setIsSignUp(!isSignUp);
            setEmail('');
            setPassword('');
          }}
          disabled={loading}
        >
          <Text style={styles.buttonOutlineText}>
            {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

let passwordInputRef: TextInput | null = null;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F1A14',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#16261F',
    borderRadius: 18,
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#F2F5F3',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 16,
    color: '#B2B8B0',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2B3A32',
    paddingHorizontal: 14,
    color: '#F2F5F3',
    marginBottom: 8,
    fontSize: 16,
  },
  showPasswordButton: {
    alignSelf: 'flex-end',
    marginBottom: 16,
  },
  showPasswordText: {
    color: '#8CD98C',
    fontSize: 14,
    fontWeight: '500',
  },
  button: {
    height: 48,
    borderRadius: 12,
    backgroundColor: '#8CD98C',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  buttonText: {
    color: '#102316',
    fontWeight: '700',
    fontSize: 16,
  },
  buttonOutline: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#8CD98C',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  buttonOutlineText: {
    color: '#8CD98C',
    fontWeight: '500',
    fontSize: 14,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
