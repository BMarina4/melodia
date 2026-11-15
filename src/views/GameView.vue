<template>
  <main class="game-page">
    <div class="page-wrap">
      <PageHeading
        title="El reto de tu oído"
        description="Identifica géneros musicales y responde preguntas sobre Queen y Freddie Mercury."
      />

      <p v-if="store.storageMessage" class="storage-alert" role="status">
        {{ store.storageMessage }}
      </p>

      <div class="game-layout">
        <section class="game-card">
          <div v-if="store.phase === 'intro'">
            <span class="card-kicker">Antes de empezar</span>
            <h2>¿Cómo te llamas?</h2>
            <p>
              Escribe el nombre que aparecerá durante el concurso y en el ranking si tu puntuación
              queda entre las diez mejores.
            </p>
            <form class="name-form" @submit.prevent="beginGame">
              <label for="player-name">Tu nombre</label>
              <input
                id="player-name"
                v-model="playerNameInput"
                maxlength="24"
                autocomplete="nickname"
                placeholder="Por ejemplo, Alex"
                required
              />
              <p v-if="formError" class="form-error" role="alert">{{ formError }}</p>
              <button class="button button-orange" type="submit">Empezar el concurso <span>→</span></button>
            </form>
          </div>

          <div v-else-if="store.phase === 'playing' || store.phase === 'feedback'">
            <div class="quiz-topline">
              <span>Pregunta {{ store.currentQuestionIndex + 1 }} de {{ store.questionCount }}</span>
              <span>{{ store.playerName }}</span>
            </div>
            <div
              class="quiz-progress"
              role="progressbar"
              :aria-valuenow="store.currentQuestionIndex + 1"
              aria-valuemin="1"
              :aria-valuemax="store.questionCount"
              :aria-label="`Pregunta ${store.currentQuestionIndex + 1} de ${store.questionCount}`"
            >
              <span :style="{ width: `${store.progress}%` }"></span>
            </div>

            <div class="quiz-meta">
              <span class="meta-chip">♫ Ronda {{ store.currentQuestionIndex + 1 }}</span>
              <span class="meta-chip">✦ {{ store.points }} puntos</span>
              <span class="meta-chip timer">◷ {{ store.timeRemaining }} s</span>
            </div>

            <h2>{{ currentQuestion?.prompt }}</h2>
            <p v-if="currentQuestion?.audio">
              Escucha el fragmento y elige su género musical.
            </p>
            <p v-else>Responde la pregunta sobre Queen o Freddie Mercury entre las cuatro opciones.</p>

            <AudioPlayer
              v-if="currentQuestion?.audio"
              :key="currentQuestion.id"
              :source="currentQuestion.audio"
              :can-play="store.phase === 'playing'"
            />

            <AnswerOptions
              :choices="currentQuestion?.choices ?? []"
              :phase="store.phase"
              :answer-id="currentQuestion?.answerId ?? ''"
              :selected-index="store.lastAnswer"
              :was-answer-correct="store.lastAnswerWasCorrect"
              @select="store.submitAnswer"
            />

            <div
              v-if="store.phase === 'feedback'"
              class="feedback-box"
              :class="{ 'is-wrong': !store.lastAnswerWasCorrect }"
              role="status"
            >
              <div>
                <strong>
                  {{
                    store.lastAnswer === null
                      ? 'Se acabó el tiempo'
                      : store.lastAnswerWasCorrect
                        ? '¡Correcto! +10 puntos'
                        : 'No era esa'
                  }}
                </strong>
                <span>La respuesta era {{ currentQuestion?.answerLabel }}.</span>
              </div>
              <button class="button button-green button-small" type="button" @click="store.advanceQuestion">
                {{
                  store.currentQuestionIndex === store.questionCount - 1
                    ? 'Ver resultados'
                    : 'Siguiente pregunta'
                }}
                <span aria-hidden="true">→</span>
              </button>
            </div>
          </div>

          <div v-else class="result-card">
            <div class="result-medal" aria-hidden="true">{{ resultMedal }}</div>
            <span class="eyebrow">Concurso completado</span>
            <h2>{{ resultMessage }}</h2>
            <p>Buen trabajo, {{ store.playerName }}. Este es el resumen de tu partida.</p>
            <div class="result-points">
              {{ store.points }} <small>/ {{ store.questionCount * 10 }} puntos</small>
            </div>
            <div class="result-stats">
              <div class="result-stat">
                <strong>{{ store.accuracy }}%</strong>
                <span>Precisión</span>
              </div>
              <div class="result-stat">
                <strong>{{ store.correctAnswers }}/{{ store.questionCount }}</strong>
                <span>Aciertos</span>
              </div>
              <div class="result-stat">
                <strong>{{ formattedTime(store.elapsedSeconds) }}</strong>
                <span>Tiempo</span>
              </div>
            </div>
            <p>
              {{
                store.lastResultRank
                  ? `¡Has quedado en la posición ${store.lastResultRank} del ranking!`
                  : 'Te has quedado fuera del top 10. ¡Inténtalo de nuevo para mejorar tu marca!'
              }}
            </p>
            <div class="result-actions">
              <button class="button button-orange" type="button" @click="playAgain">
                Jugar de nuevo <span aria-hidden="true">↻</span>
              </button>
              <RouterLink class="button button-outline" to="/ranking">Ver ranking</RouterLink>
            </div>
          </div>
        </section>

        <aside v-if="store.phase === 'intro'" class="side-card">
          <span class="card-kicker">Así se juega</span>
          <div class="how-to-list">
            <div class="how-to-item">
              <span class="how-to-number">1</span>
              <span><strong>Escucha</strong><span>Cinco preguntas incluyen un fragmento de audio.</span></span>
            </div>
            <div class="how-to-item">
              <span class="how-to-number">2</span>
              <span><strong>Responde</strong><span>Contesta quince preguntas de música y sobre Queen.</span></span>
            </div>
            <div class="how-to-item">
              <span class="how-to-number">3</span>
              <span><strong>Consigue puntos</strong><span>Cada acierto suma 10 puntos a tu resultado.</span></span>
            </div>
          </div>
          <div class="side-tip">El audio se puede volver a escuchar mientras el contador esté activo.</div>
        </aside>

        <aside v-else-if="store.phase === 'playing' || store.phase === 'feedback'" class="side-card">
          <span class="card-kicker">Tu partida</span>
          <h2>{{ store.playerName }}</h2>
          <div class="side-score"><span>Marcador</span><strong>{{ store.points }} pts</strong></div>
          <div class="side-score"><span>Respuestas correctas</span><strong>{{ store.correctAnswers }}</strong></div>
          <div class="side-score"><span>Tiempo de juego</span><strong>{{ formattedTime(store.elapsedSeconds) }}</strong></div>
          <div class="side-tip">Los empates en puntos se resuelven a favor de quien complete la partida en menos tiempo.</div>
        </aside>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import AnswerOptions from '../components/AnswerOptions.vue'
import AudioPlayer from '../components/AudioPlayer.vue'
import PageHeading from '../components/PageHeading.vue'
import { useCompetitionStore } from '../stores/competition'

const store = useCompetitionStore()
const playerNameInput = ref('')
const formError = ref('')
let timer: ReturnType<typeof setInterval> | undefined

const currentQuestion = computed(() => store.currentQuestion)
const resultMedal = computed(() => {
  if (store.accuracy >= 80) return '🏆'
  if (store.accuracy >= 50) return '🎵'
  return '🎧'
})
const resultMessage = computed(() => {
  if (store.accuracy >= 80) return '¡Oído extraordinario!'
  if (store.accuracy >= 50) return '¡Muy buen oído!'
  return '¡Sigue practicando!'
})

function formattedTime(seconds: number) {
  const minutes = Math.floor(seconds / 60)
  const remaining = String(seconds % 60).padStart(2, '0')
  return `${minutes}:${remaining}`
}

function beginGame() {
  const name = playerNameInput.value.trim()
  if (!name) {
    formError.value = 'Escribe tu nombre para empezar el concurso.'
    return
  }
  if (name.length > 24) {
    formError.value = 'El nombre no puede tener más de 24 caracteres.'
    return
  }

  formError.value = ''
  store.startGame(name)
}

function playAgain() {
  playerNameInput.value = store.playerName
  store.resetToIntro()
}

watch(
  () => [store.phase, store.currentQuestionIndex] as const,
  ([phase]) => {
    if (timer) clearInterval(timer)
    if (phase === 'playing') {
      timer = setInterval(store.tickSecond, 1000)
    }
  },
  { immediate: true },
)

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>
