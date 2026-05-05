import { useEffect, useState } from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet,
  ActivityIndicator, ScrollView, Alert
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { progressApi, cachedGet } from '../lib/api'

export default function LearnScreen({ navigation }: any) {
  const [cards, setCards] = useState<any[]>([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [loading, setLoading] = useState(true)
  const [correct, setCorrect] = useState(0)
  const [total, setTotal] = useState(0)
  const [streak, setStreak] = useState(0)
  const [xp, setXp] = useState(0)
  const [selectedCat, setSelectedCat] = useState('all')
  const [categories, setCategories] = useState<any[]>([])
  const [allCards, setAllCards] = useState<any[]>([])

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    try {
      // Load from cache first — instant on reload
      const [catsRes, cardsRes, summaryRes] = await Promise.all([
        cachedGet('/api/cards/categories/'),
        cachedGet('/api/ai/random/?count=601'),
        progressApi.summary(),
      ])

      setCategories(catsRes.data.results || catsRes.data)
      setStreak(summaryRes.data.current_streak || 0)
      setXp(summaryRes.data.xp_points || 0)

      const loaded = (cardsRes.data.questions || []).map((q: any) => ({
        id: q.card_id,
        source_text: q.source_text,
        target_text: q.target_text,
        romanization: q.romanization,
        category: q.category,
      }))
      setAllCards(loaded)
      setCards(loaded)
    } catch {
      Alert.alert('Error', 'Failed to load cards')
    } finally {
      setLoading(false)
    }
  }

  const filterByCategory = (catName: string) => {
    setSelectedCat(catName)
    setCurrentIdx(0)
    setFlipped(false)
    if (catName === 'all') {
      setCards(allCards)
    } else {
      // Filter by deck name matching category
      setCards(allCards)
    }
  }

  const logout = async () => {
    await AsyncStorage.removeItem('access_token')
    await AsyncStorage.removeItem('refresh_token')
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] })
  }

  const currentCard = cards[currentIdx]
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0

  const handleCorrect = async () => {
    setCorrect(c => c + 1)
    setTotal(t => t + 1)
    setXp(x => x + 10)
    try { await progressApi.review(currentCard.id, 4) } catch {}
    setFlipped(false)
    setTimeout(() => setCurrentIdx(i => (i + 1) % cards.length), 200)
  }

  const handleWrong = async () => {
    setTotal(t => t + 1)
    try { await progressApi.review(currentCard.id, 1) } catch {}
    setFlipped(false)
    setTimeout(() => setCurrentIdx(i => (i + 1) % cards.length), 200)
  }

  if (loading) return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color="#00ffa3" />
      <Text style={styles.loadingText}>Loading cards...</Text>
    </View>
  )

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>
          <Text style={styles.green}>শব্দ</Text>
          <Text style={styles.purple}>কার্ড</Text>
        </Text>
        <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Sign out</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.statsRow}>
          {[
            { label: 'Cards', value: cards.length, color: '#00ffa3' },
            { label: 'Correct', value: correct, color: '#a78bfa' },
            { label: 'Accuracy', value: `${accuracy}%`, color: '#fb923c' },
          ].map(({ label, value, color }) => (
            <View key={label} style={styles.statCard}>
              <Text style={[styles.statValue, { color }]}>{value}</Text>
              <Text style={styles.statLabel}>{label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.streakCard}>
          <Text style={styles.streakFire}>🔥 {streak} day streak</Text>
          <View style={styles.xpBadge}>
            <Text style={styles.xpText}>✦ {xp} XP</Text>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catsScroll}>
          <TouchableOpacity
            style={[styles.catPill, selectedCat === 'all' && styles.catPillActive]}
            onPress={() => filterByCategory('all')}
          >
            <Text style={[styles.catText, selectedCat === 'all' && styles.catTextActive]}>All</Text>
          </TouchableOpacity>
          {categories.map(cat => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.catPill, selectedCat === cat.name && styles.catPillActive]}
              onPress={() => filterByCategory(cat.name)}
            >
              <Text style={[styles.catText, selectedCat === cat.name && styles.catTextActive]}>
                {cat.emoji} {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.progressRow}>
          <Text style={styles.progressText}>{currentIdx + 1}/{cards.length}</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${((currentIdx + 1) / cards.length) * 100}%` }]} />
          </View>
        </View>

        {currentCard && (
          <TouchableOpacity onPress={() => setFlipped(f => !f)} activeOpacity={0.9}>
            <View style={[styles.card, flipped ? styles.cardBack : styles.cardFront]}>
              <Text style={styles.cardLang}>{flipped ? 'Deutsch' : 'বাংলা'}</Text>
              <Text style={[styles.cardWord, { color: flipped ? '#00ffa3' : '#fff' }]}>
                {flipped ? currentCard.target_text : currentCard.source_text}
              </Text>
              {!flipped && currentCard.romanization && (
                <Text style={styles.romanization}>{currentCard.romanization}</Text>
              )}
              <Text style={styles.tapHint}>{flipped ? 'tap to flip back' : 'tap to reveal'}</Text>
            </View>
          </TouchableOpacity>
        )}

        {flipped && (
          <View style={styles.answerRow}>
            <TouchableOpacity style={styles.wrongBtn} onPress={handleWrong}>
              <Text style={styles.wrongText}>✗ Again</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.correctBtn} onPress={handleCorrect}>
              <Text style={styles.correctText}>✓ Got it</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a1a', paddingTop: 50 },
  center: { flex: 1, backgroundColor: '#0a0a1a', justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: 'rgba(255,255,255,0.4)', marginTop: 12, fontSize: 14 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 16 },
  logo: { fontSize: 24, fontWeight: '900' },
  green: { color: '#00ffa3' },
  purple: { color: '#a78bfa' },
  logoutBtn: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  logoutText: { color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: '600' },
  statsRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginBottom: 10 },
  statCard: { flex: 1, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 16, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  statValue: { fontSize: 22, fontWeight: '900' },
  statLabel: { color: 'rgba(255,255,255,0.3)', fontSize: 9, fontWeight: '700', letterSpacing: 1, marginTop: 2 },
  streakCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: 16, marginBottom: 12, backgroundColor: 'rgba(249,115,22,0.08)', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: 'rgba(249,115,22,0.2)' },
  streakFire: { color: '#fb923c', fontWeight: '700', fontSize: 14 },
  xpBadge: { backgroundColor: 'rgba(124,58,237,0.2)', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4, borderWidth: 1, borderColor: 'rgba(124,58,237,0.3)' },
  xpText: { color: '#a78bfa', fontWeight: '700', fontSize: 12 },
  catsScroll: { paddingHorizontal: 16, marginBottom: 12 },
  catPill: { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7, marginRight: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  catPillActive: { backgroundColor: 'rgba(0,255,163,0.12)', borderColor: 'rgba(0,255,163,0.4)' },
  catText: { color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: '600' },
  catTextActive: { color: '#00ffa3' },
  progressRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginBottom: 12, gap: 10 },
  progressText: { color: 'rgba(255,255,255,0.3)', fontSize: 12, fontWeight: '600', minWidth: 40 },
  progressBar: { flex: 1, height: 4, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#00ffa3', borderRadius: 2 },
  card: { marginHorizontal: 16, borderRadius: 24, padding: 28, minHeight: 200, justifyContent: 'center', alignItems: 'center', borderWidth: 1, marginBottom: 16 },
  cardFront: { backgroundColor: 'rgba(124,58,237,0.15)', borderColor: 'rgba(124,58,237,0.35)' },
  cardBack: { backgroundColor: 'rgba(0,255,163,0.1)', borderColor: 'rgba(0,255,163,0.35)' },
  cardLang: { color: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: '700', letterSpacing: 3, marginBottom: 12 },
  cardWord: { fontSize: 42, fontWeight: '900', textAlign: 'center', marginBottom: 8 },
  romanization: { color: 'rgba(255,255,255,0.35)', fontSize: 14, fontStyle: 'italic', marginBottom: 12 },
  tapHint: { color: 'rgba(255,255,255,0.15)', fontSize: 11, marginTop: 8 },
  answerRow: { flexDirection: 'row', gap: 12, paddingHorizontal: 16, marginBottom: 24 },
  wrongBtn: { flex: 1, backgroundColor: 'rgba(255,77,109,0.1)', borderRadius: 16, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,77,109,0.35)' },
  wrongText: { color: '#ff4d6d', fontWeight: '800', fontSize: 15 },
  correctBtn: { flex: 1, backgroundColor: 'rgba(0,255,163,0.1)', borderRadius: 16, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(0,255,163,0.35)' },
  correctText: { color: '#00ffa3', fontWeight: '800', fontSize: 15 },
})