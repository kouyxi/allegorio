<script setup lang="ts">
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
        <p class="kicker lbl">
          <span class="acc">{{ artigo.pilar }}</span>
          <span class="dim">{{ artigo.minutos }} min</span>
          <span class="dim">{{ data }}</span>
        </p>
        <h1 class="fat top__title">{{ artigo.title }}</h1>
        <p class="dek dim">{{ artigo.summary }}</p>
      </div>
    </header>

    <div class="prose shell rise">
      <ContentRenderer :value="artigo" />
    </div>

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

@media (max-width: 860px) {
  .carta { grid-template-columns: 1fr; }
}
</style>
