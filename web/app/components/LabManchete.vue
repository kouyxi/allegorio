<script setup lang="ts">
import type { Artigo } from '~/types/artigo'

defineProps<{ artigo: Artigo, apoio: Artigo[] }>()
</script>

<template>
  <!-- Variante C: a manchete é a imagem. Nenhuma foto no topo, o tipo ocupa
       a tela sozinho. Funciona sem acervo fotográfico, que é a situação real. -->
  <section class="manchete">
    <div class="shell">
      <p class="kicker lbl">
        <span class="acc">{{ artigo.pilar }}</span>
        <span class="dim">{{ artigo.minutos }} min de leitura</span>
      </p>

      <NuxtLink class="manchete__link" :to="artigo.path">
        <h2 class="fat manchete__titulo">{{ artigo.title }}</h2>
      </NuxtLink>

      <div class="manchete__pe">
        <p class="dim manchete__dek">{{ artigo.summary }}</p>
        <NuxtLink class="more" :to="artigo.path">Ler →</NuxtLink>
      </div>
    </div>

    <div class="tira">
      <NuxtLink v-for="a in apoio" :key="a.path" class="tira__item plate" :to="a.path">
        <img :src="`/img/thumb/${a.imagem}.jpg`" :alt="a.legenda" width="170" height="170" loading="lazy">
        <span class="tira__txt lbl">{{ a.title }}</span>
      </NuxtLink>
    </div>
  </section>
</template>

<style scoped>
.manchete { border-bottom: var(--bar) solid var(--ink); }
.manchete .shell { padding-block: clamp(1.5rem, 3.4vw, 3rem); }
.manchete__link { text-decoration: none; display: block; margin-block: 0.9rem; }

/* palavra mais longa "GRAMATURA" = 9 letras; a 5.2rem dá 468px numa
   coluna de 1400px, então sobra folga mesmo em telas médias */
.manchete__titulo {
  font-size: clamp(1.9rem, 6.4vw, 5.2rem);
  line-height: 0.9;
}

.manchete__link:hover .manchete__titulo { color: var(--accent-ink); }

.manchete__pe {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: clamp(1rem, 3vw, 3rem);
  flex-wrap: wrap;
  border-top: var(--bar) solid var(--ink);
  padding-top: 0.9rem;
}

.manchete__dek { max-width: 56ch; font-size: 0.8125rem; }

.tira {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  border-top: var(--bar) solid var(--ink);
}

.tira__item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6rem;
  border-right: var(--bar) solid var(--ink);
  text-decoration: none;
  min-width: 0;
}

.tira__item:last-child { border-right: 0; }
.tira__item:hover { background: var(--ink); color: var(--paper); }
.tira__item:hover img { filter: invert(1); }

.tira__item img {
  width: 2.75rem;
  height: 2.75rem;
  object-fit: cover;
  flex: none;
}

.tira__txt { line-height: 1.35; }

@media (max-width: 780px) {
  .tira { grid-template-columns: 1fr; }
  .tira__item { border-right: 0; border-bottom: var(--bar) solid var(--ink); }
  .tira__item:last-child { border-bottom: 0; }
}
</style>
