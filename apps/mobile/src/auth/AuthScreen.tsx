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

  const handleSignIn = async () => {
    setLoading(true);
    const error = await signInWithEmail(email.trim(), password);
    setLoading(false);
    if (error) Alert.alert('Sign in failed', error);
  };

  const handleSignUp = async () => {
    setLoading(true);
    const error = await signUpWithEmail(email.trim(), password);
    setLoading(false);
    if (error) Alert.alert('Sign up failed', error);
    else Alert.alert('Check your email', 'Confirm your email to finish signup.');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: 'padding', android: undefined })}
      style={styles.container}
    >
      <View style={styles.card}>
        <Text style={styles.title}>Super Body</Text>
        <Text style={styles.subtitle}>Sign in to continue</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#9BA0A8"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#9BA0A8"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSignIn}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Sign In</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.buttonOutline, loading && styles.buttonDisabled]}
          onPress={handleSignUp}
          disabled={loading}
        >
          <Text style={styles.buttonOutlineText}>Create Account</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

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
    fontSize: 14,
    color: '#B2B8B0',
    marginBottom: 24,
  },
  input: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2B3A32',
    paddingHorizontal: 14,
    color: '#F2F5F3',
    marginBottom: 12,
  },
  button: {
    height: 48,
    borderRadius: 12,
    backgroundColor: '#8CD98C',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#102316',
    fontWeight: '700',
  },
  buttonOutline: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#8CD98C',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  buttonOutlineText: {
    color: '#8CD98C',
    fontWeight: '700',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
