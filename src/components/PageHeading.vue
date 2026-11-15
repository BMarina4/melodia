<template>
  <div>
    <h1 class="page-title">{{ title }}</h1>
    <p class="page-lead">{{ description }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  description: string
}>()
</script>
