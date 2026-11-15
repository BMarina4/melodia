<template>
  <footer class="site-footer">
    <RouterLink class="brand footer-brand" to="/">
      <span>melodía<span class="brand-dot">.</span></span>
    </RouterLink>
    <span>Un reto para escuchar con atención.</span>
    <RouterLink to="/ranking">Ver el ranking <span aria-hidden="true">→</span></RouterLink>
  </footer>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>
