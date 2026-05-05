import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { auth } from '../lib/api'

export default function RegisterScreen({ navigation }: any) {
  const [form, setForm] = useState({ email: '', username: '', display_name: '', password: '' })
  const [loading, setLoading] = useState(false)

  const handleRegister = async () => {
    if (!form.email || !form.username || !form.password) return Alert.alert('Error', 'Please fill all fields')
    setLoading(true)
    try {
      await auth.register(form)
      const { data } = await auth.login(form.email, form.password)
      await AsyncStorage.setItem('access_token', data.access)
      await AsyncStorage.setItem('refresh_token', data.refresh)
      navigation.reset({ index: 0, routes: [{ name: 'Login' }] })
    } catch (err: any) {
      const msg = err.response?.data?.email?.[0] || err.response?.data?.username?.[0] || 'Registration failed'
      Alert.alert('Error', msg)
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
          <Text style={styles.subtitle}>Create your free account</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Register</Text>

          {[
            { key: 'display_name', label: 'NAME', placeholder: 'Your name', secure: false },
            { key: 'email', label: 'EMAIL', placeholder: 'you@example.com', secure: false },
            { key: 'username', label: 'USERNAME', placeholder: 'username123', secure: false },
            { key: 'password', label: 'PASSWORD', placeholder: '••••••••', secure: true },
          ].map(({ key, label, placeholder, secure }) => (
            <View key={key}>
              <Text style={styles.label}>{label}</Text>
              <TextInput
                style={styles.input}
                value={form[key as keyof typeof form]}
                onChangeText={(v) => setForm({ ...form, [key]: v })}
                placeholder={placeholder}
                placeholderTextColor="rgba(255,255,255,0.2)"
                secureTextEntry={secure}
                autoCapitalize="none"
                keyboardType={key === 'email' ? 'email-address' : 'default'}
              />
            </View>
          ))}

          <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
            {loading ? <ActivityIndicator color="#0a0a1a" /> : <Text style={styles.buttonText}>Create account →</Text>}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.link}>Already have an account? <Text style={styles.linkPurple}>Sign in</Text></Text>
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
    backgroundColor: '#00ffa3',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  buttonText: { color: '#0a0a1a', fontWeight: '800', fontSize: 15 },
  link: { color: 'rgba(255,255,255,0.3)', textAlign: 'center', fontSize: 13 },
  linkPurple: { color: '#a78bfa', fontWeight: '700' },
})