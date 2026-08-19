<script setup lang="ts">
/**
 * O óculo do Panteão como selo. A marca é um sistema, não um arquivo.
 *
 * Passando `semente`, os parâmetros do selo saem do próprio conteúdo: cada
 * artigo ganha a sua variação, sempre reconhecível como a mesma família e
 * nunca igual à anterior. Sem semente, cai no selo canônico usado na marca.
 *
 * A derivação é determinística de propósito. O mesmo artigo precisa produzir
 * o mesmo selo no servidor, no cliente e na imagem de compartilhamento.
 */
const props = withDefaults(defineProps<{
  semente?: string
  aneis?: number
  caixotoes?: number
  raioInterno?: number
  /** acende caixotão por caixotão conforme entra na tela */
  vem?: boolean
}>(), { vem: false })

const W = 200
const GAP = 4.2
const INSET = 3
const R_OUT = 92

/** FNV-1a de 32 bits. Curto, estável e suficiente para escolher parâmetros. */
function hash(s: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return h >>> 0
}

const AN = [2, 3, 3, 4] as const
const CX = [12, 14, 16, 18, 20, 24] as const

const cfg = computed(() => {
  if (!props.semente) {
    return {
      aneis: props.aneis ?? 3,
      caixotoes: props.caixotoes ?? 16,
      raioInterno: props.raioInterno ?? 36,
      giro: 0
    }
  }

  const h = hash(props.semente)
  const caixotoes = props.caixotoes ?? CX[h % CX.length]!

  return {
    aneis: props.aneis ?? AN[(h >>> 4) % AN.length]!,
    caixotoes,
    raioInterno: props.raioInterno ?? 30 + ((h >>> 8) % 15),
    // o giro nunca passa de um caixotão: a rotação muda a leitura sem
    // desalinhar o selo do resto do layout
    giro: (((h >>> 16) % 100) / 100) * (360 / caixotoes)
  }
})

const f = (n: number) => n.toFixed(2)
const P = (r: number, a: number) => `${f(W / 2 + r * Math.cos(a))} ${f(W / 2 + r * Math.sin(a))}`

const caminhos = computed(() => {
  const { aneis, caixotoes, raioInterno } = cfg.value
  const step = (Math.PI * 2) / caixotoes
  const out: string[] = []

  for (let anel = 0; anel < aneis; anel++) {
    const razao = R_OUT / raioInterno
    const r0 = raioInterno * razao ** (anel / aneis) + INSET
    const r1 = raioInterno * razao ** ((anel + 1) / aneis) - INSET

    for (let s = 0; s < caixotoes; s++) {
      const g0 = (GAP / 2 + INSET) / r0
      const g1 = (GAP / 2 + INSET) / r1
      const a0 = s * step
      const a1 = (s + 1) * step

      out.push(
        `M${P(r1, a0 + g1)}A${f(r1)} ${f(r1)} 0 0 1 ${P(r1, a1 - g1)}`
        + `L${P(r0, a1 - g0)}A${f(r0)} ${f(r0)} 0 0 0 ${P(r0, a0 + g0)}Z`
      )
    }
  }

  return out
})

/** Ordem de acendimento: de dentro para fora, girando junto. */
const total = computed(() => caminhos.value.length)
</script>

<template>
  <svg
    :viewBox="`0 0 ${W} ${W}`"
    :class="['selo', { 'selo--vem': vem }]"
    fill="currentColor"
    role="img"
    aria-label="Selo Allegorio"
  >
    <g :transform="`rotate(${cfg.giro.toFixed(2)} ${W / 2} ${W / 2})`">
      <path
        v-for="(d, i) in caminhos"
        :key="i"
        :d="d"
        :style="vem ? { '--i': i, '--n': total } : undefined"
      />
    </g>
  </svg>
</template>

<style scoped>
/* Sem suporte a scroll timeline, --preenche fica no valor inicial 1 e todos
   os caixotões já estão visíveis. A animação é um bônus, não um requisito. */
.selo--vem {
  animation: acende linear both;
  animation-timeline: view();
  animation-range: entry 10% entry 90%;
}

.selo--vem path {
  opacity: clamp(0, calc(var(--preenche) * (var(--n) + 6) - var(--i)), 1);
}
</style>
