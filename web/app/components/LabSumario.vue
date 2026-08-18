<script setup lang="ts">
import type { Artigo } from '~/types/artigo'

defineProps<{ artigos: Artigo[] }>()

// a miniatura que aparece à direita segue o item sob o cursor
const ativo = ref(0)
</script>

<template>
  <!-- Variante H: página de sumário de revista. Números grandes, títulos em
       lista, e uma única imagem à direita que troca conforme o cursor. -->
  <section class="sum">
    <div class="sum__in shell">
      <ol class="sum__lista">
        <li
          v-for="(a, i) in artigos"
          :key="a.path"
          @mouseenter="ativo = i"
          @focusin="ativo = i"
        >
          <NuxtLink class="sum__item" :class="{ 'sum__item--on': ativo === i }" :to="a.path">
            <span class="sum__n">{{ String(i + 1).padStart(2, '0') }}</span>
            <span class="fat sum__t">{{ a.title }}</span>
            <span class="lbl dim sum__meta">{{ a.pilar }} · {{ a.minutos }} min</span>
          </NuxtLink>
        </li>
      </ol>

      <figure class="sum__fig plate">
        <img
          v-for="(a, i) in artigos"
          v-show="ativo === i"
          :key="a.path"
          :src="`/img/${a.imagem}.jpg`"
          :alt="a.legenda"
          width="700"
          height="875"
        >
        <figcaption class="lbl">{{ artigos[ativo]?.legenda }}</figcaption>
      </figure>
    </div>
  </section>
</template>

<style scoped>
.sum { border-bottom: var(--bar) solid var(--ink); }

.sum__in {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 20rem);
  gap: clamp(1rem, 3vw, 3rem);
  align-items: start;
  padding-block: clamp(1.25rem, 2.6vw, 2rem);
}

.sum__item {
  display: grid;
  grid-template-columns: 2.5rem minmax(0, 1fr) minmax(0, 10rem);
  gap: 0.9rem;
  align-items: baseline;
  padding: clamp(0.5rem, 1.2vw, 0.8rem) 0.75rem;
  margin-inline: -0.75rem;
  border-bottom: var(--hair) solid var(--hair-c);
  text-decoration: none;
  transition: color 60ms linear;
}

.sum__item--on { color: var(--accent-ink); }
.sum__item--on .dim { color: var(--accent-ink); }

.sum__n {
  font-family: var(--display);
  font-variation-settings: "wdth" 100, "wght" 900;
  font-size: 1rem;
  font-variant-numeric: tabular-nums;
}

/* coluna larga, então o título pode crescer bastante */
.sum__t { font-size: clamp(1rem, 2.4vw, 1.9rem); }
.sum__meta { text-align: right; }

.sum__fig {
  position: sticky;
  top: calc(var(--bar-h) + 3.5rem);
  aspect-ratio: 4 / 5;
  border: var(--bar) solid var(--ink);
}

@media (max-width: 860px) {
  .sum__in { grid-template-columns: 1fr; }
  .sum__fig { display: none; }
  .sum__item { grid-template-columns: 2rem minmax(0, 1fr); }
  .sum__meta { grid-column: 2; text-align: left; }
}
</style>
