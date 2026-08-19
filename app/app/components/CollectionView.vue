<script setup lang="ts">
import type { CollectionItem, ItemKind, Ownership } from '~/types/domain'
import { itemColor, money, plural } from '~/utils/format'

const props = defineProps<{ ownership: Ownership }>()

const router = useRouter()
const { items, categories, categoryById, markAsOwned, loading } = useCollection()

const kind = ref<'all' | ItemKind>('all')
const categoryId = ref('all')
const search = ref('')
const maxPrice = ref<number | undefined>()
const filtersOpen = ref(false)
const selected = ref<CollectionItem | null>(null)

const detailOpen = computed({
  get: () => selected.value !== null,
  set: (value: boolean) => { if (!value) selected.value = null }
})

const mine = computed(() => items.value.filter(item => item.ownership === props.ownership))

const visibleCategories = computed(() =>
  categories.value.filter(category => kind.value === 'all' || category.kind === kind.value)
)

const filtered = computed(() => mine.value.filter(item => {
  if (kind.value !== 'all' && item.kind !== kind.value) return false
  if (categoryId.value !== 'all' && item.categoryId !== categoryId.value) return false
  if (maxPrice.value && (item.price ?? 0) > maxPrice.value) return false

  const term = search.value.trim().toLocaleLowerCase('pt-BR')
  if (!term) return true
  return `${item.name} ${item.brand} ${item.description} ${item.color ?? ''}`
    .toLocaleLowerCase('pt-BR')
    .includes(term)
}))

const activeFilters = computed(() =>
  Number(categoryId.value !== 'all') + Number(Boolean(maxPrice.value))
)

const totalValue = computed(() => filtered.value.reduce((sum, item) => sum + (item.price ?? 0), 0))

const copy = computed(() => props.ownership === 'wishlist'
  ? {
      title: 'Desejos',
      eyebrow: plural(mine.value.length, 'item no radar', 'itens no radar'),
      emptyTitle: 'Lista vazia',
      emptyBody: 'Salve aqui o que você considera comprar. O filtro de preço trabalha em cima desta lista.'
    }
  : {
      title: 'Acervo',
      eyebrow: plural(mine.value.length, 'peça registrada', 'peças registradas'),
      emptyTitle: 'Acervo vazio',
      emptyBody: 'Cadastre o que você já usa. É este acervo que alimenta a sugestão diária.'
    })

watch(kind, () => { categoryId.value = 'all' })
watch(() => props.ownership, () => {
  search.value = ''
  categoryId.value = 'all'
  maxPrice.value = undefined
})

function clearFilters() {
  categoryId.value = 'all'
  maxPrice.value = undefined
}

/* Ficha do item, em ordem de campo fixa. Roupa e perfume têm ordens próprias e
   nenhuma tela pode inventar outra. */
function ficha(item: CollectionItem) {
  const fields = item.kind === 'scent'
    ? [
        ['Marca', item.brand],
        ['Concentração', item.concentration],
        ['Volume', item.volumeMl ? `${item.volumeMl} ml` : undefined],
        ['Projeção', item.projection && { low: 'Baixa', moderate: 'Moderada', high: 'Alta' }[item.projection]],
        ['Restante', item.remainingPercent !== undefined ? `${item.remainingPercent}%` : undefined]
      ]
    : [
        ['Marca', item.brand],
        ['Cor', item.color],
        ['Tamanho', item.size],
        ['Material', item.material]
      ]

  return fields.filter((entry): entry is [string, string] => Boolean(entry[1]))
}

function acquire(item: CollectionItem) {
  markAsOwned(item.id)
  selected.value = null
  router.push('/acervo')
}
</script>

<template>
  <div class="collection">
    <header class="collection__head rise">
      <p class="label dimmer">{{ copy.eyebrow }}</p>
      <h1 class="display display-lg">{{ copy.title }}</h1>
    </header>

    <div class="collection__tools rise rise-1">
      <label class="search">
        <AppIcon name="search" size="1.0625rem" />
        <span class="sr-only">Buscar</span>
        <input v-model="search" type="search" placeholder="Buscar peça, marca ou cor">
      </label>
      <button
        type="button"
        class="filter-btn"
        :class="{ 'filter-btn--on': activeFilters }"
        :aria-label="`Filtros${activeFilters ? `, ${activeFilters} ativos` : ''}`"
        @click="filtersOpen = true"
      >
        <AppIcon name="filter" size="1.1875rem" />
        <span v-if="activeFilters" class="filter-btn__badge num">{{ activeFilters }}</span>
      </button>
    </div>

    <div class="chip-row chip-row--bleed collection__kinds rise rise-2" data-hscroll role="group" aria-label="Tipo de item">
      <button type="button" class="chip chip--plain" :aria-pressed="kind === 'all'" @click="kind = 'all'">Tudo</button>
      <button type="button" class="chip" :aria-pressed="kind === 'garment'" @click="kind = 'garment'">
        <AppIcon name="hanger" size="1rem" />Roupas
      </button>
      <button type="button" class="chip" :aria-pressed="kind === 'scent'" @click="kind = 'scent'">
        <AppIcon name="scent" size="1rem" />Perfumes
      </button>
      <span class="chip-row__sep" aria-hidden="true" />
      <button
        v-for="category in visibleCategories"
        :key="category.id"
        type="button"
        class="chip chip--plain"
        :aria-pressed="categoryId === category.id"
        @click="categoryId = categoryId === category.id ? 'all' : category.id"
      >{{ category.name }}</button>
    </div>

    <div class="collection__count rise rise-3">
      <span>{{ plural(filtered.length, 'item', 'itens') }}</span>
      <span v-if="totalValue" class="num dim">{{ money(totalValue) }}</span>
    </div>

    <TransitionGroup v-if="filtered.length" tag="div" name="grid" class="collection__grid">
      <ItemCard
        v-for="item in filtered"
        :key="item.id"
        :item="item"
        :category="categoryById.get(item.categoryId)"
        @select="selected = $event"
      />
    </TransitionGroup>

    <div v-else-if="!loading" class="empty">
      <span class="empty__icon">
        <AppIcon :name="search || activeFilters ? 'search' : 'hanger'" size="1.375rem" />
      </span>
      <h2>{{ search || activeFilters ? 'Nada com esse recorte' : copy.emptyTitle }}</h2>
      <p v-if="search || activeFilters">Tente soltar um filtro ou buscar por outra palavra.</p>
      <p v-else>{{ copy.emptyBody }}</p>
      <button v-if="search || activeFilters" type="button" class="btn btn--ghost" @click="clearFilters(); search = ''">
        Limpar
      </button>
      <NuxtLink v-else class="btn" to="/adicionar">
        <AppIcon name="plus" size="1.0625rem" />
        Adicionar item
      </NuxtLink>
    </div>

    <!-- filtros -->
    <AppSheet v-model="filtersOpen" title="Filtros" subtitle="Recorte o que aparece na grade">
      <div class="filters">
        <label class="field">
          <span class="label">Categoria</span>
          <select v-model="categoryId" class="select">
            <option value="all">Todas as categorias</option>
            <option v-for="category in visibleCategories" :key="category.id" :value="category.id">
              {{ category.name }}
            </option>
          </select>
        </label>
        <label class="field">
          <span class="label">Preço máximo</span>
          <input v-model.number="maxPrice" class="input" type="number" inputmode="numeric" min="0" placeholder="Sem limite">
        </label>
      </div>
      <template #footer>
        <div class="filters__actions">
          <button type="button" class="btn btn--quiet" @click="clearFilters">Limpar</button>
          <button type="button" class="btn" @click="filtersOpen = false">Ver {{ filtered.length }}</button>
        </div>
      </template>
    </AppSheet>

    <!-- detalhe do item -->
    <AppSheet
      v-model="detailOpen"
      :title="selected?.name ?? ''"
      :subtitle="selected ? categoryById.get(selected.categoryId)?.name : ''"
    >
      <div v-if="selected" class="detail">
        <div class="detail__visual">
          <ItemVisual
            :item="selected"
            :role="categoryById.get(selected.categoryId)?.role"
            :category-name="categoryById.get(selected.categoryId)?.name"
          />
        </div>

        <dl class="detail__ficha">
          <div v-for="[term, value] in ficha(selected)" :key="term">
            <dt class="label dimmer">{{ term }}</dt>
            <dd>{{ value }}</dd>
          </div>
          <div v-if="selected.price">
            <dt class="label dimmer">Preço</dt>
            <dd class="num">{{ money(selected.price) }}</dd>
          </div>
        </dl>

        <p v-if="selected.description" class="detail__desc">{{ selected.description }}</p>

        <div class="detail__tags">
          <span
            class="detail__color swatch"
            :style="{ '--sw': itemColor(selected.kind, selected.colorHex) }"
            aria-hidden="true"
          />
          <span v-for="tag in selected.styleTags" :key="tag" class="detail__tag label">{{ tag }}</span>
          <span v-if="selected.lastWornAt" class="detail__tag label">usado em {{ selected.lastWornAt }}</span>
        </div>
      </div>

      <template #footer>
        <div v-if="selected" class="detail__actions">
          <NuxtLink class="btn btn--quiet" :to="`/item/${selected.id}`">
            <AppIcon name="pencil" size="1.0625rem" />
            Editar
          </NuxtLink>
          <button v-if="selected.ownership === 'wishlist'" type="button" class="btn" @click="acquire(selected)">
            <AppIcon name="check" size="1.0625rem" />
            Comprei, tenho
          </button>
          <button v-else type="button" class="btn btn--ghost" @click="detailOpen = false">Fechar</button>
        </div>
      </template>
    </AppSheet>
  </div>
</template>

<style scoped>
.collection__head { margin-bottom: var(--s5); }
.collection__head h1 { margin-top: var(--s2); }

.collection__tools {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: var(--s2);
}

.filter-btn {
  position: relative;
  display: grid;
  place-items: center;
  width: 3rem; height: 3rem;
  border: 1px solid var(--line-2);
  border-radius: var(--r-md);
  background: var(--card);
  color: var(--ink-2);
  box-shadow: var(--sh-1);
  transition: background var(--t) var(--ease), color var(--t) var(--ease),
              border-color var(--t) var(--ease), transform var(--t-fast) var(--ease);
}
.filter-btn:active { transform: scale(0.94); }
.filter-btn--on { border-color: var(--ink); background: var(--ink); color: var(--ink-inv); }
.filter-btn__badge {
  position: absolute;
  inset: -0.3125rem -0.3125rem auto auto;
  display: grid;
  place-items: center;
  width: 1.125rem; height: 1.125rem;
  border-radius: var(--r-full);
  background: var(--ink);
  color: var(--ink-inv);
  font-size: 0.5625rem;
  box-shadow: 0 0 0 2px var(--paper);
}

.collection__kinds { margin-top: var(--s3); }
.chip-row__sep {
  flex: 0 0 auto;
  align-self: center;
  width: 1px; height: 1.25rem;
  background: var(--line-2);
}

.collection__count {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--s4);
  margin: var(--s5) 0 var(--s3);
  color: var(--ink-3);
  font-size: var(--fs-xs);
}

.collection__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--s3);
}

.grid-move { transition: transform var(--t-slow) var(--ease); }
.grid-enter-active { transition: opacity var(--t) var(--ease), transform var(--t-slow) var(--ease); }
.grid-leave-active { position: absolute; transition: opacity 160ms ease-in, transform 200ms ease-in; }
.grid-enter-from, .grid-leave-to { opacity: 0; transform: scale(0.94) translateY(var(--s2)); }

.filters { display: grid; gap: var(--s4); padding-top: var(--s2); }
.filters__actions { display: grid; grid-template-columns: auto minmax(0, 1fr); gap: var(--s2); }

.detail { padding-top: var(--s3); }
.detail__visual {
  aspect-ratio: 4 / 3;
  overflow: hidden;
  border-radius: var(--r-md);
  box-shadow: var(--sh-1);
}
.detail__visual > * { width: 100%; height: 100%; }

.detail__ficha {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--s4);
  margin-top: var(--s5);
  padding-top: var(--s4);
  border-top: 1px solid var(--line);
}
.detail__ficha dd { margin-top: var(--s1); font-size: var(--fs-sm); font-variation-settings: "wght" 600; }
.detail__desc { margin-top: var(--s4); color: var(--ink-2); font-size: var(--fs-sm); line-height: 1.55; }

.detail__tags { display: flex; flex-wrap: wrap; align-items: center; gap: var(--s2); margin-top: var(--s4); }
.detail__color { width: 1.5rem; height: 1.5rem; border-radius: var(--r-full); }
.detail__tag { padding: var(--s1) var(--s2); border-radius: var(--r-full); background: var(--paper-2); color: var(--ink-3); }

.detail__actions { display: grid; grid-template-columns: auto minmax(0, 1fr); gap: var(--s2); }
</style>
