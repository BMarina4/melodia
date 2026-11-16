<template>
  <div class="app-shell">
    <AppHeader />
    <RouterView />
    <AppFooter />
  </div>
</template>

<script setup>
import { RouterView } from 'vue-router'
import AppFooter from './components/AppFooter.vue'
import AppHeader from './components/AppHeader.vue'
</script>
