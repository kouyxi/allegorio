<script setup lang="ts">
defineProps<{
  title: string
  description: string
  path: string
  pillar: string
}>()
</script>

<template>
  <article class="article-card">
    <p class="eyebrow">{{ pillar }}</p>
    <h2><NuxtLink :to="path">{{ title }}</NuxtLink></h2>
    <p>{{ description }}</p>
  </article>
</template>
