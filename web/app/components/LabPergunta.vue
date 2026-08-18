<script setup lang="ts">
import type { Artigo } from '~/types/artigo'

defineProps<{ artigo: Artigo, apoio: Artigo[] }>()
</script>

<template>
  <!-- Variante E: a home abre com a pergunta, não com a resposta. É a etapa I
       do método virada para fora, e nenhuma outra publicação de moda faz isso. -->
  <section class="perg">
    <div class="perg__topo shell lbl">
      <span class="dim">Esta semana a gente respondeu</span>
      <span class="acc">{{ artigo.pilar }} · {{ artigo.minutos }} min</span>
    </div>

    <NuxtLink class="perg__link shell" :to="artigo.path">
      <h2 class="fat perg__q">{{ artigo.pergunta }}</h2>
      <p class="perg__resp">
        <span class="lbl acc">Resposta curta</span>
        {{ artigo.summary }}
      </p>
      <span class="more">Resposta longa →</span>
    </NuxtLink>

    <ul class="fila">
      <li v-for="a in apoio" :key="a.path">
        <NuxtLink class="fila__item" :to="a.path">
          <span class="lbl dim">{{ a.pilar }}</span>
          <span class="fila__q">{{ a.pergunta }}</span>
        </NuxtLink>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.perg { border-bottom: var(--bar) solid var(--ink); }

.perg__topo {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  padding-block: 0.6rem;
  border-bottom: var(--hair) solid var(--hair-c);
}

.perg__link {
  display: block;
  text-decoration: none;
  padding-block: clamp(1.5rem, 4vw, 3.5rem);
}

/* pergunta inteira em display: a palavra mais longa aqui tem 9 letras,
   e a 4rem ela ocupa 360px numa coluna de 1400px */
.perg__q {
  font-size: clamp(1.5rem, 4.4vw, 4rem);
  line-height: 0.95;
  max-width: 20ch;
}

.perg__link:hover .perg__q { color: var(--accent-ink); }

.perg__resp {
  margin-top: clamp(1rem, 2.4vw, 1.75rem);
  max-width: 58ch;
  font-size: 0.8125rem;
  color: var(--dim);
  border-left: var(--bar) solid var(--accent);
  padding-left: 0.9rem;
}

.perg__resp .lbl { display: block; margin-bottom: 0.3rem; }
.perg__link .more { margin-top: 1.25rem; display: inline-block; }

.fila {
  border-top: var(--bar) solid var(--ink);
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.fila li { border-right: var(--bar) solid var(--ink); min-width: 0; }
.fila li:last-child { border-right: 0; }

.fila__item {
  display: block;
  padding: clamp(0.8rem, 1.6vw, 1.2rem);
  text-decoration: none;
  height: 100%;
}

.fila__item:hover { background: var(--ink); color: var(--paper); }
.fila__item:hover .dim { color: var(--paper); }

.fila__q {
  display: block;
  margin-top: 0.4rem;
  font-size: 0.8125rem;
  line-height: 1.45;
}

@media (max-width: 780px) {
  .fila { grid-template-columns: 1fr; }
  .fila li { border-right: 0; border-bottom: var(--bar) solid var(--ink); }
  .fila li:last-child { border-bottom: 0; }
}
</style>
