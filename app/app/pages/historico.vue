<script setup lang="ts">
import { RECOMMENDATION_CONTEXTS } from '~/data/demo'
import type { CollectionItem, SavedOutfit } from '~/types/domain'
import { CLIMATE_ICONS, CLIMATE_LABELS, CONTEXT_ICONS, daysSince } from '~/utils/recommend'
import { plural } from '~/utils/format'

/**
 * O que já foi vestido.
 *
 * Cada "Usei hoje" gravava uma combinação e marcava a data nas peças, e nenhuma
 * tela mostrava nada disso. Dado que entra e não sai não é registro, é lixo com
 * custo de escrita.
 *
 * A página responde a duas perguntas que a pessoa faz de verdade: o que eu usei
 * na semana passada, e o que está encostado no armário.
 */
const { items, itemById, owned, categoryById } = useCollection()
const { outfits, removeOutfit } = useOutfits()
const repetir = useRepetir()
const router = useRouter()

const FORMATO = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })

interface Dia { chave: string, titulo: string, combinacoes: Combinacao[] }
interface Combinacao { registro: SavedOutfit, pecas: CollectionItem[], contexto: string, hora: string }

/* Peça removida do acervo continua no `itemIds` de combinações antigas. Filtrar
   aqui é o que evita a linha virar um buraco sem nome. */
const dias = computed<Dia[]>(() => {
  const mapa = new Map<string, Dia>()

  for (const registro of outfits.value) {
    const chave = registro.createdAt.slice(0, 10)
    const data = new Date(registro.createdAt)
    if (Number.isNaN(data.getTime())) continue

    const titulo = FORMATO.format(data)
    const dia = mapa.get(chave) ?? { chave, titulo: titulo.charAt(0).toUpperCase() + titulo.slice(1), combinacoes: [] }

    dia.combinacoes.push({
      registro,
      pecas: registro.itemIds.map(id => itemById.value.get(id)).filter((peca): peca is CollectionItem => Boolean(peca)),
      contexto: RECOMMENDATION_CONTEXTS.find(entry => entry.id === registro.contextId)?.label ?? registro.contextId,
      hora: data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    })

    mapa.set(chave, dia)
  }

  return [...mapa.values()].sort((a, b) => b.chave.localeCompare(a.chave))
})

const usados = computed(() => outfits.value.filter(registro => registro.worn).length)

/* Encostadas: as peças adquiridas que estão há mais tempo sem registro. É o
   outro lado da penalidade de recência que o recomendador já aplica, e o único
   jeito de a pessoa ver por que uma peça vive sumindo da sugestão. */
const encostadas = computed(() => {
  const ordenadas = [...owned.value].sort((a, b) => {
    const diasA = daysSince(a.lastWornAt) ?? Infinity
    const diasB = daysSince(b.lastWornAt) ?? Infinity
    return diasB - diasA
  })

  return ordenadas.slice(0, 6).map(peca => ({
    peca,
    quando: peca.lastWornAt ? `${daysSince(peca.lastWornAt)} dias` : 'nunca',
    categoria: categoryById.value.get(peca.categoryId)?.name ?? ''
  }))
})

function refazer(combinacao: Combinacao) {
  repetir.value = {
    contextId: combinacao.registro.contextId,
    climate: combinacao.registro.climate,
    itemIds: combinacao.pecas.map(peca => peca.id)
  }
  router.push('/')
}

function voltar() {
  if (window.history.length > 1) router.back()
  else router.push('/')
}

useHead({ title: 'Histórico · Allegorio' })
</script>

<template>
  <div class="hist">
    <header class="hist__head rise">
      <button type="button" class="hist__back" @click="voltar">
        <AppIcon name="chevron" size="1rem" :weight="2.2" />
        Voltar
      </button>
      <p class="label dimmer">
        {{ plural(outfits.length, 'combinação guardada', 'combinações guardadas') }}
        <template v-if="usados"> · {{ usados }} usadas</template>
      </p>
      <h1 class="display display-lg">Histórico</h1>
    </header>

    <template v-if="dias.length">
      <section v-for="(dia, i) in dias" :key="dia.chave" class="dia rise" :class="`rise-${Math.min(i + 1, 5)}`">
        <h2 class="dia__titulo">{{ dia.titulo }}</h2>

        <article
          v-for="combinacao in dia.combinacoes"
          :key="combinacao.registro.id"
          class="reg card card--flat"
        >
          <header class="reg__head">
            <span class="reg__tag">
              <AppIcon :name="CONTEXT_ICONS[combinacao.registro.contextId] ?? 'spark'" size="0.875rem" :weight="2.2" />
              <span class="label">{{ combinacao.contexto }}</span>
            </span>
            <span class="reg__tag">
              <AppIcon :name="CLIMATE_ICONS[combinacao.registro.climate]" size="0.875rem" :weight="2.2" />
              <span class="label">{{ CLIMATE_LABELS[combinacao.registro.climate] }}</span>
            </span>
            <span class="reg__hora num">{{ combinacao.hora }}</span>
          </header>

          <ul v-if="combinacao.pecas.length" class="reg__pecas">
            <li v-for="peca in combinacao.pecas" :key="peca.id">
              <NuxtLink class="reg__peca" :to="`/item/${peca.id}`">
                <ItemAmostra :item="peca" class="reg__amostra" />
                <span class="reg__nome">{{ peca.name }}</span>
              </NuxtLink>
            </li>
          </ul>
          <p v-else class="reg__sumiu">As peças desta combinação não estão mais no acervo.</p>

          <footer class="reg__pe">
            <span v-if="combinacao.registro.worn" class="reg__usado">
              <AppIcon name="check" size="0.8125rem" :weight="2.4" />
              <span class="label">Usado</span>
            </span>
            <span v-else class="label dimmer">Só guardado</span>

            <button
              v-if="combinacao.pecas.length"
              type="button"
              class="link-quiet"
              @click="refazer(combinacao)"
            >
              <AppIcon name="shuffle" size="0.9375rem" />
              Montar de novo
            </button>
            <button
              type="button"
              class="icon-btn reg__apagar"
              :aria-label="`Apagar registro de ${combinacao.hora}`"
              @click="removeOutfit(combinacao.registro.id)"
            >
              <AppIcon name="trash" size="1rem" />
            </button>
          </footer>
        </article>
      </section>
    </template>

    <div v-else class="empty rise rise-1">
      <span class="empty__icon"><AppIcon name="clock" size="1.375rem" /></span>
      <h2>Nada registrado ainda</h2>
      <p>Toque em "Usei hoje" na tela de hoje e a combinação passa a aparecer aqui.</p>
      <NuxtLink class="btn" to="/">Ir para hoje</NuxtLink>
    </div>

    <section v-if="encostadas.length && items.length > 3" class="parado rise rise-5">
      <div class="sec-head">
        <h2 class="sec-head__title">
          <AppIcon name="hanger" size="1.0625rem" />
          Encostadas
        </h2>
      </div>
      <p class="parado__note">
        As que estão há mais tempo sem registro. O recomendador já dá preferência a elas,
        mas quem decide se a peça ainda merece espaço é você.
      </p>
      <ul class="parado__lista card card--flat">
        <li v-for="entrada in encostadas" :key="entrada.peca.id">
          <NuxtLink class="parado__item" :to="`/item/${entrada.peca.id}`">
            <ItemAmostra :item="entrada.peca" class="parado__amostra" />
            <span class="parado__copy">
              <span class="parado__nome">{{ entrada.peca.name }}</span>
              <span class="parado__cat label dimmer">{{ entrada.categoria }}</span>
            </span>
            <span class="parado__quando num">{{ entrada.quando }}</span>
          </NuxtLink>
        </li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
.hist__head { margin-bottom: var(--s6); }
.hist__back {
  display: inline-flex;
  align-items: center;
  gap: var(--s1);
  min-height: var(--tap);
  margin-bottom: var(--s1);
  margin-left: calc(var(--s2) * -1);
  padding-inline: var(--s2);
  border: 0;
  border-radius: var(--r-full);
  background: transparent;
  color: var(--ink-3);
  font-size: var(--fs-xs);
  font-variation-settings: "wght" 620;
  transition: background var(--t-fast) var(--ease), color var(--t-fast) var(--ease);
}
.hist__back .ico { transform: rotate(180deg); }
.hist__back:hover { background: var(--paper-2); color: var(--ink); }
.hist__head h1 { margin-top: var(--s2); }

.dia { margin-top: var(--s7); }
.dia__titulo {
  margin-bottom: var(--s3);
  color: var(--ink-3);
  font-size: var(--fs-micro);
  font-variation-settings: "wght" 700;
  letter-spacing: 0.055em;
  text-transform: uppercase;
}

.reg { padding: var(--pad); }
.reg + .reg { margin-top: var(--s3); }

.reg__head {
  display: flex;
  align-items: center;
  gap: var(--s2);
  padding-bottom: var(--s3);
  border-bottom: 1px solid var(--line);
}
.reg__tag {
  display: inline-flex;
  align-items: center;
  gap: var(--s1);
  padding: var(--s1) var(--s2);
  border-radius: var(--r-full);
  background: var(--paper-2);
  color: var(--ink-2);
}
.reg__hora { margin-left: auto; color: var(--ink-4); font-size: 0.625rem; }

.reg__pecas { display: grid; gap: var(--s1); padding-block: var(--s2); }
.reg__peca {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  gap: var(--s3);
  padding: var(--s1) 0;
}
.reg__amostra { width: 2rem; height: 2rem; }
.reg__nome {
  overflow: hidden;
  font-size: var(--fs-sm);
  font-variation-settings: "wght" 600;
  letter-spacing: -0.016em;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.reg__sumiu { padding-block: var(--s3); color: var(--ink-4); font-size: var(--fs-xs); line-height: 1.45; }

.reg__pe {
  display: flex;
  align-items: center;
  gap: var(--s3);
  padding-top: var(--s2);
  border-top: 1px solid var(--line);
}
.reg__usado {
  display: inline-flex;
  align-items: center;
  gap: var(--s1);
  padding: var(--s1) var(--s2);
  border-radius: var(--r-full);
  background: var(--ink);
  color: var(--ink-inv);
}
.reg__pe .link-quiet { margin-left: auto; }
.reg__apagar { width: 2.25rem; height: 2.25rem; color: var(--ink-4); }

.parado { margin-top: var(--s9); padding-top: var(--s6); border-top: 1px solid var(--line); }
.parado__note { margin-bottom: var(--s4); color: var(--ink-3); font-size: var(--fs-xs); line-height: 1.5; }
.parado__lista { overflow: hidden; }
.parado__lista > li + li { border-top: 1px solid var(--line); }
.parado__item {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: var(--s3);
  min-height: 3.5rem;
  padding: var(--s2) var(--pad);
  transition: background var(--t) var(--ease);
}
.parado__item:hover { background: var(--card-2); }
.parado__amostra { width: 2.25rem; height: 2.25rem; }
.parado__copy { display: grid; gap: 0.0625rem; min-width: 0; }
.parado__nome {
  overflow: hidden;
  font-size: var(--fs-sm);
  font-variation-settings: "wght" 620;
  letter-spacing: -0.016em;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.parado__quando { color: var(--ink-4); font-size: 0.625rem; white-space: nowrap; }
</style>
