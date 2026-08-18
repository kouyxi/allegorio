<script setup lang="ts">
import type { Artigo } from '~/types/artigo'

defineProps<{ artigos: Artigo[] }>()
</script>

<template>
  <!-- Variante D: sem matéria de capa. O site abre como arquivo, tudo no
       mesmo peso. Bom para quem volta, ruim para quem chega sem contexto. -->
  <div class="cat">
    <NuxtLink v-for="a in artigos" :key="a.path" class="cat__item" :to="a.path">
      <div class="cat__fig plate">
        <img :src="`/img/${a.imagem}.jpg`" :alt="a.legenda" width="700" height="700" loading="lazy">
      </div>
      <p class="kicker lbl">
        <span class="acc">{{ a.pilar }}</span>
        <span class="dim">{{ a.minutos }} min</span>
      </p>
      <h3 class="fat cat__titulo">{{ a.title }}</h3>
    </NuxtLink>
  </div>
</template>

<style scoped>
.cat {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  border-bottom: var(--bar) solid var(--ink);
}

.cat__item {
  border-right: var(--bar) solid var(--ink);
  padding: clamp(0.7rem, 1.4vw, 1rem);
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  text-decoration: none;
  min-width: 0;
}

.cat__item:last-child { border-right: 0; }
.cat__item:hover { background: var(--ink); color: var(--paper); }
.cat__item:hover .dim, .cat__item:hover .acc { color: var(--paper); }
.cat__item:hover img { filter: invert(1); }

.cat__fig { aspect-ratio: 1 / 1; }

/* coluna de um quarto: a 1.05rem, "GRAMATURA" ocupa 151px em ~290px úteis */
.cat__titulo { font-size: clamp(0.85rem, 1.2vw, 1.05rem); }

@media (max-width: 980px) {
  .cat { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .cat__item:nth-child(2n) { border-right: 0; }
  .cat__item { border-bottom: var(--bar) solid var(--ink); }
}

@media (max-width: 520px) {
  .cat { grid-template-columns: 1fr; }
  .cat__item { border-right: 0; }
}
</style>
