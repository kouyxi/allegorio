<script setup lang="ts">
import type { Artigo } from '~/types/artigo'

defineProps<{ artigos: Artigo[] }>()
</script>

<template>
  <!-- Variante F: três painéis verticais de altura cheia, como vitrine.
       A foto ocupa o painel inteiro e o texto sobe do rodapé no hover. -->
  <div class="trip">
    <NuxtLink
      v-for="(a, i) in artigos.slice(0, 3)"
      :key="a.path"
      class="trip__painel"
      :to="a.path"
    >
      <img :src="`/img/${a.imagem}.jpg`" :alt="a.legenda" width="760" height="950">

      <div class="trip__topo lbl">
        <span>{{ String(i + 1).padStart(2, '0') }}</span>
        <span>{{ a.pilar }}</span>
      </div>

      <div class="trip__pe">
        <h3 class="fat trip__titulo">{{ a.title }}</h3>
        <p class="trip__dek">{{ a.summary }}</p>
      </div>
    </NuxtLink>
  </div>
</template>

<style scoped>
.trip {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  border-bottom: var(--bar) solid var(--ink);
}

.trip__painel {
  position: relative;
  display: block;
  overflow: hidden;
  border-right: var(--bar) solid var(--ink);
  text-decoration: none;
  min-width: 0;
}

.trip__painel:last-child { border-right: 0; }

.trip__painel img {
  width: 100%;
  height: clamp(340px, 68vh, 640px);
  object-fit: cover;
}

.trip__topo {
  position: absolute;
  inset: 0 0 auto 0;
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.6rem 0.75rem;
  background: var(--accent);
  color: var(--on-accent);
}

.trip__pe {
  position: absolute;
  inset: auto 0 0 0;
  background: var(--ink);
  color: var(--paper);
  padding: 0.75rem;
}

/* coluna de um terço: a 1.15rem, 9 letras dão 165px em ~450px úteis */
.trip__titulo { font-size: clamp(0.95rem, 1.5vw, 1.15rem); }

/* o resumo só aparece no hover, então o painel fica limpo em repouso */
.trip__dek {
  font-size: 0.6875rem;
  line-height: 1.5;
  color: var(--dim-on-ink);
  max-height: 0;
  opacity: 0;
  overflow: hidden;
  transition: max-height 120ms linear, opacity 120ms linear, margin-top 120ms linear;
}

.trip__painel:hover .trip__dek {
  max-height: 8rem;
  opacity: 1;
  margin-top: 0.5rem;
}

@media (max-width: 860px) {
  .trip { grid-template-columns: 1fr; }
  .trip__painel { border-right: 0; border-bottom: var(--bar) solid var(--ink); }
  .trip__painel:last-child { border-bottom: 0; }
  .trip__painel img { height: 300px; }
  .trip__dek { max-height: 8rem; opacity: 1; margin-top: 0.5rem; }
}
</style>
