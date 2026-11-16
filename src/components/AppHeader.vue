<template>
  <header class="site-header">
    <div class="header-inner">
      <RouterLink class="brand" to="/" aria-label="Melodía, inicio">
        <span>melodía<span class="brand-dot">.</span></span>
      </RouterLink>

      <nav class="main-nav" aria-label="Navegación principal">
        <RouterLink to="/">Inicio</RouterLink>
        <RouterLink to="/jugar">El concurso</RouterLink>
        <RouterLink to="/ranking">Ranking</RouterLink>
      </nav>

      <RouterLink class="button button-small button-orange header-cta" to="/jugar">
        Jugar ahora <span aria-hidden="true">→</span>
      </RouterLink>
    </div>
  </header>
</template>

<script setup>
import { RouterLink } from 'vue-router'
</script>
