<script setup lang="ts">
/**
 * A notação da casa.
 *
 * Um único formato de ficha, com ordem de campos fixa e o mesmo separador em
 * toda parte: legenda de foto, cabeçalho de artigo, linha do índice e figura
 * de desenho técnico. É o equivalente do crédito de foto de uma revista, e a
 * força vem da repetição, então nenhuma chamada deve inventar ordem própria.
 *
 * Ordem canônica para peça e material:
 *   MATÉRIA · CONSTRUÇÃO · PESO · PROCEDÊNCIA
 * Ordem canônica para artigo:
 *   PILAR · AFERIÇÃO · DATA
 */
withDefaults(defineProps<{
  campos: [rotulo: string, valor: string][]
  modo?: 'linha' | 'bloco'
}>(), { modo: 'linha' })
</script>

<template>
  <dl :class="['ficha', `ficha--${modo}`]">
    <div v-for="([rotulo, valor], i) in campos" :key="rotulo" class="ficha__par">
      <dt class="lbl dim">{{ rotulo }}</dt>
      <dd class="ficha__v num">{{ valor }}</dd>
      <span v-if="modo === 'linha' && i < campos.length - 1" class="ficha__sep dim" aria-hidden="true">·</span>
    </div>
  </dl>
</template>

<style scoped>
.ficha {
  font-family: var(--mono);
  font-size: 0.625rem;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}

.ficha__v {
  font-variation-settings: "wdth" 100, "wght" 700;
  margin: 0;
}

/* ── linha: a ficha inteira em uma tira ─────────────────────────────── */
.ficha--linha {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.1rem 0.45rem;
}

.ficha--linha .ficha__par {
  display: flex;
  align-items: baseline;
  gap: 0.35rem;
}

.ficha--linha .ficha__sep { margin-left: 0.45rem; }

/* ── bloco: colunas com o rótulo em cima, para cabeçalho ────────────── */
.ficha--bloco {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 7.5rem), 1fr));
  border-top: var(--bar) solid currentColor;
  padding-top: 0.6rem;
  gap: 0.75rem 1rem;
}

.ficha--bloco .ficha__par {
  display: grid;
  gap: 0.25rem;
  align-content: start;
}

.ficha--bloco .ficha__v { font-size: 0.75rem; }
</style>
