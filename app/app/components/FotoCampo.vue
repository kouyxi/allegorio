<script setup lang="ts">
import type { ItemKind } from '~/types/domain'
import type { FotoPronta } from '~/utils/imagem'

/**
 * Campo de fotografia do item.
 *
 * A foto existe por um motivo específico: duas camisetas pretas geram o mesmo
 * desenho técnico e a mesma amostra de cor, então sem imagem o acervo mistura
 * peças que a pessoa distingue de olho fechado.
 *
 * O recorte é o padrão porque uma peça sobre fundo transparente lê como prancha
 * e não como foto de bagunça de quarto, mas ele é desligável e nunca bloqueia:
 * falhou, guarda a foto inteira.
 */
const props = withDefaults(defineProps<{
  /** foto que já está gravada no item, quando é edição */
  atual?: string
  atualRecortada?: boolean
  tipo?: ItemKind
}>(), { tipo: 'garment' })

type OrigemFoto = 'camera' | 'galeria' | 'catalogo'

const emit = defineEmits<{ pronta: [FotoPronta | null, OrigemFoto?], remover: [] }>()

const { estado, progresso, aviso, foto, recorteDisponivel, pesoMb, escolher, descartar } = useFoto()

const recortar = ref(true)
const camera = ref<HTMLInputElement | null>(null)
const galeria = ref<HTMLInputElement | null>(null)
const removida = ref(false)

const ocupado = computed(() => ['lendo', 'baixando', 'recortando'].includes(estado.value))
const mostra = computed(() => foto.value?.previa ?? (removida.value ? undefined : props.atual))
const transparente = computed(() => (foto.value ? foto.value.recortada : props.atualRecortada) ?? false)

const rotulo = computed(() => {
  if (estado.value === 'lendo') return 'Lendo a imagem'
  if (estado.value === 'baixando') return progresso.value > 0
    ? `Baixando o recortador · ${Math.round(progresso.value * 100)}%`
    : 'Preparando o recortador'
  if (estado.value === 'recortando') return 'Separando a peça do fundo'
  return ''
})

async function aoEscolher(evento: Event, origem: OrigemFoto) {
  const campo = evento.target as HTMLInputElement
  const arquivo = campo.files?.[0]
  campo.value = ''
  if (!arquivo) return

  removida.value = false
  await escolher(arquivo, recortar.value)
  emit('pronta', foto.value, origem)
}

async function importar(arquivo: Blob) {
  removida.value = false
  const pronta = await escolher(arquivo, false)
  emit('pronta', pronta, 'catalogo')
  return pronta
}

defineExpose({ importar })

function limpar() {
  descartar()
  removida.value = Boolean(props.atual)
  emit('pronta', null)
  if (removida.value) emit('remover')
}
</script>

<template>
  <section class="foto">
    <div class="sec-head">
      <h2 class="sec-head__title">
        <AppIcon name="layers" size="1.0625rem" />
        Fotografia
      </h2>
      <button v-if="mostra" type="button" class="link-quiet" @click="limpar">Remover</button>
    </div>

    <p class="foto__note">
      {{ tipo === 'garment'
        ? 'Duas camisetas pretas viram o mesmo desenho. A foto é o que separa uma da outra.'
        : 'Fotografe o frasco ou importe a imagem encontrada pelo código de barras.' }}
    </p>

    <div class="foto__quadro" :class="{ 'foto__quadro--xadrez': transparente }">
      <img v-if="mostra" :src="mostra" alt="Fotografia do item" class="foto__img">
      <span v-else class="foto__vazio">
        <AppIcon name="hanger" size="1.5rem" />
      </span>

      <div v-if="ocupado" class="foto__trabalho">
        <span class="foto__barra"><span :style="{ transform: `scaleX(${progresso || 0.15})` }" /></span>
        <span class="foto__rotulo">{{ rotulo }}</span>
      </div>
    </div>

    <div class="foto__acoes">
      <button type="button" class="btn btn--ghost" :disabled="ocupado" @click="camera?.click()">
        <AppIcon name="camera" size="1.0625rem" />
        Tirar foto
      </button>
      <button type="button" class="btn btn--quiet" :disabled="ocupado" @click="galeria?.click()">
        <AppIcon name="layers" size="1.0625rem" />
        {{ mostra ? 'Trocar da galeria' : 'Escolher da galeria' }}
      </button>
      <input
        ref="camera"
        class="sr-only"
        type="file"
        accept="image/*"
        capture="environment"
        @change="aoEscolher($event, 'camera')"
      >
      <input
        ref="galeria"
        class="sr-only"
        type="file"
        accept="image/*"
        @change="aoEscolher($event, 'galeria')"
      >
    </div>

    <label v-if="recorteDisponivel !== false" class="foto__opcao">
      <input v-model="recortar" type="checkbox">
      <span>
        <strong>Recortar o fundo</strong>
        <span class="foto__dica">
          Roda no próprio aparelho, sem mandar a foto para lugar nenhum. Na primeira vez
          baixa cerca de {{ pesoMb }} MB e depois fica no cache.
        </span>
      </span>
    </label>

    <p v-if="aviso" class="foto__aviso" role="status">
      <AppIcon name="info" size="1rem" />
      {{ aviso }}
    </p>
  </section>
</template>

<style scoped>
.foto { display: grid; gap: var(--s3); margin-top: var(--s7); }
.foto__note { margin-top: calc(var(--s1) * -1); color: var(--ink-3); font-size: var(--fs-xs); line-height: 1.45; }

.foto__quadro {
  position: relative;
  display: grid;
  place-items: center;
  aspect-ratio: 4 / 3;
  overflow: hidden;
  border: 1px solid var(--line-2);
  border-radius: var(--r-md);
  background: var(--paper-2);
  color: var(--ink-4);
  box-shadow: var(--sh-inset);
}

/* O xadrez só aparece quando o arquivo tem alfa. Ele é a prova visual de que o
   fundo saiu: sobre o campo claro do cartão, recorte e foto branca são iguais. */
.foto__quadro--xadrez {
  background-color: var(--card);
  background-image:
    linear-gradient(45deg, var(--paper-2) 25%, transparent 25%, transparent 75%, var(--paper-2) 75%),
    linear-gradient(45deg, var(--paper-2) 25%, transparent 25%, transparent 75%, var(--paper-2) 75%);
  background-size: 1rem 1rem;
  background-position: 0 0, 0.5rem 0.5rem;
}

.foto__img { width: 100%; height: 100%; object-fit: contain; }
.foto__vazio { display: grid; place-items: center; }

.foto__trabalho {
  position: absolute;
  inset: auto 0 0;
  display: grid;
  gap: var(--s2);
  padding: var(--s3) var(--s4);
  background: color-mix(in srgb, var(--ink) 92%, transparent);
  color: var(--ink-inv);
}
.foto__barra { display: block; height: 2px; overflow: hidden; border-radius: var(--r-full); background: rgb(255 255 255 / 22%); }
.foto__barra > span {
  display: block;
  height: 100%;
  background: var(--ink-inv);
  transform-origin: left;
  transition: transform var(--t) var(--ease);
}
.foto__rotulo { font-size: var(--fs-micro); font-variation-settings: "wght" 620; }

.foto__acoes { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--s2); }

.foto__opcao {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: var(--s3);
  padding: var(--s3);
  border-radius: var(--r-md);
  background: var(--paper-2);
  box-shadow: var(--sh-inset);
  cursor: pointer;
}
.foto__opcao input { width: 1.125rem; height: 1.125rem; margin-top: 0.125rem; accent-color: var(--ink); }
.foto__opcao > span { display: grid; gap: 0.125rem; }
.foto__opcao strong { font-size: var(--fs-sm); font-variation-settings: "wght" 640; }
.foto__dica { color: var(--ink-3); font-size: var(--fs-xs); line-height: 1.45; }

.foto__aviso {
  display: flex;
  align-items: flex-start;
  gap: var(--s2);
  color: var(--ink-3);
  font-size: var(--fs-xs);
  line-height: 1.45;
}
.foto__aviso .ico { margin-top: 0.125rem; }
@media (max-width: 22rem) { .foto__acoes { grid-template-columns: 1fr; } }
</style>
