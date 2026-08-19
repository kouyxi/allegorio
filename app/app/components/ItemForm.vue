<script setup lang="ts">
import { RECOMMENDATION_CONTEXTS } from '~/data/demo'
import type { Climate, CollectionItem, ItemKind, NewItemInput, Ownership } from '~/types/domain'
import type { FotoPronta } from '~/utils/imagem'
import { CLIMATE_ICONS, CLIMATE_LABELS, CONTEXT_ICONS } from '~/utils/recommend'
import { flatFor, quandoUsado } from '~/utils/format'

/* Um formulário só para cadastrar e para editar. Os campos que o recomendador
   lê (formalidade, clima, situação) são justamente os que a pessoa vai querer
   corrigir depois de ver uma sugestão ruim, então manter dois formulários
   parecidos seria garantir que um dos dois ficasse para trás. */
const props = defineProps<{ item?: CollectionItem }>()

const router = useRouter()
const { categories, addItem, updateItem, removeItem, uploadImage } = useCollection()
const fotoAtual = useImagemDoItem(() => props.item)

const editing = computed(() => Boolean(props.item))

/* Paleta de partida. São tons de tecido, não uma roda de cores: o objetivo é
   registrar rápido a cor real da peça, e ajustar no seletor quando não bater. */
const PALETTE = [
  '#f2efe6', '#d8d2c4', '#b9b3a6', '#8d897d', '#4c4c49', '#171715',
  '#9caeb2', '#263b4a', '#3f5545', '#75543c', '#3d2c24', '#8c3f34',
  '#c2a277', '#a8894f', '#6b5f8a', '#b5776f'
]

const kind = ref<ItemKind>(props.item?.kind ?? 'garment')
const ownership = ref<Ownership>(props.item?.ownership ?? 'owned')

const form = reactive({
  name: props.item?.name ?? '',
  brand: props.item?.brand ?? '',
  categoryId: props.item?.categoryId ?? '',
  color: props.item?.color ?? '',
  colorHex: props.item?.colorHex ?? '#b9b3a6',
  size: props.item?.size ?? '',
  material: props.item?.material ?? '',
  concentration: props.item?.concentration ?? 'EDT',
  volumeMl: props.item?.volumeMl,
  projection: props.item?.projection ?? 'moderate',
  price: props.item?.price,
  description: props.item?.description ?? '',
  sourceUrl: props.item?.sourceUrl ?? ''
})

const formality = ref(String(props.item?.formality ?? 2))
const climates = ref<Climate[]>([...(props.item?.climates ?? ['hot', 'mild', 'cold'])])
const contexts = ref<string[]>([...(props.item?.contexts ?? ['everyday'])])
const error = ref('')
const salvando = ref(false)
const confirmingDelete = ref(false)

/* `null` distingue os dois casos que a gravação trata diferente: nada mudou na
   foto, ou a pessoa removeu a que existia. */
const fotoNova = ref<FotoPronta | null>(null)
const fotoRemovida = ref(false)

const kindCategories = computed(() => categories.value.filter(category => category.kind === kind.value))
const category = computed(() => categories.value.find(entry => entry.id === form.categoryId))

/* Ao trocar o tipo, a categoria antiga deixa de valer. Na edição isso só
   dispara se a pessoa mudar o tipo de propósito, e aí a troca é desejada. */
watch(kind, (value, previous) => {
  if (previous !== undefined && value === previous) return
  if (!kindCategories.value.some(entry => entry.id === form.categoryId)) {
    form.categoryId = kindCategories.value[0]?.id ?? ''
  }
  if (value === 'scent' && !props.item && form.colorHex === '#b9b3a6') form.colorHex = '#c2a277'
}, { immediate: true })

function toggleClimate(value: Climate) {
  climates.value = climates.value.includes(value)
    ? climates.value.filter(entry => entry !== value)
    : [...climates.value, value]
}

function toggleContext(value: string) {
  contexts.value = contexts.value.includes(value)
    ? contexts.value.filter(entry => entry !== value)
    : [...contexts.value, value]
}

const previewFlat = computed(() => flatFor(form.name, category.value?.name, category.value?.role, kind.value))
const previewFoto = computed(() => fotoNova.value?.previa ?? (fotoRemovida.value ? undefined : fotoAtual.value))

/* Registro de uso do item, que hoje só existia como número dentro do
   recomendador. Quem edita a peça é quem quer saber se ela anda parada. */
const uso = computed(() => quandoUsado(props.item?.lastWornAt, props.item?.wearCount))

function collect(): NewItemInput {
  return {
    kind: kind.value,
    ownership: ownership.value,
    categoryId: form.categoryId,
    name: form.name.trim(),
    brand: form.brand.trim(),
    description: form.description.trim(),
    price: form.price,
    colorHex: form.colorHex,
    formality: Number(formality.value),
    climates: climates.value,
    contexts: contexts.value.length ? contexts.value : ['everyday'],
    sourceUrl: form.sourceUrl.trim() || undefined,
    ...(kind.value === 'garment'
      ? {
          color: form.color.trim() || undefined,
          size: form.size.trim() || undefined,
          material: form.material.trim() || undefined,
          concentration: undefined,
          volumeMl: undefined,
          projection: undefined
        }
      : {
          color: undefined,
          size: undefined,
          material: undefined,
          concentration: form.concentration,
          volumeMl: form.volumeMl,
          projection: form.projection
        })
  }
}

/**
 * Grava o item.
 *
 * A foto é a única parte que espera a rede antes de a tela mudar. O resto do
 * aplicativo é otimista, mas aqui fingir seria salvar um item apontando para um
 * arquivo que não chegou a existir, e o buraco só apareceria dias depois.
 */
async function submit() {
  if (salvando.value) return

  error.value = ''
  if (!form.name.trim()) return (error.value = 'Falta o nome da peça.')
  if (!form.categoryId) return (error.value = 'Escolha uma categoria.')
  if (!climates.value.length) return (error.value = 'Marque ao menos um clima.')

  const input = collect()

  if (fotoNova.value) {
    salvando.value = true
    try {
      input.imagePath = await uploadImage(fotoNova.value.blob)
      input.imageCutout = fotoNova.value.recortada
    } catch (causa) {
      error.value = causa instanceof Error ? causa.message : 'Não consegui enviar a foto.'
      return
    } finally {
      salvando.value = false
    }
  } else if (fotoRemovida.value) {
    input.imagePath = undefined
    input.imageCutout = false
  } else if (props.item) {
    input.imagePath = props.item.imagePath
    input.imageCutout = props.item.imageCutout
  }

  if (props.item) updateItem(props.item.id, input)
  else addItem(input)

  router.push(ownership.value === 'wishlist' ? '/desejos' : '/acervo')
}

/* `null` chega tanto de uma leitura que falhou quanto de "remover". Só o
   segundo caso emite `remover`, e é ele que decide apagar a foto gravada. */
function aoTrocarFoto(pronta: FotoPronta | null) {
  fotoNova.value = pronta
  if (pronta) fotoRemovida.value = false
}

function back() {
  if (window.history.length > 1) router.back()
  else router.push('/acervo')
}

function destroy() {
  if (!props.item) return
  removeItem(props.item.id)
  router.push('/acervo')
}

useHead({ title: editing.value ? `Editar · ${props.item?.name}` : 'Adicionar · Allegorio' })
</script>

<template>
  <form class="new" novalidate @submit.prevent="submit">
    <header class="new__head rise">
      <button v-if="editing" type="button" class="new__back" @click="back">
        <AppIcon name="chevron" size="1rem" :weight="2.2" />
        Voltar
      </button>
      <p class="label dimmer">{{ editing ? 'Editar registro' : 'Novo registro' }}</p>
      <h1 class="display display-lg">{{ editing ? item!.name : 'Adicionar' }}</h1>
    </header>

    <!-- a prévia mostra a foto quando existe, e o desenho técnico quando não -->
    <section class="preview card rise rise-1" aria-label="Prévia do item">
      <div class="preview__visual" :style="{ '--c': form.colorHex }">
        <img v-if="previewFoto" :src="previewFoto" alt="" class="preview__foto">
        <div v-else class="preview__flat">
          <FlatTecnico :peca="previewFlat" :margem="16" />
        </div>
      </div>
      <div class="preview__copy">
        <p class="label dimmer">{{ category?.name ?? 'Sem categoria' }}</p>
        <strong>{{ form.name || 'Sem nome' }}</strong>
        <span>{{ form.brand || '—' }}</span>
      </div>
    </section>

    <div class="new__switches rise rise-2">
      <AppSegmented
        v-model="kind"
        label="Tipo de item"
        :options="[{ value: 'garment', label: 'Roupa' }, { value: 'scent', label: 'Perfume' }]"
      />
      <AppSegmented
        v-model="ownership"
        label="Situação"
        :options="[{ value: 'owned', label: 'Já tenho' }, { value: 'wishlist', label: 'Quero' }]"
      />
    </div>

    <FotoCampo
      class="rise rise-2"
      :atual="fotoAtual"
      :atual-recortada="item?.imageCutout"
      @pronta="aoTrocarFoto"
      @remover="fotoRemovida = true"
    />

    <section class="group rise rise-3">
      <h2 class="sec-head__title"><AppIcon name="pencil" size="1.0625rem" />Identificação</h2>

      <label class="field">
        <span class="label">Nome</span>
        <input v-model="form.name" class="input" type="text" placeholder="Camisa oxford" autocomplete="off">
      </label>

      <div class="pair">
        <label class="field">
          <span class="label">Marca</span>
          <input v-model="form.brand" class="input" type="text" placeholder="Opcional" autocomplete="off">
        </label>
        <label class="field">
          <span class="label">Categoria</span>
          <select v-model="form.categoryId" class="select">
            <option v-for="entry in kindCategories" :key="entry.id" :value="entry.id">{{ entry.name }}</option>
          </select>
        </label>
      </div>
    </section>

    <section class="group rise rise-3">
      <h2 class="sec-head__title"><AppIcon name="layers" size="1.0625rem" />Cor</h2>
      <div class="palette" role="group" aria-label="Cor da peça">
        <button
          v-for="hex in PALETTE"
          :key="hex"
          type="button"
          class="palette__dot"
          :class="{ 'palette__dot--on': form.colorHex.toLowerCase() === hex }"
          :style="{ background: hex }"
          :aria-label="`Cor ${hex}`"
          :aria-pressed="form.colorHex.toLowerCase() === hex"
          @click="form.colorHex = hex"
        />
        <label class="palette__custom">
          <span class="sr-only">Escolher outra cor</span>
          <AppIcon name="plus" size="0.875rem" :weight="2.4" />
          <input v-model="form.colorHex" type="color">
        </label>
      </div>
      <label v-if="kind === 'garment'" class="field">
        <span class="label">Nome da cor</span>
        <input v-model="form.color" class="input" type="text" placeholder="Azul claro" autocomplete="off">
      </label>
    </section>

    <section v-if="kind === 'garment'" class="group rise rise-4">
      <h2 class="sec-head__title"><AppIcon name="info" size="1.0625rem" />Ficha</h2>
      <div class="pair">
        <label class="field">
          <span class="label">Tamanho</span>
          <input v-model="form.size" class="input" type="text" placeholder="M" autocomplete="off">
        </label>
        <label class="field">
          <span class="label">Material</span>
          <input v-model="form.material" class="input" type="text" placeholder="Algodão oxford" autocomplete="off">
        </label>
      </div>
    </section>

    <section v-else class="group rise rise-4">
      <h2 class="sec-head__title"><AppIcon name="info" size="1.0625rem" />Ficha</h2>
      <div class="pair">
        <label class="field">
          <span class="label">Concentração</span>
          <select v-model="form.concentration" class="select">
            <option>EDC</option><option>EDT</option><option>EDP</option><option>Extrait</option>
          </select>
        </label>
        <label class="field">
          <span class="label">Volume (ml)</span>
          <input v-model.number="form.volumeMl" class="input" type="number" inputmode="numeric" min="0" placeholder="100">
        </label>
      </div>
      <div class="field">
        <span class="label">Projeção</span>
        <AppSegmented
          v-model="form.projection"
          label="Projeção"
          :options="[{ value: 'low', label: 'Baixa' }, { value: 'moderate', label: 'Moderada' }, { value: 'high', label: 'Alta' }]"
        />
      </div>
    </section>

    <!-- estes três campos são o que o recomendador realmente lê -->
    <section class="group rise rise-4">
      <h2 class="sec-head__title"><AppIcon name="sun" size="1.0625rem" />Uso</h2>
      <p class="group__note">É daqui que a sugestão diária tira as escolhas. Vale gastar dez segundos.</p>

      <div class="field">
        <span class="label">Formalidade</span>
        <AppSegmented
          v-model="formality"
          label="Formalidade"
          :options="[{ value: '1', label: 'Casual' }, { value: '2', label: 'Intermediária' }, { value: '3', label: 'Formal' }]"
        />
      </div>

      <div class="field">
        <span class="label">Clima</span>
        <div class="chip-row" data-hscroll role="group" aria-label="Clima">
          <button
            v-for="value in (['hot', 'mild', 'cold'] as Climate[])"
            :key="value"
            type="button"
            class="chip"
            :aria-pressed="climates.includes(value)"
            @click="toggleClimate(value)"
          >
            <AppIcon :name="CLIMATE_ICONS[value]" size="1rem" />
            {{ CLIMATE_LABELS[value] }}
          </button>
        </div>
      </div>

      <div class="field">
        <span class="label">Situação</span>
        <div class="chip-row" data-hscroll role="group" aria-label="Situação">
          <button
            v-for="entry in RECOMMENDATION_CONTEXTS"
            :key="entry.id"
            type="button"
            class="chip"
            :aria-pressed="contexts.includes(entry.id)"
            @click="toggleContext(entry.id)"
          >
            <AppIcon :name="CONTEXT_ICONS[entry.id] ?? 'spark'" size="1rem" />
            {{ entry.label }}
          </button>
        </div>
      </div>
    </section>

    <section v-if="editing && uso" class="group rise rise-5">
      <h2 class="sec-head__title"><AppIcon name="clock" size="1.0625rem" />Registro de uso</h2>
      <p class="group__note">{{ uso }}</p>
    </section>

    <section class="group rise rise-5">
      <h2 class="sec-head__title"><AppIcon name="plus" size="1.0625rem" />Extras</h2>
      <div class="pair">
        <label class="field">
          <span class="label">Preço (R$)</span>
          <input v-model.number="form.price" class="input" type="number" inputmode="numeric" min="0" placeholder="Opcional">
        </label>
        <label class="field">
          <span class="label">Link de origem</span>
          <input v-model="form.sourceUrl" class="input" type="url" placeholder="https://" autocomplete="off">
        </label>
      </div>
      <label class="field">
        <span class="label">Observação</span>
        <textarea v-model="form.description" class="textarea" placeholder="Como ela cai, com o que combina, o que evitar." />
      </label>
    </section>

    <p v-if="error" class="new__error" role="alert">
      <AppIcon name="info" size="1.0625rem" />
      {{ error }}
    </p>

    <div class="new__submit rise rise-5">
      <button type="submit" class="btn btn--full" :disabled="salvando">
        <AppIcon name="check" size="1.0625rem" />
        {{ salvando ? 'Enviando a foto…' : `Salvar ${ownership === 'wishlist' ? 'no desejo' : 'no acervo'}` }}
      </button>
      <NuxtLink class="btn btn--quiet btn--full" to="/acervo">Cancelar</NuxtLink>
    </div>

    <!-- remover fica longe do salvar e pede confirmação: o acervo não tem lixeira -->
    <div v-if="editing" class="new__danger rise rise-5">
      <div v-if="confirmingDelete" class="new__confirm">
        <p>Remover <strong>{{ item!.name }}</strong> apaga a ficha e a foto. Não dá para desfazer.</p>
        <div class="new__confirm-actions">
          <button type="button" class="btn btn--quiet" @click="confirmingDelete = false">Cancelar</button>
          <button type="button" class="btn" @click="destroy">Remover</button>
        </div>
      </div>
      <button v-else type="button" class="link-quiet" @click="confirmingDelete = true">
        <AppIcon name="trash" size="1rem" />
        Remover do acervo
      </button>
    </div>
  </form>
</template>

<style scoped>
.new__head { margin-bottom: var(--s5); }
.new__back {
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
.new__back .ico { transform: rotate(180deg); }
.new__back:hover { background: var(--paper-2); color: var(--ink); }
.new__head h1 { margin-top: var(--s2); }

.preview {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  gap: var(--s4);
  padding: var(--s3);
}
.preview__visual {
  width: 5rem;
  aspect-ratio: 1 / 1.1;
  overflow: hidden;
  border-radius: var(--r-sm);
  background:
    radial-gradient(120% 95% at 26% 10%, color-mix(in oklab, var(--c) 12%, white), transparent 72%),
    linear-gradient(158deg, color-mix(in oklab, var(--c) 34%, white), color-mix(in oklab, var(--c) 54%, white));
  transition: background var(--t-slow) var(--ease);
}
.preview__flat {
  display: grid;
  place-items: center;
  width: 100%; height: 100%;
  padding: 12%;
  color: color-mix(in oklab, var(--c) 32%, #14120f);
  transition: color var(--t-slow) var(--ease);
}
.preview__foto { width: 100%; height: 100%; object-fit: contain; }
.preview__copy { display: grid; gap: 0.0625rem; min-width: 0; }
.preview__copy strong {
  overflow: hidden;
  font-size: var(--fs-md);
  font-variation-settings: "wght" 660;
  letter-spacing: -0.024em;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.preview__copy span { color: var(--ink-3); font-size: var(--fs-xs); }

.new__switches { display: grid; gap: var(--s2); margin-top: var(--s4); }

.group { display: grid; gap: var(--s3); margin-top: var(--s7); }
.group__note { margin-top: calc(var(--s1) * -1); color: var(--ink-3); font-size: var(--fs-xs); line-height: 1.45; }
.pair { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--s2); }

.palette { display: grid; grid-template-columns: repeat(9, minmax(0, 1fr)); gap: var(--s2); }
.palette__dot {
  aspect-ratio: 1;
  width: 100%;
  border: 0;
  border-radius: var(--r-full);
  box-shadow: inset 0 0 0 1px rgb(20 18 15 / 14%);
  transition: box-shadow var(--t) var(--ease), transform var(--t-fast) var(--ease-spring);
}
.palette__dot:active { transform: scale(0.88); }
.palette__dot--on {
  box-shadow: inset 0 0 0 1px rgb(20 18 15 / 14%), 0 0 0 2px var(--paper), 0 0 0 4px var(--ink);
  transform: scale(1.06);
}
.palette__custom {
  position: relative;
  display: grid;
  place-items: center;
  aspect-ratio: 1;
  width: 100%;
  overflow: hidden;
  border: 1px dashed var(--line-3);
  border-radius: var(--r-full);
  color: var(--ink-3);
  cursor: pointer;
  transition: border-color var(--t) var(--ease), color var(--t) var(--ease);
}
.palette__custom:hover { border-color: var(--ink); color: var(--ink); }
.palette__custom input { position: absolute; inset: 0; width: 100%; height: 100%; padding: 0; border: 0; opacity: 0; cursor: pointer; }

.new__error {
  display: flex;
  align-items: center;
  gap: var(--s2);
  margin-top: var(--s5);
  padding: var(--s3) var(--s4);
  border: 1px solid var(--ink);
  border-radius: var(--r-md);
  background: var(--card);
  font-size: var(--fs-sm);
}

.new__submit { display: grid; gap: var(--s2); margin-top: var(--s7); }
.new__danger { display: grid; justify-items: center; margin-top: var(--s6); }

.new__confirm {
  display: grid;
  gap: var(--s3);
  padding: var(--s4);
  border: 1px solid var(--ink);
  border-radius: var(--r-md);
  background: var(--card);
}
.new__confirm p { font-size: var(--fs-sm); line-height: 1.5; }
.new__confirm strong { font-variation-settings: "wght" 700; }
.new__confirm-actions { display: grid; grid-template-columns: 1fr 1fr; gap: var(--s2); }
</style>
