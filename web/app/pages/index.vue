<script setup lang="ts">
import type { Artigo } from '~/types/artigo'

const { data: artigos } = await useAsyncData('home-artigos', () =>
  queryCollection('artigos').order('date', 'DESC').all()
)

const todos = computed(() => (artigos.value ?? []) as unknown as Artigo[])
const destaque = computed(() => todos.value.find(a => a.destaque) ?? todos.value[0])
const chamadas = computed(() => todos.value.filter(a => a !== destaque.value).slice(0, 3))

/** Caminho de entrada: uma ordem curada sobre artigos que já existem. */
const CAMINHO = [
  { slug: 'gramatura', gloss: 'O que o número da etiqueta quer dizer.' },
  { slug: 'a-calca-decide-a-silhueta', gloss: 'Por onde o olho começa a ler um look.' },
  { slug: 'jaqueta-de-trabalho', gloss: 'A troca que rende mais no começo.' },
  { slug: 'preto-com-preto', gloss: 'Um erro comum, com conserto simples.' }
]

const caminho = computed(() =>
  CAMINHO.map(p => ({ ...p, artigo: todos.value.find(a => a.path.endsWith(`/${p.slug}`)) }))
    .filter((p): p is typeof p & { artigo: Artigo } => Boolean(p.artigo))
)

/** Prancha de materiais: quadro fixo, não conteúdo editorial. */
const MATERIA = [
  { img: 'g-weave', alt: 'Trama de sarja vista de perto', nome: 'Sarja 3x1 · algodão' },
  { img: 'f-linen', alt: 'Tecido de linho escuro', nome: 'Linho · fio torcido' },
  { img: 'h-coat', alt: 'Lã de casaco em macro', nome: 'Lã batida · casaco' },
  { img: 'b-twill-sq', alt: 'Sarja de algodão mostrando o diagonal', nome: 'Índigo · desbotado' }
]

const METODO = [
  ['A pergunta', 'A primeira linha do texto diz o que ele pretende responder.'],
  ['O mecanismo', 'Explicamos por que funciona. Decorar uma regra não ajuda quando aparece um caso diferente.'],
  ['Exemplo e contraexemplo', 'Mostramos onde funciona e também onde deixa de funcionar.'],
  ['Fato, convenção, preferência', 'Gramatura é fato, botão de baixo aberto é convenção, barra larga é gosto nosso. A gente separa os três.'],
  ['Contexto brasileiro', '28 graus em maio, frete caro e tabela de tamanho que não bate mudam a resposta.'],
  ['Os limites', 'Falamos onde a conclusão para de valer, antes que você descubra na prática.'],
  ['A ação', 'Sempre tem algo para testar com o que já está no armário.']
]

/** O cursor governa o eixo de largura da assinatura. */
const nameplate = ref<HTMLElement | null>(null)

onMounted(() => {
  if (!matchMedia('(pointer: fine)').matches) return
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return

  const mover = (e: PointerEvent) => {
    nameplate.value?.style.setProperty('--w', (98 + (e.clientX / innerWidth) * 27).toFixed(1))
  }

  addEventListener('pointermove', mover, { passive: true })
  onUnmounted(() => removeEventListener('pointermove', mover))
})

useHead({
  title: 'Allegorio, fundamentos antes de tendência',
  meta: [{
    name: 'description',
    content: 'Publicação independente de moda masculina. A gente explica tecido, caimento, proporção e combinação em termos técnicos, aplicados à vida que você já tem.'
  }]
})
</script>

<template>
  <div>
    <!-- ── masthead: as letras são distribuídas, então o nome cabe em
         qualquer largura sem nunca ser cortado ──────────────────────── -->
    <section class="masthead">
      <div class="masthead__meta lbl">
        <span class="dim">Publicação independente sobre roupa masculina</span>
        <span class="dim">Brasil</span>
      </div>

      <h1 ref="nameplate" class="nameplate" aria-label="Allegorio">
        <span v-for="(letra, i) in 'ALLEGORIO'" :key="i" aria-hidden="true">{{ letra }}</span>
      </h1>
    </section>

    <!-- tudo abaixo desliza por cima do masthead fixo -->
    <div class="folha">
    <!-- ── declaração: o que é o site e o pedido, tudo acima da dobra ── -->
    <section class="claim">
      <div class="claim__seal">
        <VaultSeal />
      </div>

      <p class="claim__tese">
        Uma jaqueta de trabalho conta uma história, um mocassim conta outra.
        <strong>Roupa nenhuma é neutra</strong>, e isso é uma boa notícia:
        significa que dá para escolher o que ela vai dizer.
      </p>

      <a class="claim__cta" href="#carta">
        <span class="lbl">Grátis · um e-mail por artigo · sai em 1 clique</span>
        <span class="claim__go">Assinar<br>a carta →</span>
      </a>
    </section>

    <template v-if="destaque">
      <!-- ── matéria de capa ──────────────────────────────────────── -->
      <article class="lead">
        <figure class="lead__fig plate">
          <img
            :src="`/img/${destaque.imagem}.jpg`"
            :alt="destaque.legenda"
            width="760"
            height="950"
          >
          <figcaption class="lbl">{{ destaque.legenda }}</figcaption>
        </figure>

        <div class="lead__body">
          <div>
            <p class="kicker lbl">
              <span class="acc">{{ destaque.pilar }}</span>
              <span class="dim">{{ destaque.minutos }} min</span>
            </p>
            <h2 class="fat lead__title">{{ destaque.title }}</h2>
          </div>

          <p class="dek dim">{{ destaque.summary }}</p>

          <NuxtLink class="more" :to="destaque.path">Ler o artigo →</NuxtLink>
        </div>
      </article>

      <!-- ── chamadas ─────────────────────────────────────────────── -->
      <div v-if="chamadas.length" class="cols rise">
        <StoryCard v-for="a in chamadas" :key="a.path" :artigo="a" />
      </div>
    </template>

    <p v-else class="vazio shell lbl dim">
      Nenhum artigo publicado ainda.
    </p>

    <SiteTicker />

    <!-- ── comece aqui ────────────────────────────────────────────── -->
    <section v-if="caminho.length" id="comece" class="slab shell rise">
      <div class="head">
        <h2 class="fat">Comece aqui</h2>
        <p class="lbl dim">Quatro leituras · nessa ordem</p>
      </div>

      <div class="path">
        <NuxtLink
          v-for="(passo, i) in caminho"
          :key="passo.slug"
          class="path__step"
          :to="passo.artigo.path"
        >
          <span class="path__n acc">{{ String(i + 1).padStart(2, '0') }}</span>
          <h3 class="fat path__t">{{ passo.artigo.title }}</h3>
          <p class="dim">{{ passo.gloss }}</p>
        </NuxtLink>
      </div>
    </section>

    <!-- ── matéria: fotografia como prova, com legenda técnica ────── -->
    <section class="strip rise" aria-label="Matéria">
      <figure v-for="m in MATERIA" :key="m.img" class="plate">
        <img :src="`/img/${m.img}.jpg`" :alt="m.alt" width="700" height="875" loading="lazy">
        <figcaption class="lbl">{{ m.nome }}</figcaption>
      </figure>
    </section>

    <!-- ── a palavra ──────────────────────────────────────────────── -->
    <section class="slab slab--ink">
      <img class="slab__tex" src="/img/f-linen.jpg" alt="" aria-hidden="true" loading="lazy">
      <div class="shell">
        <p class="lbl acc mb">A palavra</p>
        <h2 class="shout">Alegoria:<br>quando uma coisa<br>quer dizer outra</h2>
        <p class="lead-p">
          Alegoria é quando uma coisa carrega o sentido de outra. É o que roupa
          faz o tempo todo, e você já está sendo lido na entrevista, no
          aniversário da família e na fila do café.
        </p>
        <p class="lead-p dim">
          A diferença entre ser lido e escrever o próprio texto é repertório, e é
          nisso que a gente resolveu trabalhar.
        </p>
      </div>
    </section>

    <!-- ── o critério ─────────────────────────────────────────────── -->
    <section id="criterio" class="slab shell rise">
      <div class="head">
        <h2 class="fat">O critério</h2>
        <p class="lbl dim">As três perguntas que toda análise responde</p>
      </div>

      <div class="triad">
        <div>
          <p class="lbl dim">Firmitas</p>
          <h3 class="fat triad__q">Aguenta?</h3>
          <p class="dim">
            Gramatura, costura, forro e aviamento. É o que decide se a peça chega
            inteira no terceiro ano ou vira pano de chão no segundo.
          </p>
        </div>
        <div>
          <p class="lbl dim">Utilitas</p>
          <h3 class="fat triad__q">Serve pra sua vida?</h3>
          <p class="dim">
            Seu clima, sua rotina e seu orçamento. Casaco bonito com 30 graus lá fora
            não serve para nada, e a gente prefere dizer isso a fingir que você mora
            em Milão.
          </p>
        </div>
        <div>
          <p class="lbl dim">Venustas</p>
          <h3 class="fat triad__q">Vale olhar?</h3>
          <p class="dim">
            Proporção, cor e silhueta. Aqui a gente está dando opinião, então marca
            como opinião em vez de vender como regra.
          </p>
        </div>
      </div>
    </section>

    <!-- ── índice ─────────────────────────────────────────────────── -->
    <section v-if="todos.length" id="indice" class="slab shell rise">
      <div class="head">
        <h2 class="fat">Índice</h2>
        <NuxtLink class="lbl dim" to="/artigos">Ver o índice completo →</NuxtLink>
      </div>

      <IndexRow
        v-for="(a, i) in todos.slice(0, 5)"
        :key="a.path"
        :artigo="a"
        :numero="String(i + 1).padStart(3, '0')"
      />
    </section>

    <!-- ── o método ───────────────────────────────────────────────── -->
    <section class="slab shell rise">
      <div class="head">
        <h2 class="fat">O método</h2>
        <p class="lbl dim">Sete etapas que todo texto daqui percorre</p>
      </div>

      <ol class="method">
        <li v-for="([titulo, texto], i) in METODO" :key="titulo" class="step">
          <span class="step__n acc">{{ String(i + 1).padStart(2, '0') }}</span>
          <div>
            <h3 class="step__t">{{ titulo }}</h3>
            <p class="step__d dim">{{ texto }}</p>
          </div>
        </li>
      </ol>
    </section>

    <!-- ── a carta ────────────────────────────────────────────────── -->
    <section id="carta" class="carta rise">
      <div class="carta__left">
        <p class="lbl mb">Newsletter</p>
        <h2 class="fat carta__title">A carta</h2>
        <p class="carta__lede">
          Um e-mail quando sai artigo novo, com a ideia principal resumida e algum
          exemplo que não coube na versão publicada.
        </p>

        <NewsletterForm />

        <p class="carta__honest">
          Ainda não temos número de assinantes que valha a pena mostrar. Quando
          tiver, a gente publica o número de verdade.
        </p>
      </div>

      <div class="carta__right">
        <dl>
          <div class="spec">
            <dt class="lbl acc">Frequência</dt>
            <dd class="dim">Acompanha a publicação. A gente não inventa calendário só para parecer que tem movimento.</dd>
          </div>
          <div class="spec">
            <dt class="lbl acc">Conteúdo</dt>
            <dd class="dim">A ideia principal em uma página, um exemplo extra e o link para ler tudo.</dd>
          </div>
          <div class="spec">
            <dt class="lbl acc">Não enviamos</dt>
            <dd class="dim">Promoção, contagem regressiva ou link de afiliado disfarçado de recomendação.</dd>
          </div>
          <div class="spec">
            <dt class="lbl acc">Saída</dt>
            <dd class="dim">Um clique no rodapé, sem aquela página perguntando se você tem certeza.</dd>
          </div>
        </dl>
      </div>
    </section>
    </div>
  </div>
</template>

<style scoped>
.mb { margin-bottom: 0.9rem; }
.vazio { display: block; padding-block: 4rem; }

/* ── masthead ──────────────────────────────────────────────────────────
   Fica preso no topo enquanto o conteúdo passa por cima. A assinatura é
   dimensionada em vw puro, sem teto em rem: é o teto que produzia letras
   pequenas e vãos enormes em tela larga. O space-between continua ali só
   para absorver a diferença entre a largura real do tipo e o container,
   então o vão fica em poucos pixels em vez de virar espaçamento. */
.masthead {
  position: sticky;
  top: var(--bar-h);
  z-index: 0;
  border-bottom: var(--bar) solid var(--ink);
  padding-inline: var(--gutter);
}

.folha {
  position: relative;
  z-index: 1;
  background: var(--paper);
}

.masthead__meta {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  padding-block: 0.55rem;
  border-bottom: var(--hair) solid var(--hair-c);
}

.nameplate {
  display: flex;
  justify-content: space-between;
  overflow: hidden;
  padding-block: 0.4rem 0.2rem;
}

.nameplate span {
  font-family: var(--display);
  font-variation-settings: "wdth" var(--w, 125), "wght" 900;
  /* medido, não estimado: "ALLEGORIO" em wdth 125 / wght 900 tem 7.752em
     naturais; com -0.045em de tracking dá 7.347em. A 12.6vw isso preenche
     exatamente a largura útil no celular e deixa ~9px de vão no desktop,
     que o space-between distribui. */
  font-size: 12.6vw;
  line-height: 0.78;
  letter-spacing: -0.045em;
  animation: fatten 760ms cubic-bezier(0.2, 0.9, 0.2, 1);
}

.nameplate span:nth-child(1) { animation-delay: 0ms; }
.nameplate span:nth-child(2) { animation-delay: 40ms; }
.nameplate span:nth-child(3) { animation-delay: 80ms; }
.nameplate span:nth-child(4) { animation-delay: 120ms; }
.nameplate span:nth-child(5) { animation-delay: 160ms; }
.nameplate span:nth-child(6) { animation-delay: 200ms; }
.nameplate span:nth-child(7) { animation-delay: 240ms; }
.nameplate span:nth-child(8) { animation-delay: 280ms; }
.nameplate span:nth-child(9) { animation-delay: 320ms; }

/* ── declaração ───────────────────────────────────────────────────────
   Faixa fina entre a assinatura e a capa: selo, tese e pedido. Existe
   para que quem chega saiba o que é o site sem precisar rolar. */
.claim {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: stretch;
  border-bottom: var(--bar) solid var(--ink);
}

.claim__seal {
  display: grid;
  place-items: center;
  padding-inline: clamp(1rem, 2.4vw, 2rem);
  border-right: var(--bar) solid var(--ink);
}

.claim__seal :deep(svg) {
  width: clamp(58px, 7vw, 96px);
  animation: turn 70s linear infinite;
}

.claim__tese {
  padding: clamp(1rem, 2.2vw, 1.75rem) clamp(1rem, 2.4vw, 2.25rem);
  align-self: center;
  max-width: 44ch;
  font-size: clamp(0.9375rem, 1.5vw, 1.3rem);
  line-height: 1.45;
}

.claim__tese strong { font-variation-settings: "wdth" 78, "wght" 700; }

.claim__cta {
  background: var(--ink);
  color: var(--paper);
  padding: clamp(0.9rem, 2vw, 1.4rem);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 0.75rem;
  text-decoration: none;
  min-width: 0;
}

.claim__cta:hover { background: var(--accent); color: var(--on-accent); }

.claim__go {
  font-family: var(--display);
  font-variation-settings: "wdth" 106, "wght" 900;
  font-size: clamp(1.1rem, 1.9vw, 1.7rem);
  line-height: 0.95;
  text-transform: uppercase;
  letter-spacing: -0.02em;
}

@media (max-width: 780px) {
  .claim { grid-template-columns: auto minmax(0, 1fr); }
  .claim__cta {
    grid-column: 1 / -1;
    border-top: var(--bar) solid var(--ink);
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
  .claim__go br { display: none; }
}

/* ── matéria de capa ──────────────────────────────────────────────── */
.lead {
  display: grid;
  grid-template-columns: minmax(0, 0.78fr) minmax(0, 1.22fr);
  border-bottom: var(--bar) solid var(--ink);
}

.lead__fig {
  border-right: var(--bar) solid var(--ink);
}

.lead__fig img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  aspect-ratio: 4 / 3;
}

.lead__body {
  padding: clamp(1rem, 2vw, 1.75rem);
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: clamp(0.75rem, 1.6vw, 1.25rem);
  min-width: 0;
}

/* a palavra mais longa aqui tem 9 letras; 9em a 3.4rem cabem na coluna */
.lead__title {
  font-size: clamp(1.2rem, 2.2vw, 1.85rem);
  margin-top: 0.6rem;
}

.dek {
  font-size: 0.8125rem;
  line-height: 1.6;
  max-width: 52ch;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 4;
  line-clamp: 4;
  overflow: hidden;
}

@media (max-width: 860px) {
  .lead { grid-template-columns: 1fr; }
  .lead__fig { border-right: 0; border-bottom: var(--bar) solid var(--ink); }
  .lead__fig img { aspect-ratio: 3 / 2; }
}

/* ── chamadas ─────────────────────────────────────────────────────── */
.cols {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  border-bottom: var(--bar) solid var(--ink);
}

.cols > :deep(*) { border-right: var(--bar) solid var(--ink); }
.cols > :deep(*:last-child) { border-right: 0; }

@media (max-width: 860px) {
  .cols { grid-template-columns: 1fr; }
  .cols > :deep(*) { border-right: 0; border-bottom: var(--bar) solid var(--ink); }
  .cols > :deep(*:last-child) { border-bottom: 0; }
}

/* ── comece aqui ──────────────────────────────────────────────────── */
.path {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  border: var(--bar) solid var(--ink);
}

.path__step {
  border-right: var(--bar) solid var(--ink);
  padding: clamp(1rem, 2vw, 1.5rem);
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  text-decoration: none;
  min-width: 0;
}

.path__step:last-child { border-right: 0; }
.path__step:hover { background: var(--ink); color: var(--paper); }
.path__step:hover .dim,
.path__step:hover .acc { color: var(--paper); }

.path__n {
  font-family: var(--display);
  font-variation-settings: "wdth" 100, "wght" 900;
  font-size: 1.25rem;
  line-height: 1;
}

.path__t { font-size: clamp(0.85rem, 1.2vw, 1rem); }

@media (max-width: 860px) {
  .path { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .path__step:nth-child(2n) { border-right: 0; }
  .path__step:nth-child(-n+2) { border-bottom: var(--bar) solid var(--ink); }
}

@media (max-width: 480px) {
  .path { grid-template-columns: 1fr; }
  .path__step { border-right: 0; border-bottom: var(--bar) solid var(--ink); }
  .path__step:last-child { border-bottom: 0; }
}

/* ── matéria ──────────────────────────────────────────────────────── */
.strip {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  border-bottom: var(--bar) solid var(--ink);
}

.strip .plate {
  aspect-ratio: 1 / 1;
  border-right: var(--bar) solid var(--ink);
  min-width: 0;
}

.strip .plate:last-child { border-right: 0; }

@media (max-width: 860px) {
  .strip { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .strip .plate:nth-child(2n) { border-right: 0; }
  .strip .plate:nth-child(-n+2) { border-bottom: var(--bar) solid var(--ink); }
}

/* ── a palavra ────────────────────────────────────────────────────── */
.lead-p {
  max-width: 56ch;
  margin-top: clamp(1rem, 2.2vw, 1.5rem);
  font-size: 0.875rem;
}

.lead-p + .lead-p { margin-top: 1rem; }

/* ── o critério ───────────────────────────────────────────────────── */
.triad {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  border: var(--bar) solid var(--ink);
}

.triad > div {
  border-right: var(--bar) solid var(--ink);
  padding: clamp(1.25rem, 2.5vw, 2rem);
  min-width: 0;
}

.triad > div:last-child { border-right: 0; }
.triad__q {
  font-size: clamp(1.05rem, 1.9vw, 1.4rem);
  margin-block: 0.4rem 0.9rem;
}

.triad p { font-size: 0.75rem; }

@media (max-width: 780px) {
  .triad { grid-template-columns: 1fr; }
  .triad > div { border-right: 0; border-bottom: var(--bar) solid var(--ink); }
  .triad > div:last-child { border-bottom: 0; }
}

/* ── o método ─────────────────────────────────────────────────────── */
.method {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0 clamp(1.5rem, 4vw, 4rem);
}

.step {
  display: grid;
  grid-template-columns: 2.25rem minmax(0, 1fr);
  gap: 0.9rem;
  align-items: baseline;
  padding-block: 0.8rem;
  border-bottom: var(--hair) solid var(--hair-c);
}

.step__n {
  font-family: var(--display);
  font-variation-settings: "wdth" 100, "wght" 900;
  font-size: 0.9375rem;
}

.step__t {
  font-family: var(--display);
  font-variation-settings: "wdth" 104, "wght" 800;
  font-size: clamp(0.9rem, 1.4vw, 1.05rem);
  text-transform: uppercase;
  line-height: 1.1;
  overflow-wrap: break-word;
}

.step__d {
  font-size: 0.6875rem;
  margin-top: 0.25rem;
}

@media (max-width: 780px) {
  .method { grid-template-columns: 1fr; }
}

/* ── a carta ──────────────────────────────────────────────────────── */
.carta {
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr);
  border-bottom: var(--bar) solid var(--ink);
}

.carta__left {
  background: var(--ink);
  color: var(--paper);
  padding: clamp(1.5rem, 4vw, 3.5rem);
  min-width: 0;
}

.carta__right {
  padding: clamp(1.5rem, 4vw, 3.5rem);
  min-width: 0;
}

.carta__title { font-size: clamp(1.8rem, 4.6vw, 3.2rem); }

.carta__lede {
  margin-top: 1rem;
  max-width: 32ch;
  font-size: 0.875rem;
}

.carta__honest {
  margin-top: 1rem;
  font-size: 0.6875rem;
  line-height: 1.7;
  max-width: 44ch;
  color: var(--dim-on-ink);
}

.spec {
  display: grid;
  grid-template-columns: 8rem minmax(0, 1fr);
  gap: 1rem;
  padding-block: 0.7rem;
  border-top: var(--hair) solid var(--hair-c);
}

.spec:last-of-type { border-bottom: var(--hair) solid var(--hair-c); }
.spec dd { font-size: 0.75rem; }

@media (max-width: 860px) {
  .carta { grid-template-columns: 1fr; }
  .spec { grid-template-columns: 1fr; gap: 0.15rem; }
}
</style>
