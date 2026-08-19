<script setup lang="ts">
import type { Artigo } from '~/types/artigo'

defineProps<{ artigo: Artigo, numero: string }>()
</script>

<template>
  <NuxtLink class="row" :to="artigo.path">
    <!-- o selo do próprio artigo: mesma família, nunca o mesmo desenho -->
    <span class="row__selo">
      <VaultSeal :semente="artigo.path" />
      <span class="row__n num">{{ numero }}</span>
    </span>

    <img
      class="row__img"
      :src="`/img/thumb/${artigo.imagem}.jpg`"
      :alt="artigo.legenda"
      width="170"
      height="170"
      loading="lazy"
    >

    <span class="row__t">{{ artigo.title }}</span>
    <span class="row__k dim">{{ artigo.pilar }}</span>
    <span class="row__d dim num">{{ artigo.minutos }} min</span>
  </NuxtLink>
</template>

<style scoped>
.row {
  display: grid;
  grid-template-columns: 2.5rem 3.25rem minmax(0, 1fr) minmax(0, 9rem) 4.5rem;
  gap: clamp(0.75rem, 2vw, 1.5rem);
  align-items: center;
  padding: clamp(0.7rem, 1.6vw, 1rem) 0.75rem;
  margin-inline: -0.75rem;
  border-bottom: var(--hair) solid var(--hair-c);
  text-decoration: none;
  transition: background 60ms linear, color 60ms linear;
}

.row:hover {
  background: var(--ink);
  color: var(--paper);
}

.row:hover .dim { color: var(--paper); }
.row:hover .row__img { filter: invert(1); }

.row__selo {
  display: grid;
  justify-items: center;
  gap: 0.2rem;
}

.row__selo :deep(svg) { width: 1.6rem; }

.row__n {
  font-family: var(--display);
  font-variation-settings: "wdth" 100, "wght" 900;
  font-size: 0.625rem;
}

.row__img {
  width: 3.25rem;
  height: 3.25rem;
  object-fit: cover;
}

.row__t {
  font-family: var(--display);
  font-variation-settings: "wdth" 102, "wght" 700;
  font-size: clamp(0.95rem, 1.7vw, 1.3rem);
  text-transform: uppercase;
  letter-spacing: -0.02em;
  line-height: 1.1;
  overflow-wrap: break-word;
}

.row__k,
.row__d {
  font-size: 0.6875rem;
  text-transform: uppercase;
}

.row__d { text-align: right; }

@media (max-width: 860px) {
  .row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem 0.9rem;
  }

  .row__img { width: 3rem; height: 3rem; }
  .row__t { flex: 1 1 100%; }
  .row__d { margin-left: auto; }
}
</style>
