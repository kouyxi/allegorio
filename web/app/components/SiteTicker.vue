<script setup lang="ts">
const itens = [
  'Fundamentos', 'Peças', 'Aplicação', 'Estilos', 'Análises',
  'Sem hype', 'Sem afiliado disfarçado'
]
</script>

<template>
  <div class="ticker" aria-hidden="true">
    <!-- a lista é duplicada para o translateX(-50%) fechar o laço -->
    <div class="ticker__run lbl">
      <template v-for="volta in 2" :key="volta">
        <template v-for="item in itens" :key="`${volta}-${item}`">
          <span>{{ item }}</span><span>·</span>
        </template>
      </template>
    </div>
  </div>
</template>

<style scoped>
.ticker {
  background: var(--accent);
  color: var(--on-accent);
  border-bottom: var(--bar) solid var(--ink);
  overflow: hidden;
  padding-block: 0.6rem;
}

.ticker__run {
  display: flex;
  width: max-content;
  animation: slide 38s linear infinite;
}

.ticker__run span {
  padding-inline: 1.25rem;
  white-space: nowrap;
}
</style>
