
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useAppContext } from '../hooks/useAppContext';
import { UserTier } from '../types';
import { SafeAreaView } from 'react-native-safe-area-context';

const LoginScreen = () => {
  const { login, signUp } = useAppContext();
  const [isSigningUp, setIsSigningUp] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tier, setTier] = useState<UserTier>(UserTier.Free);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);
    try {
      if (isSigningUp) {
        await signUp(email, password, tier);
        Alert.alert("Sign up successful!", "Please check your email to confirm your account.");
      } else {
        await login(email, password);
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>{isSigningUp ? 'Create your account' : 'Sign in'}</Text>
        {error && <Text style={styles.errorText}>{error}</Text>}
        
        <TextInput
          style={styles.input}
          placeholder="Email address"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        
        {isSigningUp && (
          <View style={styles.tierSelector}>
            <TouchableOpacity 
              style={[styles.tierButton, tier === UserTier.Free && styles.activeTier]} 
              onPress={() => setTier(UserTier.Free)}>
              <Text style={tier === UserTier.Free ? styles.activeTierText : styles.tierText}>Free</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tierButton, tier === UserTier.Pro && styles.activeTier]}
              onPress={() => setTier(UserTier.Pro)}>
              <Text style={tier === UserTier.Pro ? styles.activeTierText : styles.tierText}>Pro</Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={loading}>
          {loading ? <ActivityIndicator color="white" /> : <Text style={styles.submitButtonText}>{isSigningUp ? 'Sign up' : 'Sign in'}</Text>}
        </TouchableOpacity>
        
        <TouchableOpacity onPress={() => setIsSigningUp(!isSigningUp)}>
          <Text style={styles.switchText}>
            {isSigningUp ? 'Already have an account? Sign in' : 'Don\'t have an account? Sign up'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', justifyContent: 'center', padding: 20 },
  formContainer: { backgroundColor: 'white', padding: 25, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 20, color: '#0F172A' },
  errorText: { color: 'red', textAlign: 'center', marginBottom: 10 },
  input: { borderWidth: 1, borderColor: '#CBD5E1', padding: 12, borderRadius: 8, fontSize: 16, marginBottom: 15 },
  tierSelector: { flexDirection: 'row', marginBottom: 20, borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 8 },
  tierButton: { flex: 1, padding: 12, alignItems: 'center' },
  activeTier: { backgroundColor: '#4338CA' },
  tierText: { fontSize: 16, color: '#0F172A' },
  activeTierText: { fontSize: 16, color: 'white', fontWeight: 'bold' },
  submitButton: { backgroundColor: '#4338CA', padding: 15, borderRadius: 8, alignItems: 'center' },
  submitButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  switchText: { color: '#4338CA', textAlign: 'center', marginTop: 20, fontWeight: '600' },
});

export default LoginScreen;
