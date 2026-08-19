<script setup lang="ts">
import { NOME_PECA, type Peca } from '~/types/desenho'

const route = useRoute()

const { data: artigo } = await useAsyncData(`artigo-${route.path}`, () =>
  queryCollection('artigos').path(route.path).first()
)

if (!artigo.value) {
  throw createError({ statusCode: 404, statusMessage: 'Artigo não encontrado', fatal: true })
}

const data = computed(() =>
  new Date(artigo.value!.date).toLocaleDateString('pt-BR', { dateStyle: 'long' })
)

/** Ficha do artigo, na ordem canônica da casa. */
const cabecalho = computed<[string, string][]>(() => [
  ['Pilar', artigo.value!.pilar],
  ['Aferição', `${artigo.value!.minutos} min`],
  ['Data', data.value]
])

/** Nome da peça desenhada, quando o artigo declara uma. */
const nomePeca = computed(() => {
  const p = artigo.value?.peca as Peca | undefined
  return p ? NOME_PECA[p] : ''
})

/** Ficha de material, quando o artigo declara uma. */
const ficha = computed<[string, string][]>(() =>
  (artigo.value?.ficha ?? []).map((c: { r: string, v: string }) => [c.r, c.v])
)

useHead({
  title: `${artigo.value.title} · Allegorio`,
  meta: [{ name: 'description', content: artigo.value.summary }]
})
</script>

<template>
  <article v-if="artigo">
    <header class="top">
      <figure class="top__fig plate">
        <img
          :src="`/img/${artigo.imagem}.jpg`"
          :alt="artigo.legenda"
          width="760"
          height="950"
        >
        <figcaption class="lbl">{{ artigo.legenda }}</figcaption>
      </figure>

      <div class="top__body">
        <VaultSeal class="top__selo" :semente="artigo.path" />

        <div>
          <p class="lbl dim mb-x">A pergunta</p>
          <p class="top__q">{{ artigo.pergunta }}</p>
        </div>

        <h1 class="fat top__title">{{ artigo.title }}</h1>
        <p class="dek dim">{{ artigo.summary }}</p>

        <Ficha modo="bloco" :campos="cabecalho" />
      </div>
    </header>

    <div class="prose shell rise">
      <ContentRenderer :value="artigo" />
    </div>

    <section v-if="artigo.peca" class="desenho slab rise" aria-labelledby="des-tit">
      <div class="shell desenho__in">
        <div class="desenho__txt">
          <p class="lbl dim mb-x">Desenho técnico</p>
          <h2 id="des-tit" class="fat desenho__t">{{ nomePeca }}</h2>
          <p class="dim desenho__d">
            Vista de frente. Linha cheia é corte, linha fina é costura de união
            e pontilhado é pesponto.
          </p>
          <Ficha v-if="ficha.length" :campos="ficha" class="desenho__ficha" />
        </div>

        <figure class="desenho__fig">
          <FlatTecnico :peca="artigo.peca" />
        </figure>
      </div>
    </section>

    <section id="carta" class="carta rise">
      <div class="carta__left">
        <p class="lbl mb">Newsletter</p>
        <h2 class="fat carta__title">A carta</h2>
        <p class="carta__lede">
          Um e-mail quando sai artigo novo, com a ideia principal resumida e algum
          exemplo que não coube na versão publicada.
        </p>
        <NewsletterForm />
      </div>
      <div class="carta__right">
        <p class="lbl acc">Próximo passo</p>
        <p class="dim next">
          Todo artigo aqui termina com algo para testar. Se você testou o deste,
          responda a carta contando no que deu. É assim que a próxima pauta
          costuma aparecer.
        </p>
        <NuxtLink class="more" to="/artigos">Ver o índice →</NuxtLink>
      </div>
    </section>
  </article>
</template>

<style scoped>
.mb { margin-bottom: 0.9rem; }

.top {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.15fr);
  border-bottom: var(--bar) solid var(--ink);
}

.top__fig { border-right: var(--bar) solid var(--ink); }

.top__fig img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  aspect-ratio: 5 / 6;
}

.top__body {
  padding: clamp(1.25rem, 3vw, 3rem);
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1.1rem;
  min-width: 0;
}

.top__title { font-size: clamp(1.35rem, 2.6vw, 2.2rem); }

.dek {
  font-size: 0.875rem;
  line-height: 1.65;
  max-width: 48ch;
}

@media (max-width: 860px) {
  .top { grid-template-columns: 1fr; }
  .top__fig { border-right: 0; border-bottom: var(--bar) solid var(--ink); }
  .top__fig img { aspect-ratio: 3 / 2; }
}

/* ── corpo do artigo ───────────────────────────────────────────────
   Mono em texto longo cansa, então aqui a leitura afina a largura do
   eixo e ganha entrelinha. Medida presa em 66ch. */
.prose {
  padding-block: clamp(1.75rem, 3.4vw, 3rem);
  max-width: min(var(--max), 78ch);
}

.prose :deep(p),
.prose :deep(ul) {
  font-variation-settings: "wdth" 76, "wght" 400;
  font-size: 0.9375rem;
  line-height: 1.85;
  max-width: 66ch;
}

.prose :deep(p + p) { margin-top: 1.1rem; }

.prose :deep(h2) {
  font-family: var(--display);
  font-variation-settings: "wdth" 108, "wght" 900;
  font-size: clamp(1rem, 1.8vw, 1.35rem);
  text-transform: uppercase;
  letter-spacing: -0.02em;
  line-height: 1;
  margin-top: clamp(2rem, 4vw, 3rem);
  padding-top: 0.9rem;
  border-top: var(--bar) solid var(--ink);
}

.prose :deep(h2 + p) { margin-top: 1rem; }

.prose :deep(ul) {
  margin-top: 1rem;
  display: grid;
  gap: 0.5rem;
}

.prose :deep(li) { padding-left: 1.1rem; position: relative; }

.prose :deep(li)::before {
  content: "·";
  position: absolute;
  left: 0;
  color: var(--accent-ink);
}

.prose :deep(strong) { font-variation-settings: "wdth" 76, "wght" 700; }

/* ── carta no pé do artigo ─────────────────────────────────────────── */
.carta {
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr);
  border-block: var(--bar) solid var(--ink);
}

.carta__left {
  background: var(--ink);
  color: var(--paper);
  padding: clamp(1.5rem, 4vw, 3.5rem);
  min-width: 0;
}

.carta__right {
  padding: clamp(1.5rem, 4vw, 3.5rem);
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  align-items: flex-start;
  min-width: 0;
}

.carta__title { font-size: clamp(1.8rem, 4.6vw, 3.2rem); }

.carta__lede {
  margin-top: 1rem;
  max-width: 32ch;
  font-size: 0.875rem;
}

.next { max-width: 42ch; }

/* ── cabeçalho ─────────────────────────────────────────────────────── */
.mb-x { margin-bottom: 0.35rem; }

.top__selo { width: 2.5rem; }

/* A pergunta é a etapa I do método, então ela abre o artigo em vez de ficar
   escondida no meio do texto. */
.top__q {
  font-size: clamp(0.9375rem, 1.7vw, 1.125rem);
  line-height: 1.5;
  max-width: 42ch;
  font-variation-settings: "wdth" 82, "wght" 500;
}

/* ── desenho técnico ───────────────────────────────────────────────── */
.desenho__in {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 0.85fr);
  gap: clamp(1.5rem, 4vw, 3.5rem);
  align-items: center;
}

.desenho__t { font-size: clamp(1.4rem, 3vw, 2.2rem); margin-bottom: 0.9rem; }
.desenho__d { max-width: 46ch; }
.desenho__ficha { margin-top: 1.1rem; }

.desenho__fig {
  border: var(--bar) solid var(--ink);
  padding: clamp(0.75rem, 2vw, 1.5rem);
  background-image:
    linear-gradient(to right, var(--hair-c) 0 1px, transparent 1px),
    linear-gradient(to bottom, var(--hair-c) 0 1px, transparent 1px);
  background-size: 1.25rem 1.25rem;
}

.desenho__fig :deep(.flat) { max-height: 52vh; margin-inline: auto; }

@media (max-width: 860px) {
  .desenho__in { grid-template-columns: 1fr; }
}

@media (max-width: 860px) {
  .carta { grid-template-columns: 1fr; }
}
</style>
