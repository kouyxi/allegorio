<script setup lang="ts">
/**
 * A tira de vocabulário.
 *
 * Antes ela repetia os pilares e duas promessas do tipo "sem hype". Promessa
 * negativa não informa nada e envelhece mal. Agora ela corre o vocabulário
 * que os artigos usam, que é o mesmo trabalho de identidade feito com
 * matéria em vez de slogan.
 */
const termos = [
  'Sarja 3×1', 'Gramatura', 'Selvagem', 'Cava alta', 'Canesu', 'Entretela',
  'Melton', 'Oxford', 'Gancho', 'Pesponto', 'Boca de barra', 'Linha de quebra',
  'Ombro caído', 'Fio 40/1', 'Lã batida', 'Chambray'
]
</script>

<template>
  <div class="ticker">
    <p class="ticker__eixo lbl">Vocabulário</p>
    <div class="ticker__jan" aria-hidden="true">
      <!-- a lista é duplicada para o translateX(-50%) fechar o laço -->
      <div class="ticker__run lbl">
        <template v-for="volta in 2" :key="volta">
          <template v-for="t in termos" :key="`${volta}-${t}`">
            <span>{{ t }}</span><span class="ticker__p">·</span>
          </template>
        </template>
      </div>
    </div>
    <p class="sr">{{ termos.join(', ') }}.</p>
  </div>
</template>

<style scoped>
.ticker {
  background: var(--accent);
  color: var(--on-accent);
  border-bottom: var(--bar) solid var(--ink);
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
}

.ticker__eixo {
  padding: 0.6rem 0.9rem;
  border-right: var(--bar) solid var(--on-accent);
  white-space: nowrap;
}

.ticker__jan {
  overflow: hidden;
  padding-block: 0.6rem;
}

.ticker__run {
  display: flex;
  width: max-content;
  animation: slide 38s linear infinite;
}

.ticker__run span {
  padding-inline: 1rem;
  white-space: nowrap;
}

.ticker__p { opacity: 0.5; }

.sr {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
</style>
