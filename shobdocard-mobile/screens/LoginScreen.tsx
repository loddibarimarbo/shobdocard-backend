import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { auth } from '../lib/api'

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    if (!email || !password) return Alert.alert('Error', 'Please fill all fields')
    setLoading(true)
    try {
      const { data } = await auth.login(email, password)
      await AsyncStorage.setItem('access_token', data.access)
      await AsyncStorage.setItem('refresh_token', data.refresh)
      // Force re-render by reloading
      navigation.reset({ index: 0, routes: [{ name: 'Login' }] })
    } catch {
      Alert.alert('Error', 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.logo}>
            <Text style={styles.logoGreen}>শব্দ</Text>
            <Text style={styles.logoPurple}>কার্ড</Text>
          </Text>
          <Text style={styles.subtitle}>Bengali → German Flashcards</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Sign In</Text>

          <Text style={styles.label}>EMAIL</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor="rgba(255,255,255,0.2)"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>PASSWORD</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            placeholderTextColor="rgba(255,255,255,0.2)"
            secureTextEntry
          />

          <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
            {loading ? <ActivityIndicator color="#0a0a1a" /> : <Text style={styles.buttonText}>Sign in →</Text>}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.link}>No account? <Text style={styles.linkGreen}>Create one free</Text></Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a1a' },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  header: { alignItems: 'center', marginBottom: 32 },
  logo: { fontSize: 40, fontWeight: '900' },
  logoGreen: { color: '#00ffa3' },
  logoPurple: { color: '#a78bfa' },
  subtitle: { color: 'rgba(255,255,255,0.3)', fontSize: 13, marginTop: 4 },
  card: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  title: { color: '#fff', fontSize: 22, fontWeight: '800', marginBottom: 20 },
  label: { color: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: '700', letterSpacing: 2, marginBottom: 6 },
  input: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    padding: 14,
    color: '#fff',
    fontSize: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#7c3aed',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  buttonText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  link: { color: 'rgba(255,255,255,0.3)', textAlign: 'center', fontSize: 13 },
  linkGreen: { color: '#00ffa3', fontWeight: '700' },
})