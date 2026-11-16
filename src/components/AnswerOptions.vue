<template>
  <div>
    <div class="answer-heading">
      Elige una respuesta
      <span>Una opción correcta</span>
    </div>
    <div class="answer-list">
      <button
        v-for="(choice, index) in choices"
        :key="choice.id"
        class="answer-option"
        :class="{
          'is-correct': phase === 'feedback' && choice.id === answerId,
          'is-wrong': phase === 'feedback' && selectedIndex === index && !wasAnswerCorrect,
        }"
        type="button"
        :disabled="phase !== 'playing'"
        @click="$emit('select', index)"
      >
        <span class="answer-letter">{{ String.fromCharCode(65 + index) }}</span>
        <span class="answer-text">{{ choice.label }}</span>
        <span v-if="phase === 'feedback' && choice.id === answerId">✓</span>
        <span v-else-if="phase === 'feedback' && selectedIndex === index">×</span>
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  choices: { type: Array, required: true },
  phase: { type: String, required: true },
  answerId: { type: String, required: true },
  selectedIndex: { type: Number, default: null },
  wasAnswerCorrect: { type: Boolean, required: true },
})

defineEmits(['select'])
</script>
