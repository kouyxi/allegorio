<script setup lang="ts">
import { RECOMMENDATION_CONTEXTS } from '~/data/demo'
import type { Climate, LookSlot, RecommendationRole } from '~/types/domain'
import {
  buildLook, CLIMATE_ICONS, CLIMATE_LABELS, CONTEXT_ICONS, defaultContextId
} from '~/utils/recommend'
import { plural, today } from '~/utils/format'

const { items, categories, categoryById, owned, wishlist, wearItems, unwearItems, loading, isRemote } = useCollection()
const perfil = useProfile()

/* Primeiro nome só, e só com conta: "Oi, Victor" cabe na linha do rodapé da
   data, "Oi, Victor Kouichi da Silva" não. Sem sessão remota não existe nome
   para mostrar, porque o modo local não tem conta, só acervo no aparelho. */
const primeiroNome = computed(() => {
  if (!isRemote.value) return ''
  return perfil.displayName.value.trim().split(/\s+/)[0] ?? ''
})

/* --- pedir o nome uma vez --- */

/* Quem tem conta e nunca definiu nome recebe a pergunta uma vez, aqui na tela
   de chegada, e não escondida num campo de Ajustes que ninguém visita sem
   motivo. "Agora não" marca uma chave local para não perguntar de novo neste
   navegador; o campo em Ajustes continua disponível a qualquer momento. Só
   decide depois que `perfil.loading` termina, senão a folha abriria e fecharia
   sozinha no instante em que o nome ainda não tinha chegado do servidor. */
const CHAVE_NOME_PERGUNTADO = 'allegorio:nome-perguntado'
const nomeSheetAberta = ref(false)
const nomeSheetDraft = ref('')
const nomeJaDecidido = ref(false)

watchEffect(() => {
  if (nomeJaDecidido.value || !isRemote.value || perfil.loading.value) return
  nomeJaDecidido.value = true

  if (perfil.displayName.value) return
  if (import.meta.client && localStorage.getItem(CHAVE_NOME_PERGUNTADO)) return
  nomeSheetAberta.value = true
})

function pularNomeSheet() {
  if (import.meta.client) localStorage.setItem(CHAVE_NOME_PERGUNTADO, '1')
  nomeSheetAberta.value = false
}

async function salvarNomeSheet() {
  if (!nomeSheetDraft.value.trim()) return
  await perfil.save(nomeSheetDraft.value)
  if (import.meta.client) localStorage.setItem(CHAVE_NOME_PERGUNTADO, '1')
  nomeSheetAberta.value = false
}
const { outfits, record, wornToday, removeOutfit } = useOutfits()
const {
  leitura: leituraClima,
  carregando: climaCarregando,
  manual: climaManual,
  precisar: precisarClima,
  iniciar: iniciarClima
} = useClima()
const repetir = useRepetir()

/* O baralho existe para que a resposta à pergunta "e se não for essa?" seja um
   gesto, não um botão e uma espera. Ele nunca mostra a mesma combinação duas
   vezes: com acervo pequeno o motor cicla, então as repetições são descartadas
   e o baralho encolhe em vez de fingir variedade. Três cartões, não cinco: a
   partir do quarto a escolha vira ruído, e ninguém compara cinco opções antes
   de decidir o que vestir. */
const DECK_MAX = 3
const SEEDS = 10

const contextId = ref(defaultContextId())
const climate = ref<Climate>('mild')
const overrides = ref<Partial<Record<RecommendationRole, string>>>({})
const wornSeed = ref<number | null>(null)
const wornAt = ref<string | null>(null)

const looks = computed(() => {
  const seen = new Set<string>()
  const unique = []

  for (let seed = 0; seed < SEEDS && unique.length < DECK_MAX; seed += 1) {
    const look = buildLook(items.value, categories.value, RECOMMENDATION_CONTEXTS, {
      contextId: contextId.value,
      climate: climate.value,
      seed,
      overrides: overrides.value
    })
    const signature = look.items.map(item => item.id).join('|')
    if (seen.has(signature)) continue
    seen.add(signature)
    unique.push(look)
  }

  return unique
})

const total = computed(() => looks.value.length)

const context = computed(() =>
  RECOMMENDATION_CONTEXTS.find(entry => entry.id === contextId.value) ?? RECOMMENDATION_CONTEXTS[0]!
)
const day = today()
const hasCollection = computed(() => owned.value.length > 0)
const pinnedCount = computed(() => Object.keys(overrides.value).length)

/* --- baralho --- */
const deck = ref<HTMLElement | null>(null)
const active = ref(0)
const activeLook = computed(() => looks.value[active.value] ?? looks.value[0]!)

function measure() {
  const el = deck.value
  if (!el || el.children.length < 2) return el?.clientWidth ?? 1
  return (el.children[1] as HTMLElement).offsetLeft - (el.children[0] as HTMLElement).offsetLeft
}

function onDeckScroll() {
  const el = deck.value
  if (!el) return
  active.value = Math.max(0, Math.min(total.value - 1, Math.round(el.scrollLeft / measure())))
}

function goToCard(target: number, smooth = true) {
  const el = deck.value
  if (!el) return
  el.scrollTo({ left: measure() * target, behavior: smooth ? 'smooth' : 'auto' })
}

function nextCard() {
  goToCard((active.value + 1) % total.value)
}

/* Mudar de situação ou de clima refaz o baralho inteiro: uma peça escolhida
   para o trabalho não deve ser arrastada para um evento sem revisão. */
function reset() {
  overrides.value = {}
  wornSeed.value = null
  wornAt.value = null
  wornOutfitId.value = null
  wornSnapshot.value = []
  goToCard(0, false)
}

watch([contextId, climate], reset)

/* --- clima --- */

/* O seletor continua existindo e continua ganhando do automático: previsão de
   borda erra, e quem está com frio sabe disso melhor que o termômetro. */
const climaEscolhido = computed<Climate>({
  get: () => climate.value,
  set: valor => {
    climaManual.value = true
    climate.value = valor
  }
})

function voltarAoAutomatico() {
  climaManual.value = false
  if (leituraClima.value?.clima) climate.value = leituraClima.value.clima
}

iniciarClima(valor => { climate.value = valor })

const climaTexto = computed(() => {
  if (climaCarregando.value && !leituraClima.value) return 'Buscando a temperatura'
  if (!leituraClima.value?.disponivel) return 'Sem leitura de temperatura agora'

  const lugar = leituraClima.value.cidade ? `${leituraClima.value.cidade} · ` : ''
  return `${lugar}${leituraClima.value.temperatura}° de sensação`
})

/** Etiqueta de clima do cartão: o grau lido quando existe, o rótulo quando não.
 *  Antes eram três temperaturas fixas escritas no código, que é enfeite. */
const climaEtiqueta = computed(() =>
  leituraClima.value?.disponivel && !climaManual.value
    ? `${leituraClima.value.temperatura}°`
    : CLIMATE_LABELS[climate.value]
)

/* --- repetir uma combinação do histórico --- */

/* Chega uma lista de peças, e o que a tela precisa é papel por peça: é assim
   que a fixação funciona no resto da tela, e é o que faz o baralho respeitar a
   escolha em vez de recalcular por cima dela. */
watch(repetir, pedido => {
  if (!pedido) return

  contextId.value = pedido.contextId
  climate.value = pedido.climate
  climaManual.value = true

  const fixadas: Partial<Record<RecommendationRole, string>> = {}
  for (const id of pedido.itemIds) {
    const peca = items.value.find(entry => entry.id === id)
    const papel = peca && categoryById.value.get(peca.categoryId)?.role
    if (papel && !fixadas[papel]) fixadas[papel] = id
  }

  /* Depois do `watch` de contexto e clima, que zera as fixadas. */
  nextTick(() => {
    overrides.value = fixadas
    repetir.value = null
  })
}, { immediate: true })

/* --- troca de peça --- */
const swapping = ref<LookSlot | null>(null)
const swapOpen = computed({
  get: () => swapping.value !== null,
  set: (value: boolean) => { if (!value) swapping.value = null }
})

function choose(role: RecommendationRole, itemId: string) {
  overrides.value = { ...overrides.value, [role]: itemId }
  swapping.value = null
  wornSeed.value = null
}

function unpin(role: RecommendationRole) {
  const next = { ...overrides.value }
  delete next[role]
  overrides.value = next
  swapping.value = null
}

/* --- registrar uso --- */
const wornOutfitId = ref<string | null>(null)
const wornSnapshot = ref<{ id: string, lastWornAt?: string, wearCount?: number }[]>([])

function wearToday() {
  if (wornSeed.value === active.value || !activeLook.value.items.length) return

  /* O estado anterior de cada peça vai guardado antes da gravação, porque
     desfazer precisa devolver exatamente esse estado, e não um genérico
     "nunca usada": a peça pode já ter uso de dias anteriores. */
  wornSnapshot.value = activeLook.value.items.map(item => ({
    id: item.id,
    lastWornAt: item.lastWornAt,
    wearCount: item.wearCount
  }))
  wearItems(activeLook.value.items.map(item => item.id))
  const outfit = record(contextId.value, climate.value, activeLook.value, true)

  wornOutfitId.value = outfit.id
  wornSeed.value = active.value
  wornAt.value = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

function desfazerUso() {
  if (wornSeed.value !== active.value || !wornOutfitId.value) return

  removeOutfit(wornOutfitId.value)
  unwearItems(wornSnapshot.value)

  wornOutfitId.value = null
  wornSnapshot.value = []
  wornSeed.value = null
  wornAt.value = null
}

onMounted(() => nextTick(onDeckScroll))

useHead({
  title: 'Hoje · Allegorio',
  meta: [{ name: 'description', content: 'Uma combinação de roupa e perfume tirada do seu próprio acervo.' }]
})
</script>

<template>
  <div class="home">
    <header class="home__head rise">
      <p class="home__date label dimmer">
        <AppIcon name="clock" size="0.875rem" :weight="2.2" />
        {{ day.weekday }} · {{ day.date }}{{ primeiroNome ? ` · Oi, ${primeiroNome}` : '' }}
      </p>
      <h1 class="display display-lg">Seu look de hoje</h1>
    </header>

    <template v-if="hasCollection">
      <!-- a situação decide o look, então fica colada nele, e não depois de
           rolar por baixo do baralho inteiro -->
      <section class="situacao rise rise-1">
        <div class="chip-row chip-row--bleed" data-hscroll role="group" aria-label="Situação">
          <button
            v-for="entry in RECOMMENDATION_CONTEXTS"
            :key="entry.id"
            type="button"
            class="chip"
            :aria-pressed="contextId === entry.id"
            @click="contextId = entry.id"
          >
            <AppIcon :name="CONTEXT_ICONS[entry.id] ?? 'spark'" size="1rem" />
            {{ entry.label }}
          </button>
        </div>
        <p class="situacao__nota">{{ context.description }}</p>
      </section>

      <!-- o baralho: arrastar troca a combinação inteira -->
      <div
        ref="deck"
        class="deck rise rise-2"
        :class="{ 'deck--single': total === 1 }"
        data-hscroll
        aria-label="Combinações sugeridas"
        @scroll.passive="onDeckScroll"
      >
        <LookCard
          v-for="(look, i) in looks"
          :key="i"
          :look="look"
          :context="context"
          :climate="climate"
          :clima-etiqueta="climaEtiqueta"
          :position="i + 1"
          :total="total"
          :worn="wornSeed === i"
          @swap="swapping = $event"
        />
      </div>

      <div v-if="total > 1" class="deck__foot rise rise-3">
        <div class="dots" role="tablist" aria-label="Combinação">
          <button
            v-for="(look, i) in looks"
            :key="i"
            type="button"
            role="tab"
            class="dots__dot"
            :class="{ 'dots__dot--on': active === i }"
            :aria-selected="active === i"
            :aria-label="`Combinação ${i + 1}`"
            @click="goToCard(i)"
          />
        </div>
        <span class="deck__hint">
          arraste
          <AppIcon name="arrow" size="0.875rem" :weight="2.2" />
        </span>
      </div>

      <div class="home__actions rise rise-4">
        <button
          type="button"
          class="btn"
          :class="{ 'btn--ghost': wornSeed === active }"
          :disabled="!activeLook.items.length || wornSeed === active"
          @click="wearToday"
        >
          <AppIcon :name="wornSeed === active ? 'clock' : 'check'" size="1.0625rem" />
          {{ wornSeed === active ? `Registrado às ${wornAt}` : 'Usei hoje' }}
        </button>
        <button
          v-if="wornSeed === active"
          type="button"
          class="btn btn--ghost btn--icon"
          aria-label="Desfazer registro de uso"
          @click="desfazerUso"
        >
          <AppIcon name="undo" size="1.0625rem" />
        </button>
        <button v-else-if="total > 1" type="button" class="btn btn--ghost btn--icon" aria-label="Próxima combinação" @click="nextCard">
          <AppIcon name="shuffle" size="1.0625rem" />
        </button>
      </div>

      <p v-if="wornAt" class="home__hint rise">
        As peças ficam com registro de uso de hoje, então as próximas sugestões dão a vez a outras.
        Marcou sem querer? É só desfazer, ali em cima.
      </p>
      <p v-else-if="wornToday" class="home__hint rise">
        Você já registrou um look hoje.
        <NuxtLink class="home__link" to="/historico">Ver no histórico</NuxtLink>
      </p>

      <!-- ajuste vem depois da sugestão, nunca antes -->
      <section class="tune rise rise-5" aria-labelledby="tune-title">
        <div class="sec-head">
          <h2 id="tune-title" class="sec-head__title">
            <AppIcon name="sliders" size="1.0625rem" />
            Ajustar
          </h2>
          <button v-if="pinnedCount" type="button" class="link-quiet" @click="overrides = {}">
            Soltar {{ plural(pinnedCount, 'fixada', 'fixadas') }}
          </button>
        </div>

        <!-- a temperatura chega sozinha; o seletor existe para discordar dela.
             O fundo muda com a leitura real (calor, ameno ou frio), e por isso
             é a única concessão de cor da interface: é dado, não decoração fixa.
             No manual ele desaparece de propósito, para não fingir que aquilo
             ainda é uma leitura do tempo. -->
        <p class="clima" :class="climaManual ? 'clima--manual' : `clima--${climate}`">
          <AppIcon :name="climaManual ? 'pencil' : CLIMATE_ICONS[climate]" size="0.9375rem" :weight="2.1" />
          <span class="clima__texto">
            <template v-if="climaManual">Ajustado à mão · {{ CLIMATE_LABELS[climate] }}</template>
            <template v-else>{{ climaTexto }}</template>
          </span>
          <button v-if="climaManual" type="button" class="clima__voltar" @click="voltarAoAutomatico">
            <AppIcon name="undo" size="0.8125rem" :weight="2.2" />
            Automático
          </button>
          <button
            v-else-if="!leituraClima?.disponivel && !climaCarregando"
            type="button"
            class="link-quiet"
            @click="precisarClima()"
          >
            Usar meu local
          </button>
        </p>

        <AppSegmented
          v-model="climaEscolhido"
          label="Clima"
          :options="(['hot', 'mild', 'cold'] as Climate[]).map(value => ({
            value,
            label: CLIMATE_LABELS[value],
            icon: CLIMATE_ICONS[value]
          }))"
        />

        <p class="tune__fonte">Temperatura por Open-Meteo, sob licença CC BY 4.0.</p>
      </section>
    </template>

    <div v-else-if="!loading" class="empty rise rise-1">
      <span class="empty__icon"><AppIcon name="hanger" size="1.375rem" /></span>
      <h2>Nada no acervo ainda</h2>
      <p>Cadastre três ou quatro peças que você usa de verdade e a primeira combinação já aparece aqui.</p>
      <NuxtLink class="btn" to="/adicionar">
        <AppIcon name="plus" size="1.0625rem" />
        Cadastrar primeira peça
      </NuxtLink>
    </div>

    <NuxtLink v-if="outfits.length" class="hist-link card card--flat rise rise-5" to="/historico">
      <span class="hist-link__ico"><AppIcon name="clock" size="1.0625rem" /></span>
      <span class="hist-link__copy">
        <span class="label dimmer">Histórico</span>
        <strong>{{ plural(outfits.length, 'combinação registrada', 'combinações registradas') }}</strong>
      </span>
      <AppIcon name="chevron" size="1.125rem" class="hist-link__go" />
    </NuxtLink>

    <NuxtLink v-if="wishlist.length" class="wish card card--flat rise rise-5" to="/desejos">
      <span class="wish__stack" aria-hidden="true">
        <ItemAmostra
          v-for="item in wishlist.slice(0, 3)"
          :key="item.id"
          :item="item"
          class="wish__chip"
        />
      </span>
      <span class="wish__copy">
        <span class="label dimmer">Lista de desejos</span>
        <strong>{{ plural(wishlist.length, 'item esperando', 'itens esperando') }}</strong>
      </span>
      <AppIcon name="chevron" size="1.125rem" class="wish__go" />
    </NuxtLink>

    <!-- troca de uma peça sem refazer o look inteiro -->
    <AppSheet
      v-model="swapOpen"
      :title="swapping?.roleLabel ?? ''"
      :subtitle="swapping ? plural(swapping.alternatives.length, 'outra opção no acervo', 'outras opções no acervo') : ''"
    >
      <ul v-if="swapping" class="alts">
        <li>
          <button type="button" class="alt alt--current" @click="unpin(swapping.role)">
            <ItemAmostra :item="swapping.item!" class="alt__swatch" />
            <span class="alt__copy">
              <span class="alt__name">{{ swapping.item!.name }}</span>
              <span class="alt__meta">{{ swapping.item!.brand }}</span>
            </span>
            <span class="alt__tag label">Atual</span>
          </button>
        </li>
        <li v-for="option in swapping.alternatives" :key="option.id">
          <button type="button" class="alt" @click="choose(swapping!.role, option.id)">
            <ItemAmostra :item="option" class="alt__swatch" />
            <span class="alt__copy">
              <span class="alt__name">{{ option.name }}</span>
              <span class="alt__meta">
                {{ [option.brand, option.color, option.size].filter(Boolean).join(' · ') }}
              </span>
            </span>
            <AppIcon name="chevron" size="1rem" class="alt__go" />
          </button>
        </li>
      </ul>
      <p class="alts__note">Fixar uma peça mantém ela em todas as combinações do baralho.</p>
    </AppSheet>

    <!-- pergunta o nome uma vez só, para a saudação daqui ter o que dizer -->
    <AppSheet v-model="nomeSheetAberta" title="Como te chamar?" subtitle="Aparece na saudação desta tela">
      <label class="field">
        <span class="label">Nome</span>
        <input
          v-model="nomeSheetDraft"
          class="input"
          type="text"
          placeholder="Seu nome"
          autocomplete="name"
          autofocus
          @keyup.enter="salvarNomeSheet"
        >
      </label>
      <template #footer>
        <div class="nome-sheet__actions">
          <button type="button" class="btn btn--quiet" @click="pularNomeSheet">Agora não</button>
          <button type="button" class="btn" :disabled="!nomeSheetDraft.trim()" @click="salvarNomeSheet">Salvar</button>
        </div>
      </template>
    </AppSheet>
  </div>
</template>

<style scoped>
/* +4px sobre o --s7 padrão: a seção seguinte (situação, depois o baralho)
   estava colada de mais no cabeçalho. */
.home__head { margin-bottom: var(--s7); }
.home__date { display: flex; align-items: center; gap: var(--s1); }
.home__head h1 { margin-top: var(--s2); max-width: 11ch; }

/* --- situação --- */
/* O baralho logo abaixo tem margem superior negativa de --s3 (é o truque que
   sangra as bordas dele até a tela sem empurrar o conteúdo vizinho), e essa
   margem negativa comia justamente o respiro que deveria existir aqui. Por
   isso o valor não é só --s6: é --s6 mais o --s3 que o baralho vai devorar,
   mais --s1 de folga extra por cima disso. */
.situacao { margin-bottom: calc(var(--s7) + var(--s1)); }
.situacao__nota { min-height: 2.25rem; margin-top: var(--s2); color: var(--ink-3); font-size: var(--fs-xs); line-height: 1.45; }

/* --- baralho --- */
.deck {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: 86%;
  gap: var(--s3);
  margin: calc(var(--s3) * -1) calc(var(--gutter) * -1);
  padding: var(--s3) var(--gutter);
  overflow-x: auto;
  scrollbar-width: none;
  scroll-snap-type: x mandatory;
  scroll-padding-inline: var(--gutter);
  overscroll-behavior-x: contain;
  -webkit-overflow-scrolling: touch;
}
.deck::-webkit-scrollbar { display: none; }
.deck > * { scroll-snap-align: start; scroll-snap-stop: always; }
.deck--single { grid-auto-columns: 100%; }

.deck__foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--s3);
  margin-top: var(--s4);
}
.deck__hint {
  display: inline-flex;
  align-items: center;
  gap: var(--s1);
  color: var(--ink-4);
  font-family: var(--mono);
  font-size: 0.625rem;
  font-variation-settings: "wdth" 75, "wght" 500;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}
.deck__hint .ico { animation: nudge 2.4s var(--ease) infinite; }
@keyframes nudge {
  0%, 62%, 100% { transform: translateX(0); }
  74% { transform: translateX(0.25rem); }
  86% { transform: translateX(0); }
}

/* --- ações --- */
.home__actions { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: var(--s2); margin-top: var(--s5); }
.home__actions:has(> :only-child) { grid-template-columns: minmax(0, 1fr); }
.home__hint { margin-top: var(--s3); color: var(--ink-3); font-size: var(--fs-xs); line-height: 1.45; }
.home__link { color: var(--ink); font-variation-settings: "wght" 620; text-decoration: underline; text-underline-offset: 0.15em; }

/* --- ajuste --- */
.tune { margin-top: var(--s9); }
.tune__fonte { margin-top: var(--s2); color: var(--ink-4); font-size: 0.625rem; letter-spacing: 0.01em; }

/* O fundo por clima é a única concessão de cor da interface, e é consciente:
   quebra a regra de monocromia do sistema visual porque aqui a cor é dado, a
   leitura real de temperatura, e não enfeite solto. Fica contida neste
   indicador só, não vaza para o resto da tela. Cada variante é uma camada de
   gradiente mais grão por cima, para ler como luz e não como ícone plano de
   clima; automático mostra o clima, manual apaga a variante e volta a preto
   fechado, porque naquele estado o valor não é mais uma leitura de verdade. */
.clima {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  display: flex;
  align-items: center;
  gap: var(--s2);
  margin-bottom: var(--s3);
  padding: var(--s3);
  border-radius: var(--r-md);
  color: var(--ink);
  font-size: var(--fs-xs);
  box-shadow: inset 0 0 0 1px rgb(20 18 15 / 8%), var(--sh-1);
  transition: color var(--t) var(--ease), box-shadow var(--t) var(--ease);
}
.clima::before,
.clima::after {
  content: "";
  position: absolute;
  inset: 0;
  z-index: -1;
}
.clima::after {
  opacity: 0.4;
  mix-blend-mode: overlay;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 160 160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.35'/%3E%3C/svg%3E");
}
/* Segunda tentativa, 2026-08-19: a primeira ia para pêssego-claro, que lia
   como suco de laranja e não como calor. Coral mais saturado no brilho e o
   ameno saiu do cinza-azulado neutro para verde-água, que tem identidade
   própria em vez de ser "não-calor-não-frio" por eliminação. */
.clima--hot::before {
  background:
    radial-gradient(120% 150% at 86% -20%, rgb(255 122 84 / 60%), transparent 60%),
    linear-gradient(155deg, #ffd0b3 0%, #ffc194 35%, #f5c9a8 68%, var(--paper-2) 100%);
}
.clima--mild::before {
  background:
    radial-gradient(120% 150% at 20% -25%, rgb(79 174 156 / 42%), transparent 60%),
    linear-gradient(155deg, #c9e2da 0%, #bcd8cf 40%, #dbe6e0 75%, var(--paper-2) 100%);
}
.clima--cold::before {
  background:
    radial-gradient(120% 150% at 50% -25%, rgb(79 127 196 / 40%), transparent 60%),
    linear-gradient(155deg, #c3d6ec 0%, #aec7e6 35%, #dde8f3 72%, var(--paper-2) 100%);
}
.clima--manual {
  color: var(--ink-inv);
  box-shadow: var(--sh-1);
}
.clima--manual::before { background: var(--ink); }
.clima--manual::after { display: none; }
.clima--manual .ico { color: var(--ink-inv); }

.clima__texto { overflow: hidden; white-space: nowrap; text-overflow: ellipsis; font-variation-settings: "wght" 560; }
.clima .link-quiet { min-height: auto; margin-left: auto; white-space: nowrap; }
.clima__voltar {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  margin-left: auto;
  padding: var(--s1) var(--s2);
  border: 1px solid rgb(251 249 244 / 32%);
  border-radius: var(--r-full);
  background: transparent;
  color: var(--ink-inv);
  font-size: var(--fs-micro);
  font-variation-settings: "wght" 650;
  white-space: nowrap;
  transition: background var(--t-fast) var(--ease);
}
.clima__voltar:hover { background: rgb(251 249 244 / 14%); }
.clima__voltar:active { transform: scale(0.96); }

/* --- histórico --- */
.hist-link {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: var(--s3);
  margin-top: var(--s8);
  padding: var(--s3) var(--s4);
  transition: transform var(--t) var(--ease), box-shadow var(--t) var(--ease);
}
.hist-link:active { transform: scale(0.99); }
.hist-link__ico {
  display: grid;
  place-items: center;
  width: 2.5rem; height: 2.5rem;
  border-radius: var(--r-full);
  background: var(--paper-2);
  color: var(--ink-2);
}
.hist-link__copy { display: grid; gap: 0.0625rem; min-width: 0; }
.hist-link__copy strong { font-size: var(--fs-sm); font-variation-settings: "wght" 640; letter-spacing: -0.014em; }
.hist-link__go { color: var(--ink-4); }

/* --- desejos --- */
.wish {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: var(--s3);
  margin-top: var(--s8);
  padding: var(--s3) var(--s4);
  transition: transform var(--t) var(--ease), box-shadow var(--t) var(--ease);
}
.hist-link + .wish { margin-top: var(--s3); }
.wish:active { transform: scale(0.99); }
.wish__stack { display: flex; }
.wish__chip {
  width: 1.75rem; height: 2.125rem;
  border-radius: var(--r-xs);
  box-shadow: inset 0 0 0 1px rgb(20 18 15 / 12%), 0 0 0 2px var(--card);
}
.wish__chip + .wish__chip { margin-left: -0.6875rem; }
.wish__copy { display: grid; gap: 0.0625rem; min-width: 0; }
.wish__copy strong { font-size: var(--fs-sm); font-variation-settings: "wght" 640; letter-spacing: -0.014em; }
.wish__go { color: var(--ink-4); }

/* --- alternativas na folha --- */
.alts { display: grid; gap: var(--s1); }
.alt {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: var(--s3);
  width: 100%;
  padding: var(--s2);
  border: 0;
  border-radius: var(--r-md);
  background: transparent;
  color: inherit;
  text-align: left;
  transition: background var(--t) var(--ease), transform var(--t-fast) var(--ease);
}
.alt:hover { background: var(--paper-2); }
.alt:active { transform: scale(0.985); }
.alt--current { background: var(--card); box-shadow: var(--sh-1); }
.alt__swatch { width: 2.5rem; height: 3rem; }
.alt__copy { display: grid; gap: 0.0625rem; min-width: 0; }
.alt__name {
  overflow: hidden;
  font-size: var(--fs-base);
  font-variation-settings: "wght" 620;
  letter-spacing: -0.018em;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.alt__meta { overflow: hidden; color: var(--ink-3); font-size: var(--fs-xs); white-space: nowrap; text-overflow: ellipsis; }
.alt__go { color: var(--ink-4); }
.alt__tag { padding: var(--s1) var(--s2); border-radius: var(--r-full); background: var(--ink); color: var(--ink-inv); }
.alts__note { margin-top: var(--s4); color: var(--ink-4); font-size: var(--fs-xs); line-height: 1.45; }

.nome-sheet__actions { display: grid; grid-template-columns: auto minmax(0, 1fr); gap: var(--s2); }
</style>
