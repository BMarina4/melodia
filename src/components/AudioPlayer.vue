<template>
  <div>
    <div class="audio-player">
      <div class="audio-controls">
        <button
          class="audio-play"
          type="button"
          :aria-label="playButtonLabel"
          :title="playButtonLabel"
          :disabled="!canPlay"
          @click="togglePlayback"
        >
          {{ playButtonIcon }}
        </button>
        <button
          v-if="status !== 'idle'"
          class="audio-stop"
          type="button"
          aria-label="Parar la canción"
          title="Parar"
          :disabled="!canPlay"
          @click="stopPlayback"
        >
          ⏹
        </button>
      </div>
      <div class="audio-details">
        <strong>
          {{
            status === 'playing'
              ? 'Reproduciendo audio'
              : status === 'paused'
                ? 'Audio en pausa'
                : 'Escucha la canción'
          }}
        </strong>
        <span>Fragmento musical · Usa auriculares si quieres</span>
      </div>
      <div class="waveform" aria-hidden="true">
        <i v-for="bar in 18" :key="bar"></i>
      </div>
    </div>

    <p v-if="errorMessage" class="form-error" role="alert">{{ errorMessage }}</p>
  </div>
</template>

<script setup>
import { computed, onUnmounted, ref, watch } from 'vue'
import { pauseAudio, playAudio, resumeAudio, stopAudio } from '../utils/audio'

const props = defineProps({
  source: { type: String, required: true },
  canPlay: { type: Boolean, required: true },
})

const status = ref('idle')
const errorMessage = ref('')
const playButtonLabel = computed(() => {
  if (status.value === 'playing') return 'Pausar'
  if (status.value === 'paused') return 'Reanudar'
  return 'Reproducir'
})
const playButtonIcon = computed(() => (status.value === 'playing' ? '⏸' : '▶'))

function togglePlayback() {
  if (!props.canPlay) return

  if (status.value === 'playing') {
    pauseAudio()
    status.value = 'paused'
    return
  }

  if (status.value === 'paused') {
    resumeAudio()
    status.value = 'playing'
    return
  }

  errorMessage.value = ''
  status.value = 'playing'

  playAudio(props.source, {
    onEnd: () => {
      status.value = 'idle'
    },
    onError: (message) => {
      status.value = 'idle'
      errorMessage.value = message
    },
  })
}

function stopPlayback() {
  stopAudio()
  status.value = 'idle'
}

watch(
  () => props.canPlay,
  (canPlay) => {
    if (!canPlay) stopPlayback()
  },
)

onUnmounted(stopPlayback)
</script>
