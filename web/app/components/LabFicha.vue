<script setup lang="ts">
import type { Artigo } from '~/types/artigo'

defineProps<{ artigos: Artigo[] }>()

const LINHAS = [
  ['O que é', 'Publicação independente sobre roupa masculina, escrita em português e pensada para o Brasil.'],
  ['Para quem', 'Quem usa camiseta, jeans e tênis todo dia e quer amadurecer isso sem virar outra pessoa.'],
  ['Como funciona', 'Todo texto declara a pergunta que responde, explica o mecanismo e termina com algo para testar.'],
  ['Cadência', 'Sai quando fica pronto. A gente não inventa calendário para parecer que tem movimento.'],
  ['Custa', 'Nada. Se um dia existir afiliado, vem declarado no texto.'],
  ['Não faz', 'Lista de tendência, unboxing, "10 peças que todo homem precisa ter".']
]
</script>

<template>
  <!-- Variante G: a home é a ficha técnica da própria publicação. Zero foto,
       zero manchete. Responde "o que é isso" antes de vender qualquer artigo. -->
  <section class="ficha">
    <dl class="ficha__tab shell">
      <div v-for="[termo, texto] in LINHAS" :key="termo" class="ficha__linha">
        <dt class="lbl acc">{{ termo }}</dt>
        <dd>{{ texto }}</dd>
      </div>
    </dl>

    <div class="ficha__agora shell">
      <p class="lbl dim">No ar agora</p>
      <ul class="ficha__lista">
        <li v-for="a in artigos.slice(0, 4)" :key="a.path">
          <NuxtLink class="ficha__item" :to="a.path">
            <span class="fat ficha__t">{{ a.title }}</span>
            <span class="lbl dim">{{ a.pilar }} · {{ a.minutos }} min</span>
          </NuxtLink>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.ficha { border-bottom: var(--bar) solid var(--ink); }

.ficha__tab { padding-block: clamp(1.25rem, 2.6vw, 2rem); }

.ficha__linha {
  display: grid;
  grid-template-columns: 9rem minmax(0, 1fr);
  gap: 1rem;
  padding-block: 0.7rem;
  border-top: var(--hair) solid var(--hair-c);
}

.ficha__linha:first-child { border-top: 0; }
.ficha__linha dt { padding-top: 0.15rem; }
.ficha__linha dd { margin: 0; max-width: 62ch; font-size: 0.8125rem; }

.ficha__agora {
  border-top: var(--bar) solid var(--ink);
  padding-block: clamp(1.25rem, 2.6vw, 2rem);
}

.ficha__lista { margin-top: 0.75rem; }

.ficha__item {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  padding: 0.6rem 0.75rem;
  margin-inline: -0.75rem;
  border-bottom: var(--hair) solid var(--hair-c);
  text-decoration: none;
  transition: background 60ms linear, color 60ms linear;
}

.ficha__item:hover { background: var(--ink); color: var(--paper); }
.ficha__item:hover .dim { color: var(--paper); }

/* linha cheia disponível, mas o texto ainda divide espaço com a etiqueta */
.ficha__t { font-size: clamp(1rem, 2.2vw, 1.6rem); }

@media (max-width: 640px) {
  .ficha__linha { grid-template-columns: 1fr; gap: 0.2rem; }
}
</style>
