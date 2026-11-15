import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { questionBank } from '../data/questions'

export interface QuestionChoice {
  id: string
  label: string
}

export interface MusicQuestion {
  id: number
  prompt: string
  choices: QuestionChoice[]
  answerId: string
  answerLabel: string
  audio: string
}

export interface ScoreEntry {
  id: string
  name: string
  points: number
  correctAnswers: number
  accuracy: number
  durationSeconds: number
  createdAt: string
}

const STORAGE_KEY = 'melodia:ranking:v3'
const QUESTION_COUNT = 15
const ROUND_SECONDS = 15

function isScoreEntry(value: unknown): value is ScoreEntry {
  if (typeof value !== 'object' || value === null) return false

  const entry = value as Record<string, unknown>
  return (
    typeof entry.id === 'string' &&
    typeof entry.name === 'string' &&
    typeof entry.points === 'number' &&
    typeof entry.correctAnswers === 'number' &&
    typeof entry.accuracy === 'number' &&
    typeof entry.durationSeconds === 'number' &&
    typeof entry.createdAt === 'string'
  )
}

function sortScores(scores: ScoreEntry[]) {
  return [...scores].sort(
    (first, second) =>
      second.points - first.points ||
      first.durationSeconds - second.durationSeconds ||
      first.createdAt.localeCompare(second.createdAt),
  )
}

function shuffled<T>(items: T[]) {
  const result = [...items]
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    const current = result[index]!
    result[index] = result[swapIndex]!
    result[swapIndex] = current
  }
  return result
}

function createQuestions(): MusicQuestion[] {
  return shuffled(questionBank).map((question) => {
    const choices = shuffled(question.answers).map((label) => ({
      id: label,
      label,
    }))

    return {
      id: question.id,
      prompt: question.prompt,
      choices,
      answerId: question.correctAnswer,
      answerLabel: question.correctAnswer,
      audio: question.audio,
    }
  })
}

export const useCompetitionStore = defineStore('competition', () => {
  const playerName = ref('')
  const phase = ref<'intro' | 'playing' | 'feedback' | 'finished'>('intro')
  const questions = ref<MusicQuestion[]>([])
  const currentQuestionIndex = ref(0)
  const points = ref(0)
  const correctAnswers = ref(0)
  const elapsedSeconds = ref(0)
  const timeRemaining = ref(ROUND_SECONDS)
  const lastAnswer = ref<number | null>(null)
  const lastAnswerWasCorrect = ref(false)
  const leaderboard = ref<ScoreEntry[]>([])
  const lastResult = ref<ScoreEntry | null>(null)
  const storageMessage = ref('')

  function loadScores() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (!saved) return []

      const parsed: unknown = JSON.parse(saved)
      if (!Array.isArray(parsed) || !parsed.every(isScoreEntry)) {
        throw new Error('El formato guardado no es válido.')
      }

      return sortScores(parsed).slice(0, 10)
    } catch {
      storageMessage.value =
        'No se pudo leer el ranking guardado. Puedes jugar, pero las puntuaciones anteriores no están disponibles.'
      return []
    }
  }

  leaderboard.value = loadScores()

  const currentQuestion = computed(() => questions.value[currentQuestionIndex.value] ?? null)
  const questionCount = computed(() => questions.value.length || QUESTION_COUNT)
  const accuracy = computed(() =>
    questions.value.length === 0
      ? 0
      : Math.round((correctAnswers.value / questions.value.length) * 100),
  )
  const progress = computed(() =>
    questions.value.length === 0
      ? 0
      : ((currentQuestionIndex.value + 1) / questions.value.length) * 100,
  )
  const lastResultRank = computed(() => {
    if (!lastResult.value) return 0
    const index = leaderboard.value.findIndex((entry) => entry.id === lastResult.value?.id)
    return index === -1 ? 0 : index + 1
  })

  function startGame(name: string) {
    const normalizedName = name.trim()
    if (!normalizedName) return

    playerName.value = normalizedName
    questions.value = createQuestions()
    currentQuestionIndex.value = 0
    points.value = 0
    correctAnswers.value = 0
    elapsedSeconds.value = 0
    timeRemaining.value = ROUND_SECONDS
    lastAnswer.value = null
    lastAnswerWasCorrect.value = false
    lastResult.value = null
    phase.value = 'playing'
  }

  function submitAnswer(answerIndex: number | null) {
    const question = currentQuestion.value
    if (phase.value !== 'playing' || !question) return
    if (
      answerIndex !== null &&
      (!Number.isInteger(answerIndex) || answerIndex < 0 || answerIndex >= question.choices.length)
    ) {
      return
    }

    lastAnswer.value = answerIndex
    lastAnswerWasCorrect.value =
      answerIndex !== null && question.choices[answerIndex]?.id === question.answerId
    if (lastAnswerWasCorrect.value) {
      correctAnswers.value += 1
      points.value += 10
    }
    phase.value = 'feedback'
  }

  function tickSecond() {
    if (phase.value !== 'playing') return

    elapsedSeconds.value += 1
    timeRemaining.value -= 1
    if (timeRemaining.value <= 0) submitAnswer(null)
  }

  function finishGame() {
    if (phase.value !== 'feedback') return

    const result: ScoreEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: playerName.value,
      points: points.value,
      correctAnswers: correctAnswers.value,
      accuracy: accuracy.value,
      durationSeconds: elapsedSeconds.value,
      createdAt: new Date().toISOString(),
    }

    leaderboard.value = sortScores([...leaderboard.value, result]).slice(0, 10)
    lastResult.value = result
    phase.value = 'finished'

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(leaderboard.value))
      storageMessage.value = ''
    } catch {
      storageMessage.value =
        'No se pudo guardar el ranking en este navegador. La puntuación seguirá visible hasta que cierres la página.'
    }
  }

  function advanceQuestion() {
    if (phase.value !== 'feedback') return
    if (currentQuestionIndex.value >= questions.value.length - 1) {
      finishGame()
      return
    }

    currentQuestionIndex.value += 1
    timeRemaining.value = ROUND_SECONDS
    lastAnswer.value = null
    lastAnswerWasCorrect.value = false
    phase.value = 'playing'
  }

  function resetToIntro() {
    phase.value = 'intro'
    questions.value = []
    currentQuestionIndex.value = 0
    lastResult.value = null
  }

  return {
    playerName,
    phase,
    questions,
    currentQuestionIndex,
    points,
    correctAnswers,
    elapsedSeconds,
    timeRemaining,
    lastAnswer,
    lastAnswerWasCorrect,
    leaderboard,
    lastResult,
    storageMessage,
    currentQuestion,
    questionCount,
    accuracy,
    progress,
    lastResultRank,
    startGame,
    submitAnswer,
    tickSecond,
    advanceQuestion,
    resetToIntro,
  }
})
