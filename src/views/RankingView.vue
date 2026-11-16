<template>
  <main class="ranking-page">
    <div class="page-wrap">
      <div class="ranking-header">
        <PageHeading
          title="Ranking musical"
          description="Las diez mejores puntuaciones de este navegador."
        />
        <RouterLink class="button button-orange" to="/jugar">
          {{ leaderboard.length ? 'Mejorar mi marca' : 'Jugar ahora' }}
          <span aria-hidden="true">→</span>
        </RouterLink>
      </div>

      <p v-if="store.storageMessage" class="storage-alert" role="status">
        {{ store.storageMessage }}
      </p>

      <section class="ranking-card" aria-label="Clasificación de puntuaciones">
        <div v-if="leaderboard.length === 0" class="empty-ranking">
          <h2>El ranking está esperando su primera estrella</h2>
        </div>

        <table v-else class="ranking-table">
          <thead>
            <tr>
              <th scope="col">Puesto</th>
              <th scope="col">Jugador</th>
              <th scope="col">Puntos</th>
              <th scope="col">Precisión</th>
              <th scope="col">Tiempo</th>
              <th scope="col">Fecha</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(entry, index) in leaderboard"
              :key="entry.id"
              :class="{ 'is-current': entry.id === store.lastResult?.id }"
            >
              <td>
                <span class="rank-number" :class="{ 'top-rank': index < 3 }">
                  {{ index + 1 }}
                </span>
              </td>
              <td class="player-cell">
                {{ entry.name }}
                <span v-if="entry.id === store.lastResult?.id"> · Tu partida</span>
              </td>
              <td class="points-cell">{{ entry.points }} pts</td>
              <td>{{ entry.accuracy }}%</td>
              <td>{{ formattedTime(entry.durationSeconds) }}</td>
              <td>{{ formattedDate(entry.createdAt) }}</td>
            </tr>
          </tbody>
        </table>
      </section>
    </div>
  </main>
</template>

<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import PageHeading from '../components/PageHeading.vue'
import { useCompetitionStore } from '../stores/competition'

const store = useCompetitionStore()
const leaderboard = computed(() => store.leaderboard)
function formattedTime(seconds) {
  const minutes = Math.floor(seconds / 60)
  return `${minutes}:${String(seconds % 60).padStart(2, '0')}`
}

function formattedDate(value) {
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}
</script>
