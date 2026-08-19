<script setup lang="ts">
import type { PerfumeCatalogItem, PerfumeLookupResponse } from '#shared/perfume'
import { normalizeBarcode } from '#shared/perfume'

const emit = defineEmits<{
  usar: [item: PerfumeCatalogItem, imagem?: Blob]
}>()

const codigo = ref('')
const resultado = ref<PerfumeCatalogItem | null>(null)
const estado = ref<'ocioso' | 'lendo' | 'buscando' | 'baixando' | 'erro'>('ocioso')
const aviso = ref('')
const scanner = ref<HTMLInputElement | null>(null)
const detectorDisponivel = ref(false)

const ocupado = computed(() => ['lendo', 'buscando', 'baixando'].includes(estado.value))

onMounted(async () => {
  if (!('BarcodeDetector' in window)) return
  try {
    const formats = await BarcodeDetector.getSupportedFormats()
    detectorDisponivel.value = formats.some(format => ['ean_13', 'ean_8', 'upc_a', 'upc_e'].includes(format))
  } catch {
    detectorDisponivel.value = false
  }
})

async function buscar() {
  const barcode = normalizeBarcode(codigo.value)
  resultado.value = null
  aviso.value = ''
  if (!barcode) {
    estado.value = 'erro'
    aviso.value = 'Digite os 8, 12, 13 ou 14 números do código de barras.'
    return
  }

  codigo.value = barcode
  estado.value = 'buscando'
  try {
    const response = await $fetch<PerfumeLookupResponse>(`/api/perfume/${barcode}`)
    if (!response.found || !response.item) {
      estado.value = 'erro'
      aviso.value = 'Esse perfume ainda não está no Open Beauty Facts. Você pode preencher a ficha manualmente.'
      return
    }
    resultado.value = response.item
    estado.value = 'ocioso'
  } catch {
    estado.value = 'erro'
    aviso.value = 'Não consegui consultar o catálogo agora. Tente de novo ou preencha manualmente.'
  }
}

async function lerCodigo(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return

  estado.value = 'lendo'
  aviso.value = ''
  let bitmap: ImageBitmap | null = null
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
    const detector = new BarcodeDetector({ formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e'] })
    const codes = await detector.detect(bitmap)
    const barcode = codes.map(entry => normalizeBarcode(entry.rawValue)).find(Boolean)
    if (!barcode) throw new Error('sem-codigo')
    codigo.value = barcode
    await buscar()
  } catch {
    estado.value = 'erro'
    aviso.value = 'Não consegui ler o código. Aproxime a câmera, evite reflexo ou digite os números.'
  } finally {
    bitmap?.close()
  }
}

async function usar() {
  if (!resultado.value) return
  estado.value = 'baixando'
  aviso.value = ''

  try {
    const imagem = resultado.value.hasImage
      ? await $fetch<Blob>('/api/perfume-image', {
          query: { barcode: resultado.value.barcode },
          responseType: 'blob'
        })
      : undefined
    emit('usar', resultado.value, imagem)
    estado.value = 'ocioso'
  } catch {
    /* Metadata is still useful if the licensed image disappeared between the
       lookup and import. The user can photograph the bottle afterwards. */
    emit('usar', resultado.value)
    estado.value = 'erro'
    aviso.value = 'Preenchi a ficha, mas não consegui importar a imagem. Você ainda pode fotografar o frasco.'
  }
}
</script>

<template>
  <section class="lookup card">
    <div class="sec-head">
      <h2 class="sec-head__title"><AppIcon name="barcode" size="1.0625rem" />Buscar perfume</h2>
    </div>
    <p class="lookup__note">Leia o código da caixa ou digite os números. A busca usa o catálogo aberto Open Beauty Facts.</p>

    <div class="lookup__form">
      <label class="field">
        <span class="label">Código de barras</span>
        <input v-model="codigo" class="input num" inputmode="numeric" autocomplete="off" placeholder="789…" @keydown.enter.prevent="buscar">
      </label>
      <div class="lookup__actions">
        <button type="button" class="btn btn--ghost" :disabled="ocupado" @click="buscar">
          <AppIcon name="search" size="1rem" />
          {{ estado === 'buscando' ? 'Buscando…' : 'Buscar' }}
        </button>
        <button v-if="detectorDisponivel" type="button" class="btn btn--quiet" :disabled="ocupado" @click="scanner?.click()">
          <AppIcon name="camera" size="1rem" />Ler com a câmera
        </button>
        <input ref="scanner" class="sr-only" type="file" accept="image/*" capture="environment" @change="lerCodigo">
      </div>
    </div>

    <div v-if="resultado" class="lookup__result">
      <img
        v-if="resultado.hasImage"
        :src="`/api/perfume-image?barcode=${resultado.barcode}`"
        alt=""
        class="lookup__image"
      >
      <div class="lookup__copy">
        <span class="label dimmer">Encontrado</span>
        <strong>{{ resultado.name }}</strong>
        <span>{{ resultado.brand || 'Marca não informada' }}<template v-if="resultado.volumeMl"> · {{ resultado.volumeMl }} ml</template></span>
      </div>
      <button type="button" class="btn btn--full" :disabled="ocupado" @click="usar">
        <AppIcon name="check" size="1rem" />
        {{ estado === 'baixando' ? 'Importando…' : 'Usar esta ficha' }}
      </button>
      <p class="lookup__license">Dados: ODbL 1.0. Imagem, quando disponível: CC BY-SA. Atribuição a Open Beauty Facts contributors.</p>
    </div>

    <p v-if="aviso" class="lookup__warning" role="status"><AppIcon name="info" size="1rem" />{{ aviso }}</p>
  </section>
</template>

<style scoped>
.lookup { display: grid; gap: var(--s3); margin-top: var(--s7); padding: var(--pad); }
.lookup__note, .lookup__license { color: var(--ink-3); font-size: var(--fs-xs); line-height: 1.45; }
.lookup__form { display: grid; gap: var(--s3); }
.lookup__actions { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--s2); }
.lookup__result { display: grid; grid-template-columns: 4.5rem minmax(0, 1fr); gap: var(--s3); align-items: center; padding-top: var(--s3); border-top: 1px solid var(--line-2); }
.lookup__image { width: 4.5rem; height: 4.5rem; object-fit: contain; border-radius: var(--r-sm); background: var(--paper-2); }
.lookup__copy { display: grid; gap: 0.125rem; min-width: 0; }
.lookup__copy strong, .lookup__copy span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.lookup__copy span { color: var(--ink-3); font-size: var(--fs-xs); }
.lookup__result .btn, .lookup__license { grid-column: 1 / -1; }
.lookup__warning { display: flex; gap: var(--s2); align-items: flex-start; color: var(--ink-3); font-size: var(--fs-xs); }
@media (max-width: 22rem) { .lookup__actions { grid-template-columns: 1fr; } }
</style>
