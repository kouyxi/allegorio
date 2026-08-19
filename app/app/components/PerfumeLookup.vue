<script setup lang="ts">
import type { PerfumeCatalogItem, PerfumeSearchResponse } from '#shared/perfume'
import { normalizePerfumeQuery } from '#shared/perfume'

const emit = defineEmits<{
  usar: [item: PerfumeCatalogItem, imagem?: Blob]
}>()

const termo = ref('')
const resultados = ref<PerfumeCatalogItem[]>([])
const estado = ref<'ocioso' | 'buscando' | 'baixando' | 'erro'>('ocioso')
const aviso = ref('')
const escolhendo = ref('')
let timer: ReturnType<typeof setTimeout> | undefined
let buscaAtual = 0

const buscando = computed(() => estado.value === 'buscando')

function imageProxy(item: PerfumeCatalogItem) {
  return item.imageUrl
    ? `/api/perfume-image?url=${encodeURIComponent(item.imageUrl)}`
    : `/api/perfume-image?barcode=${item.barcode}`
}

async function buscar() {
  if (timer) {
    clearTimeout(timer)
    timer = undefined
  }
  const query = normalizePerfumeQuery(termo.value)
  const id = ++buscaAtual
  aviso.value = ''

  if (!query) {
    resultados.value = []
    estado.value = termo.value.trim() ? 'erro' : 'ocioso'
    if (termo.value.trim()) aviso.value = 'Digite ao menos duas letras do nome ou da marca.'
    return
  }

  estado.value = 'buscando'
  try {
    const response = await $fetch<PerfumeSearchResponse>('/api/perfume/search', {
      query: { q: query }
    })
    if (id !== buscaAtual) return

    resultados.value = response.items
    estado.value = 'ocioso'
    if (!response.items.length) {
      aviso.value = 'Não encontrei esse perfume. Você pode preencher a ficha manualmente logo abaixo.'
    }
  } catch {
    if (id !== buscaAtual) return
    resultados.value = []
    estado.value = 'erro'
    aviso.value = 'Não consegui consultar o catálogo agora. Tente de novo ou preencha manualmente.'
  }
}

watch(termo, () => {
  if (timer) clearTimeout(timer)
  /* Invalida uma resposta que ainda esteja viajando assim que o texto muda,
     sem esperar os 500 ms da próxima busca. */
  buscaAtual += 1
  aviso.value = ''
  if (!termo.value.trim()) {
    resultados.value = []
    estado.value = 'ocioso'
    return
  }
  timer = setTimeout(buscar, 500)
})

onBeforeUnmount(() => {
  if (timer) clearTimeout(timer)
})

async function usar(item: PerfumeCatalogItem) {
  estado.value = 'baixando'
  escolhendo.value = item.barcode
  aviso.value = ''

  try {
    const imagem = item.hasImage
      ? await $fetch<Blob>(imageProxy(item), { responseType: 'blob' })
      : undefined
    emit('usar', item, imagem)
    estado.value = 'ocioso'
  } catch {
    /* Os dados ainda são úteis se a imagem licenciada sumiu entre a busca e a
       importação. A pessoa pode fotografar o frasco depois. */
    emit('usar', item)
    estado.value = 'erro'
    aviso.value = 'Preenchi a ficha, mas não consegui importar a imagem. Você ainda pode fotografar o frasco.'
  } finally {
    escolhendo.value = ''
  }
}
</script>

<template>
  <section class="lookup card">
    <div class="sec-head">
      <h2 class="sec-head__title"><AppIcon name="search" size="1.0625rem" />Buscar perfume</h2>
      <span v-if="buscando" class="label dimmer">Buscando…</span>
    </div>
    <p class="lookup__note">
      Digite o nome ou a marca. A busca usa o catálogo aberto Open Beauty Facts.
    </p>

    <form class="lookup__form" role="search" @submit.prevent="buscar">
      <label class="field">
        <span class="label">Nome ou marca</span>
        <div class="lookup__input-wrap">
          <input
            v-model="termo"
            class="input"
            type="search"
            autocomplete="off"
            enterkeyhint="search"
            placeholder="Ex.: Dior Sauvage"
            maxlength="80"
          >
          <button type="submit" class="btn btn--ghost btn--sm" :disabled="buscando || termo.trim().length < 2">
            <AppIcon name="search" size="1rem" />
            Buscar
          </button>
        </div>
      </label>
    </form>

    <ul v-if="resultados.length" class="lookup__results" aria-label="Perfumes encontrados">
      <li v-for="item in resultados" :key="item.barcode">
        <button
          type="button"
          class="lookup__option"
          :disabled="estado === 'baixando'"
          @click="usar(item)"
        >
          <span class="lookup__visual">
            <img v-if="item.hasImage" :src="imageProxy(item)" alt="" loading="lazy">
            <AppIcon v-else name="scent" size="1.25rem" />
          </span>
          <span class="lookup__copy">
            <strong>{{ item.name }}</strong>
            <span>
              {{ item.brand || 'Marca não informada' }}<template v-if="item.volumeMl"> · {{ item.volumeMl }} ml</template>
            </span>
          </span>
          <span class="lookup__choose label">
            {{ escolhendo === item.barcode ? 'Importando…' : 'Usar' }}
          </span>
        </button>
      </li>
    </ul>

    <p v-if="resultados.length" class="lookup__license">
      Dados: ODbL 1.0. Imagens, quando disponíveis: CC BY-SA. Open Beauty Facts contributors.
    </p>
    <p v-if="aviso" class="lookup__warning" role="status">
      <AppIcon name="info" size="1rem" />{{ aviso }}
    </p>
  </section>
</template>

<style scoped>
.lookup { display: grid; gap: var(--s3); margin-top: var(--s7); padding: var(--pad); }
.lookup__note, .lookup__license { color: var(--ink-3); font-size: var(--fs-xs); line-height: 1.45; }
.lookup__input-wrap { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: var(--s2); }
.lookup__results { overflow: hidden; border-top: 1px solid var(--line-2); }
.lookup__results li + li { border-top: 1px solid var(--line-2); }
.lookup__option {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: var(--s3);
  width: 100%;
  padding: var(--s3) 0;
  border: 0;
  background: transparent;
  color: inherit;
  text-align: left;
}
.lookup__option:not(:disabled):active { transform: scale(0.99); }
.lookup__visual {
  display: grid;
  place-items: center;
  width: 3.25rem;
  height: 3.25rem;
  overflow: hidden;
  border-radius: var(--r-sm);
  background: var(--paper-2);
  color: var(--ink-4);
}
.lookup__visual img { width: 100%; height: 100%; object-fit: contain; }
.lookup__copy { display: grid; gap: 0.125rem; min-width: 0; }
.lookup__copy strong, .lookup__copy span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.lookup__copy strong { font-size: var(--fs-sm); font-variation-settings: "wght" 640; }
.lookup__copy span { color: var(--ink-3); font-size: var(--fs-xs); }
.lookup__choose { color: var(--ink-3); }
.lookup__warning { display: flex; gap: var(--s2); align-items: flex-start; color: var(--ink-3); font-size: var(--fs-xs); }
@media (max-width: 22rem) {
  .lookup__input-wrap { grid-template-columns: 1fr; }
  .lookup__input-wrap .btn { width: 100%; }
}
</style>
