<script setup lang="ts">
/**
 * O óculo do Panteão como selo. A marca é um sistema, não um arquivo:
 * o mesmo gerador serve a qualquer tamanho, e cada peça do acervo pode
 * receber a sua variação mudando anéis e caixotões.
 */
const props = withDefaults(defineProps<{
  aneis?: number
  caixotoes?: number
  raioInterno?: number
}>(), { aneis: 3, caixotoes: 16, raioInterno: 36 })

const W = 200
const GAP = 4.2
const INSET = 3
const R_OUT = 92

const f = (n: number) => n.toFixed(2)
const P = (r: number, a: number) => `${f(W / 2 + r * Math.cos(a))} ${f(W / 2 + r * Math.sin(a))}`

const caminhos = computed(() => {
  const step = (Math.PI * 2) / props.caixotoes
  const out: string[] = []

  for (let anel = 0; anel < props.aneis; anel++) {
    const razao = R_OUT / props.raioInterno
    const r0 = props.raioInterno * razao ** (anel / props.aneis) + INSET
    const r1 = props.raioInterno * razao ** ((anel + 1) / props.aneis) - INSET

    for (let s = 0; s < props.caixotoes; s++) {
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
</script>

<template>
  <svg :viewBox="`0 0 ${W} ${W}`" fill="currentColor" role="img" aria-label="Selo Allegorio">
    <path v-for="(d, i) in caminhos" :key="i" :d="d" />
  </svg>
</template>
