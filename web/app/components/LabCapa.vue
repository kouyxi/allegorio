<script setup lang="ts">
import type { Artigo } from '~/types/artigo'

defineProps<{ artigo: Artigo }>()
</script>

<template>
  <!-- Variante B: capa de revista. A foto é o fundo, o texto entra por cima
       numa faixa preta. Depende de foto forte, o que hoje é um risco. -->
  <NuxtLink class="capa" :to="artigo.path">
    <img :src="`/img/${artigo.imagem}.jpg`" :alt="artigo.legenda" width="1500" height="900">

    <div class="capa__faixa">
      <p class="kicker lbl">
        <span class="acc-on">{{ artigo.pilar }}</span>
        <span>{{ artigo.minutos }} min</span>
        <span>{{ artigo.legenda }}</span>
      </p>
      <h2 class="fat capa__titulo">{{ artigo.title }}</h2>
      <p class="capa__dek">{{ artigo.summary }}</p>
    </div>
  </NuxtLink>
</template>

<style scoped>
.capa {
  position: relative;
  display: block;
  text-decoration: none;
  border-bottom: var(--bar) solid var(--ink);
  overflow: hidden;
}

.capa img {
  width: 100%;
  height: clamp(320px, 62vh, 620px);
  object-fit: cover;
}

.capa__faixa {
  position: absolute;
  inset: auto 0 0 0;
  background: color-mix(in oklab, var(--ink) 88%, transparent);
  color: var(--paper);
  padding: clamp(1rem, 2.4vw, 2rem);
  display: grid;
  gap: 0.6rem;
}

.acc-on { color: var(--paper); font-variation-settings: "wdth" 100, "wght" 700; }

/* palavra mais longa "GRAMATURA", 9 letras, cabe na largura cheia com folga */
.capa__titulo { font-size: clamp(1.5rem, 4.4vw, 3.4rem); }

.capa__dek {
  max-width: 62ch;
  color: var(--dim-on-ink);
  font-size: 0.8125rem;
}

.capa:hover .capa__faixa { background: var(--ink); }
</style>
