import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useStore } from '../store/store'

export default function ProgressScreen({ navigation }: any) {
  const { summary, user } = useStore()

  const logout = async () => {
    await AsyncStorage.removeItem('access_token')
    await AsyncStorage.removeItem('refresh_token')
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] })
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Progress</Text>
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutText}>Sign out</Text>
        </TouchableOpacity>
      </View>

      {user && (
        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user.username?.[0]?.toUpperCase()}</Text>
          </View>
          <View>
            <Text style={styles.userName}>{user.display_name || user.username}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
          </View>
        </View>
      )}

      <View style={styles.highlightRow}>
        <View style={[styles.highlightCard, { borderColor: 'rgba(249,115,22,0.3)' }]}>
          <Text style={styles.highlightEmoji}>🔥</Text>
          <Text style={[styles.highlightValue, { color: '#fb923c' }]}>{summary?.current_streak || 0}</Text>
          <Text style={styles.highlightLabel}>Day Streak</Text>
        </View>
        <View style={[styles.highlightCard, { borderColor: 'rgba(124,58,237,0.3)' }]}>
          <Text style={styles.highlightEmoji}>✦</Text>
          <Text style={[styles.highlightValue, { color: '#a78bfa' }]}>{summary?.xp_points || 0}</Text>
          <Text style={styles.highlightLabel}>Total XP</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>STATISTICS</Text>
      <View style={styles.statsGrid}>
        {[
          { label: 'Cards Studied', value: summary?.cards_studied || 0, color: '#00ffa3', emoji: '📚' },
          { label: 'Correct', value: summary?.correct || 0, color: '#00ffa3', emoji: '✓' },
          { label: 'Incorrect', value: summary?.incorrect || 0, color: '#ff4d6d', emoji: '✗' },
          { label: 'Mastered', value: summary?.mastered || 0, color: '#a78bfa', emoji: '🏆' },
          { label: 'Due Today', value: summary?.due_today || 0, color: '#fb923c', emoji: '📅' },
          { label: 'Accuracy', value: `${summary?.accuracy || 0}%`, color: '#00ffa3', emoji: '🎯' },
        ].map(({ label, value, color, emoji }) => (
          <View key={label} style={styles.statCard}>
            <Text style={styles.statEmoji}>{emoji}</Text>
            <Text style={[styles.statValue, { color }]}>{value}</Text>
            <Text style={styles.statLabel}>{label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.accuracySection}>
        <Text style={styles.sectionTitle}>ACCURACY</Text>
        <View style={styles.accuracyBar}>
          <View style={[styles.accuracyFill, { width: `${summary?.accuracy || 0}%` }]} />
        </View>
        <Text style={styles.accuracyText}>{summary?.accuracy || 0}% correct answers</Text>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a1a', paddingTop: 50 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 20 },
  title: { color: '#fff', fontSize: 24, fontWeight: '900' },
  logoutBtn: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  logoutText: { color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: '600' },
  userCard: { flexDirection: 'row', alignItems: 'center', gap: 14, marginHorizontal: 20, marginBottom: 20, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 20, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(124,58,237,0.3)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(124,58,237,0.4)' },
  avatarText: { color: '#a78bfa', fontSize: 20, fontWeight: '900' },
  userName: { color: '#fff', fontSize: 16, fontWeight: '800' },
  userEmail: { color: 'rgba(255,255,255,0.3)', fontSize: 12, marginTop: 2 },
  highlightRow: { flexDirection: 'row', gap: 12, paddingHorizontal: 20, marginBottom: 24 },
  highlightCard: { flex: 1, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 20, padding: 20, alignItems: 'center', borderWidth: 1 },
  highlightEmoji: { fontSize: 28, marginBottom: 6 },
  highlightValue: { fontSize: 32, fontWeight: '900' },
  highlightLabel: { color: 'rgba(255,255,255,0.3)', fontSize: 11, fontWeight: '700', marginTop: 4, letterSpacing: 1 },
  sectionTitle: { color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: '700', letterSpacing: 2, paddingHorizontal: 20, marginBottom: 12 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 20, gap: 10, marginBottom: 24 },
  statCard: { width: '30%', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  statEmoji: { fontSize: 18, marginBottom: 6 },
  statValue: { fontSize: 20, fontWeight: '900' },
  statLabel: { color: 'rgba(255,255,255,0.3)', fontSize: 9, fontWeight: '700', marginTop: 4, textAlign: 'center' },
  accuracySection: { paddingHorizontal: 20, marginBottom: 40 },
  accuracyBar: { height: 8, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden', marginBottom: 8 },
  accuracyFill: { height: '100%', backgroundColor: '#00ffa3', borderRadius: 4 },
  accuracyText: { color: 'rgba(255,255,255,0.3)', fontSize: 12 },
})