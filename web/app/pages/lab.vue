<script setup lang="ts">
import type { Artigo } from '~/types/artigo'

const { data: artigos } = await useAsyncData('lab-artigos', () =>
  queryCollection('artigos').order('date', 'DESC').all()
)

const todos = computed(() => (artigos.value ?? []) as unknown as Artigo[])
const destaque = computed(() => todos.value.find(a => a.destaque) ?? todos.value[0])
const apoio = computed(() => todos.value.filter(a => a !== destaque.value).slice(0, 3))

const VARIANTES = [
  {
    id: 'A',
    nome: 'Assinatura + capa',
    tese: 'O que está no ar hoje. Nome grande, faixa de declaração, matéria de capa ao lado da foto.',
    forte: 'Diz o que é o site antes de pedir qualquer coisa.',
    fraco: 'Ocupa duas telas antes do primeiro artigo inteiro aparecer.'
  },
  {
    id: 'E',
    nome: 'A pergunta',
    tese: 'A home abre com a pergunta que o artigo responde, e não com a resposta. É a primeira etapa do método virada para fora.',
    forte: 'Nenhuma publicação de moda faz isso, e o formato já é o seu.',
    fraco: 'Pergunta fraca derruba a home inteira naquela semana.'
  },
  {
    id: 'F',
    nome: 'Tríptico',
    tese: 'Três painéis verticais de altura cheia, como vitrine. O resumo sobe do rodapé quando o cursor entra.',
    forte: 'É o mais próximo de loja de roupa, e dá presença física às fotos.',
    fraco: 'Três destaques do mesmo peso não estabelecem hierarquia.'
  },
  {
    id: 'G',
    nome: 'Ficha técnica',
    tese: 'A home é a ficha da própria publicação: o que é, para quem, como funciona, o que não faz.',
    forte: 'Responde a pergunta de quem chega sem contexto, que é todo mundo agora.',
    fraco: 'Não convida a ler nada. Parece página institucional.'
  },
  {
    id: 'H',
    nome: 'Sumário',
    tese: 'Página de sumário de revista. Lista numerada com títulos grandes e uma imagem à direita que troca conforme o cursor passa.',
    forte: 'Densidade alta com elegância, e a imagem única resolve a falta de acervo.',
    fraco: 'Só funciona bem no desktop. No celular vira lista comum.'
  },
  {
    id: 'B',
    nome: 'Capa de revista',
    tese: 'A foto ocupa a tela e o texto entra por cima numa faixa preta.',
    forte: 'É o que mais parece publicação de moda de verdade.',
    fraco: 'Depende de foto forte. Com acervo emprestado, entrega a fraqueza logo na abertura.'
  },
  {
    id: 'C',
    nome: 'Manchete gigante',
    tese: 'Nenhuma foto no topo. A manchete ocupa a tela sozinha, com uma tira de apoio embaixo.',
    forte: 'Funciona sem acervo fotográfico, que é a situação real hoje.',
    fraco: 'Uma manchete fraca não tem onde se esconder.'
  },
  {
    id: 'D',
    nome: 'Catálogo',
    tese: 'Sem matéria de capa. Abre como arquivo, tudo no mesmo peso visual.',
    forte: 'Ótimo para quem volta e já sabe o que procura.',
    fraco: 'Quem chega pela primeira vez não recebe nenhuma hierarquia.'
  }
]

useHead({
  title: 'Lab · Allegorio',
  meta: [{ name: 'robots', content: 'noindex' }]
})
</script>

<template>
  <div>
    <section class="intro slab shell">
      <div class="head">
        <h1 class="fat">Lab</h1>
        <p class="lbl dim">Diagramação · não é página pública</p>
      </div>
      <p class="dim intro__p">
        A interface é monocromática, então não há mais paleta a testar: a cor
        do site vem das fotografias e chega conforme elas entram na tela. As
        oito variantes abaixo mudam só a abertura da home, que é onde a decisão
        de layout realmente pesa.
      </p>
    </section>

    <template v-if="destaque">
      <template v-for="v in VARIANTES" :key="v.id">
        <div class="marca">
          <div class="marca__in shell">
            <p class="marca__id fat">{{ v.id }}</p>
            <div>
              <h2 class="fat marca__nome">{{ v.nome }}</h2>
              <p class="marca__tese">{{ v.tese }}</p>
            </div>
            <dl class="marca__notas lbl">
              <div><dt class="acc">A favor</dt><dd>{{ v.forte }}</dd></div>
              <div><dt class="dim">Contra</dt><dd>{{ v.fraco }}</dd></div>
            </dl>
          </div>
        </div>

        <NuxtLink v-if="v.id === 'A'" class="ponteiro shell lbl" to="/">
          Variante A é a home atual. Abrir em /
        </NuxtLink>
        <LabPergunta v-else-if="v.id === 'E'" :artigo="destaque" :apoio="apoio" />
        <LabTriptico v-else-if="v.id === 'F'" :artigos="todos" />
        <LabFicha v-else-if="v.id === 'G'" :artigos="todos" />
        <LabSumario v-else-if="v.id === 'H'" :artigos="todos" />
        <LabCapa v-else-if="v.id === 'B'" :artigo="destaque" />
        <LabManchete v-else-if="v.id === 'C'" :artigo="destaque" :apoio="apoio" />
        <LabCatalogo v-else :artigos="todos" />
      </template>
    </template>

    <p v-else class="shell lbl dim vazio">
      Sem artigos para montar as variantes.
    </p>
  </div>
</template>

<style scoped>
.intro__p { max-width: 68ch; }
.intro__p code { font-variation-settings: "wdth" 90, "wght" 600; }

.marca {
  background: var(--ink);
  color: var(--paper);
  border-bottom: var(--bar) solid var(--ink);
}

.marca__in {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) minmax(0, 18rem);
  align-items: start;
  gap: clamp(0.9rem, 2.4vw, 2rem);
  padding-block: clamp(0.9rem, 2vw, 1.4rem);
}

.marca__id {
  font-size: clamp(1.6rem, 3.6vw, 2.6rem);
  color: var(--accent);
  line-height: 0.85;
}

.marca__nome { font-size: clamp(1rem, 1.9vw, 1.4rem); }
.marca__tese { margin-top: 0.4rem; font-size: 0.8125rem; color: var(--dim-on-ink); max-width: 52ch; }

.marca__notas { display: grid; gap: 0.5rem; }
.marca__notas dd { margin: 0; color: var(--dim-on-ink); text-transform: none; letter-spacing: 0; }

.ponteiro {
  display: block;
  padding-block: clamp(1.5rem, 3vw, 2.5rem);
  border-bottom: var(--bar) solid var(--ink);
  text-decoration: none;
}

.ponteiro:hover { color: var(--accent-ink); }
.vazio { display: block; padding-block: 4rem; }

@media (max-width: 860px) {
  .marca__in { grid-template-columns: auto minmax(0, 1fr); }
  .marca__notas { grid-column: 1 / -1; }
}
</style>
