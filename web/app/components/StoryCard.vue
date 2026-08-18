<script setup lang="ts">
import type { Artigo } from '~/types/artigo'

defineProps<{ artigo: Artigo }>()
</script>

<template>
  <NuxtLink class="story" :to="artigo.path">
    <img
      :src="`/img/${artigo.imagem}.jpg`"
      :alt="artigo.legenda"
      width="700"
      height="438"
      loading="lazy"
    >
    <p class="kicker lbl">
      <span class="acc">{{ artigo.pilar }}</span>
      <span class="dim">{{ artigo.minutos }} min</span>
    </p>
    <h3 class="fat story__title">{{ artigo.title }}</h3>
    <p class="dim">{{ artigo.summary }}</p>
  </NuxtLink>
</template>

<style scoped>
.story {
  padding: clamp(1rem, 2vw, 1.5rem);
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  text-decoration: none;
  min-width: 0;
}

.story:hover {
  background: var(--ink);
  color: var(--paper);
}

.story:hover :deep(.dim),
.story:hover :deep(.acc) { color: var(--paper); }

.story:hover img { filter: invert(1); }

.story img {
  width: 100%;
  aspect-ratio: 16 / 10;
  object-fit: cover;
}

/* palavra mais longa esperada tem 9 letras; 9em a 1.75rem = 252px,
   cabe numa coluna de um terço */
.story__title { font-size: clamp(1.05rem, 1.9vw, 1.75rem); }
</style>
