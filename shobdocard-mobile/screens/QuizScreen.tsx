import { useEffect, useState } from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet,
  ActivityIndicator, TextInput, ScrollView, Alert
} from 'react-native'
import { quizApi } from '../lib/api'

export default function QuizScreen() {
  const [questions, setQuestions] = useState<any[]>([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [fillAnswer, setFillAnswer] = useState('')
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [score, setScore] = useState({ correct: 0, total: 0 })
  const [loading, setLoading] = useState(true)
  const [finished, setFinished] = useState(false)
  const [showHint, setShowHint] = useState(false)

  useEffect(() => { loadQuestions() }, [])

  const loadQuestions = async () => {
    setLoading(true)
    setFinished(false)
    setCurrentIdx(0)
    setScore({ correct: 0, total: 0 })
    setSelectedAnswer(null)
    setFillAnswer('')
    setIsCorrect(null)
    try {
      const res = await quizApi.random(10)
      setQuestions(res.data.questions)
    } catch {
      Alert.alert('Error', 'Failed to load quiz')
    } finally {
      setLoading(false)
    }
  }

  const currentQ = questions[currentIdx]

  const handleMCQ = (option: string) => {
    if (selectedAnswer) return
    setSelectedAnswer(option)
    const correct = option === currentQ.correct_answer
    setIsCorrect(correct)
    setScore(s => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }))
  }

  const handleFill = () => {
    if (isCorrect !== null) return
    const correct = fillAnswer.trim().toLowerCase() === currentQ.correct_answer.toLowerCase()
    setIsCorrect(correct)
    setScore(s => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }))
  }

  const nextQuestion = () => {
    if (currentIdx + 1 >= questions.length) { setFinished(true); return }
    setCurrentIdx(i => i + 1)
    setSelectedAnswer(null)
    setFillAnswer('')
    setIsCorrect(null)
    setShowHint(false)
  }

  const accuracy = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0

  if (loading) return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color="#00ffa3" />
      <Text style={styles.loadingText}>Generating quiz...</Text>
    </View>
  )

  if (finished) return (
    <View style={styles.container}>
      <View style={styles.resultCard}>
        <Text style={styles.resultEmoji}>{accuracy >= 80 ? '🏆' : accuracy >= 50 ? '🎯' : '📚'}</Text>
        <Text style={styles.resultTitle}>Quiz Complete!</Text>
        <View style={styles.resultStats}>
          {[
            { label: 'Correct', value: score.correct, color: '#00ffa3' },
            { label: 'Wrong', value: score.total - score.correct, color: '#ff4d6d' },
            { label: 'Accuracy', value: `${accuracy}%`, color: '#a78bfa' },
          ].map(({ label, value, color }) => (
            <View key={label} style={styles.resultStat}>
              <Text style={[styles.resultStatValue, { color }]}>{value}</Text>
              <Text style={styles.resultStatLabel}>{label}</Text>
            </View>
          ))}
        </View>
        <TouchableOpacity style={styles.playAgainBtn} onPress={loadQuestions}>
          <Text style={styles.playAgainText}>🔄 Play Again</Text>
        </TouchableOpacity>
      </View>
    </View>
  )

  if (!currentQ) return null

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          <Text style={styles.green}>Quiz</Text> Mode
        </Text>
        <View style={styles.headerStats}>
          <Text style={styles.headerStat}>{score.correct} ✓</Text>
          <Text style={styles.headerStat}>{accuracy}%</Text>
        </View>
      </View>

      {/* Progress */}
      <View style={styles.progressRow}>
        <Text style={styles.progressText}>{currentIdx + 1}/{questions.length}</Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${((currentIdx) / questions.length) * 100}%` }]} />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Type badge */}
        <View style={styles.typeBadge}>
          <Text style={styles.typeBadgeText}>
            {currentQ.quiz_type === 'mcq' ? '🎯 Multiple Choice' : '✏️ Fill in the Blank'}
          </Text>
        </View>

        {/* Question */}
        <View style={styles.questionCard}>
          <Text style={styles.questionLabel}>প্রশ্ন</Text>
          <Text style={styles.questionText}>{currentQ.blank_sentence}</Text>
          {currentQ.romanization && (
            <Text style={styles.romanization}>উচ্চারণ: {currentQ.romanization}</Text>
          )}
        </View>

        {/* MCQ */}
        {currentQ.quiz_type === 'mcq' && (
          <View style={styles.optionsGrid}>
            {currentQ.options.map((option: string, i: number) => {
              const isSelected = selectedAnswer === option
              const isCorrectAnswer = option === currentQ.correct_answer
              let btnStyle = styles.optionBtn
              let textStyle = styles.optionText
              if (selectedAnswer) {
                if (isCorrectAnswer) { btnStyle = { ...styles.optionBtn, ...styles.optionCorrect }; textStyle = { ...styles.optionText, color: '#00ffa3' } }
                else if (isSelected) { btnStyle = { ...styles.optionBtn, ...styles.optionWrong }; textStyle = { ...styles.optionText, color: '#ff4d6d' } }
              }
              return (
                <TouchableOpacity key={option} style={btnStyle} onPress={() => handleMCQ(option)} disabled={!!selectedAnswer}>
                  <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, marginBottom: 2 }}>{String.fromCharCode(65 + i)}.</Text>
                  <Text style={textStyle}>{option}</Text>
                </TouchableOpacity>
              )
            })}
          </View>
        )}

        {/* Fill blank */}
        {currentQ.quiz_type === 'fill_blank' && (
          <View style={styles.fillContainer}>
            <TextInput
              style={[styles.fillInput, isCorrect === true ? styles.fillCorrect : isCorrect === false ? styles.fillWrong : {}]}
              value={fillAnswer}
              onChangeText={setFillAnswer}
              placeholder="জার্মান শব্দ লিখুন..."
              placeholderTextColor="rgba(255,255,255,0.2)"
              editable={isCorrect === null}
              autoCapitalize="none"
            />
            {isCorrect === false && (
              <Text style={styles.correctAnswer}>✓ সঠিক: {currentQ.correct_answer}</Text>
            )}
            {isCorrect === null && (
              <TouchableOpacity style={styles.checkBtn} onPress={handleFill} disabled={!fillAnswer.trim()}>
                <Text style={styles.checkBtnText}>Check →</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Hint */}
        <TouchableOpacity onPress={() => setShowHint(h => !h)} style={styles.hintToggle}>
          <Text style={styles.hintToggleText}>💡 {showHint ? 'Hide' : 'Show'} hint</Text>
        </TouchableOpacity>
        {showHint && (
          <View style={styles.hintCard}>
            <Text style={styles.hintText}>{currentQ.hint}</Text>
          </View>
        )}

        {/* Next */}
        {(selectedAnswer !== null || isCorrect !== null) && (
          <TouchableOpacity style={styles.nextBtn} onPress={nextQuestion}>
            <Text style={styles.nextBtnText}>
              {currentIdx + 1 >= questions.length ? 'See Results 🏆' : 'Next Question →'}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a1a', paddingTop: 50 },
  center: { flex: 1, backgroundColor: '#0a0a1a', justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: 'rgba(255,255,255,0.4)', marginTop: 12, fontSize: 14 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 12 },
  headerTitle: { fontSize: 22, fontWeight: '900', color: '#fff' },
  green: { color: '#00ffa3' },
  headerStats: { flexDirection: 'row', gap: 12 },
  headerStat: { color: 'rgba(255,255,255,0.5)', fontWeight: '700', fontSize: 14 },
  progressRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginBottom: 16, gap: 10 },
  progressText: { color: 'rgba(255,255,255,0.3)', fontSize: 12, fontWeight: '600', minWidth: 40 },
  progressBar: { flex: 1, height: 4, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#7c3aed', borderRadius: 2 },
  typeBadge: { marginHorizontal: 20, marginBottom: 10, backgroundColor: 'rgba(124,58,237,0.15)', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, alignSelf: 'flex-start', borderWidth: 1, borderColor: 'rgba(124,58,237,0.3)' },
  typeBadgeText: { color: '#a78bfa', fontSize: 12, fontWeight: '700' },
  questionCard: { marginHorizontal: 20, backgroundColor: 'rgba(124,58,237,0.12)', borderRadius: 20, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(124,58,237,0.25)' },
  questionLabel: { color: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: '700', letterSpacing: 2, marginBottom: 8 },
  questionText: { color: '#fff', fontSize: 18, fontWeight: '700', lineHeight: 26 },
  romanization: { color: 'rgba(255,255,255,0.3)', fontSize: 12, fontStyle: 'italic', marginTop: 6 },
  optionsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 20, gap: 10, marginBottom: 16 },
  optionBtn: { width: '47%', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  optionCorrect: { backgroundColor: 'rgba(0,255,163,0.12)', borderColor: 'rgba(0,255,163,0.4)' },
  optionWrong: { backgroundColor: 'rgba(255,77,109,0.12)', borderColor: 'rgba(255,77,109,0.4)' },
  optionText: { color: 'rgba(255,255,255,0.7)', fontWeight: '700', fontSize: 14 },
  fillContainer: { paddingHorizontal: 20, marginBottom: 16 },
  fillInput: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 16, padding: 16, color: '#fff', fontSize: 16, fontWeight: '700', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', marginBottom: 10 },
  fillCorrect: { borderColor: 'rgba(0,255,163,0.5)', color: '#00ffa3' },
  fillWrong: { borderColor: 'rgba(255,77,109,0.5)', color: '#ff4d6d' },
  correctAnswer: { color: '#00ffa3', fontWeight: '700', fontSize: 14, marginBottom: 10 },
  checkBtn: { backgroundColor: 'rgba(124,58,237,0.2)', borderRadius: 14, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(124,58,237,0.4)' },
  checkBtnText: { color: '#a78bfa', fontWeight: '800', fontSize: 14 },
  hintToggle: { paddingHorizontal: 20, marginBottom: 8 },
  hintToggleText: { color: 'rgba(255,255,255,0.3)', fontSize: 13, fontWeight: '600' },
  hintCard: { marginHorizontal: 20, backgroundColor: 'rgba(249,115,22,0.08)', borderRadius: 16, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(249,115,22,0.2)' },
  hintText: { color: '#fb923c', fontSize: 13 },
  nextBtn: { marginHorizontal: 20, marginBottom: 30, backgroundColor: 'rgba(0,255,163,0.12)', borderRadius: 16, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(0,255,163,0.3)' },
  nextBtnText: { color: '#00ffa3', fontWeight: '800', fontSize: 15 },
  resultCard: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  resultEmoji: { fontSize: 60, marginBottom: 16 },
  resultTitle: { color: '#fff', fontSize: 26, fontWeight: '900', marginBottom: 24 },
  resultStats: { flexDirection: 'row', gap: 12, marginBottom: 32 },
  resultStat: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 16, padding: 16, alignItems: 'center', minWidth: 90, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  resultStatValue: { fontSize: 28, fontWeight: '900' },
  resultStatLabel: { color: 'rgba(255,255,255,0.3)', fontSize: 11, fontWeight: '700', letterSpacing: 1, marginTop: 4 },
  playAgainBtn: { backgroundColor: 'rgba(0,255,163,0.12)', borderRadius: 16, paddingHorizontal: 32, paddingVertical: 16, borderWidth: 1, borderColor: 'rgba(0,255,163,0.3)' },
  playAgainText: { color: '#00ffa3', fontWeight: '800', fontSize: 16 },
})