<script setup lang="ts">
/**
 * Desenho técnico de peça, portado da publicação (`web/app/components/FlatTecnico.vue`)
 * e estendido com as peças que só o aplicativo precisa: tênis, frasco, camiseta
 * e etiqueta.
 *
 * A gramática é a mesma da ficha de confecção: a peça é descrita só na metade
 * direita e espelhada, e três pesos de traço carregam significado — `cut` é
 * linha de corte, `seam` é costura de união, `stitch` é pesponto. O tênis é a
 * exceção: sapato é vista lateral e não tem simetria, então vai descrito
 * inteiro com `espelhar: false`.
 *
 * A diferença em relação à publicação é a cor. Lá o traço é preto sobre papel.
 * Aqui ele assume a cor da peça registrada pelo usuário, porque o acervo é a
 * única fonte de cor do aplicativo.
 */
import type { Flat } from '~/types/desenho'

const props = withDefaults(defineProps<{ peca: Flat, margem?: number }>(), { margem: 0 })

const CX = 120

/** Espelha um path escrito só com M/L/C/Q absolutos. */
function espelha(d: string): string {
  const toks = d.replace(/,/g, ' ').trim().split(/\s+/)
  const n: Record<string, number> = { M: 2, L: 2, C: 6, Q: 4, Z: 0 }
  const out: string[] = []
  let i = 0

  while (i < toks.length) {
    const cmd = toks[i]!
    i++
    const qtd = n[cmd] ?? 0
    const nums = toks.slice(i, i + qtd).map(Number)
    i += qtd
    for (let j = 0; j < nums.length; j += 2) nums[j] = 2 * CX - nums[j]!
    out.push(cmd + (nums.length ? ' ' + nums.map(v => v.toFixed(1)).join(' ') : ''))
  }

  return out.join(' ')
}

type Traco = [d: string, cls: string, espelhar: boolean]
type Botao = [x: number, y: number, r: number, espelhar: boolean]

const PECAS: Record<Flat, { caixa: [number, number], tracos: Traco[], botoes: Botao[] }> = {
  jaqueta: {
    caixa: [240, 260],
    tracos: [
      ['M 120 34 L 143 34 C 150 34 152 38 152 42 L 141 50 C 134 44 128 40 120 40', 'cut', true],
      ['M 143 34 L 152 42 L 190 52 C 196 54 198 58 197 63', 'cut', true],
      ['M 197 63 C 204 88 210 116 214 146 L 216 160', 'cut', true],
      ['M 216 160 L 190 166', 'cut', true],
      ['M 190 166 C 184 138 178 112 172 96', 'cut', true],
      ['M 197 63 C 186 70 177 82 172 96', 'seam', true],
      ['M 172 96 C 174 130 176 170 177 206', 'cut', true],
      ['M 177 206 C 178 214 176 218 170 218 L 120 218', 'cut', true],
      ['M 120 34 L 120 218', 'seam', false],
      ['M 128 40 L 128 216', 'seam', true],
      ['M 132 42 L 132 214', 'stitch', true],
      ['M 140 138 L 168 138 L 170 176 L 142 176 Z', 'cut', true],
      ['M 143 143 L 166 143 L 167 172 L 145 172', 'stitch', true],
      ['M 138 76 L 160 76 L 161 100 L 139 100 Z', 'cut', true],
      ['M 141 80 L 158 80 L 159 97 L 142 97', 'stitch', true],
      ['M 152 42 C 160 46 168 50 175 52', 'stitch', true],
      ['M 213 158 C 205 160 197 162 191 163', 'stitch', true]
    ],
    botoes: [[124, 60, 2.6, false], [124, 92, 2.6, false], [124, 124, 2.6, false], [124, 156, 2.6, false], [124, 188, 2.6, false]]
  },

  calca: {
    caixa: [240, 270],
    tracos: [
      ['M 120 30 L 174 30 L 176 46 L 120 46', 'cut', true],
      ['M 120 34 L 174 34', 'stitch', true],
      ['M 120 42 L 175 42', 'stitch', true],
      ['M 132 29 L 132 47 M 137 29 L 137 47', 'seam', true],
      ['M 158 29 L 158 47 M 163 29 L 163 47', 'seam', true],
      ['M 176 46 C 178 60 177 74 176 86 C 173 142 169 200 166 254', 'cut', true],
      ['M 166 254 L 143 254', 'cut', true],
      ['M 143 254 C 140 198 135 140 131 104', 'cut', true],
      ['M 131 104 C 129 98 126 94 120 92', 'cut', true],
      ['M 120 46 L 120 92', 'seam', false],
      ['M 128 46 C 129 62 128 76 122 86', 'stitch', false],
      ['M 140 46 C 152 56 164 66 176 72', 'cut', true],
      ['M 143 48 C 154 58 165 66 176 76', 'stitch', true],
      ['M 152 66 C 152 140 151 200 150 250', 'seam', true],
      ['M 134 150 L 172 150', 'stitch', true],
      ['M 158 46 L 158 56 L 172 60', 'seam', true]
    ],
    botoes: []
  },

  camisa: {
    caixa: [240, 240],
    tracos: [
      ['M 120 32 L 140 32 C 146 32 148 35 148 39 L 136 52 C 130 44 126 38 120 38', 'cut', true],
      ['M 140 32 C 144 34 146 36 147 39', 'stitch', true],
      ['M 140 32 L 148 39 L 184 50 C 190 52 192 56 191 61', 'cut', true],
      ['M 120 52 L 152 44 C 168 47 180 51 189 55', 'seam', true],
      ['M 191 61 C 200 86 208 116 213 144', 'cut', true],
      ['M 213 144 L 190 152', 'cut', true],
      ['M 190 152 C 184 128 176 106 169 92', 'cut', true],
      ['M 191 61 C 182 68 174 79 169 92', 'seam', true],
      ['M 211 138 L 188 146', 'seam', true],
      ['M 169 92 C 172 126 173 164 173 198', 'cut', true],
      ['M 173 198 C 173 206 170 210 164 210 L 120 210', 'cut', true],
      ['M 120 32 L 120 210', 'seam', false],
      ['M 127 38 L 127 208', 'seam', true],
      ['M 130 40 L 130 206', 'stitch', true],
      ['M 137 74 L 159 74 L 160 96 L 148 104 L 137 96 Z', 'cut', true],
      ['M 140 78 L 157 78', 'stitch', true]
    ],
    botoes: [[123.5, 48, 2.4, false], [123.5, 74, 2.4, false], [123.5, 100, 2.4, false], [123.5, 126, 2.4, false], [123.5, 152, 2.4, false], [123.5, 178, 2.4, false]]
  },

  casaco: {
    caixa: [240, 300],
    tracos: [
      ['M 120 32 L 136 34 C 144 36 149 42 150 50', 'cut', true],
      ['M 150 50 L 143 58', 'cut', true],
      ['M 143 58 L 156 74', 'cut', true],
      ['M 156 74 C 146 96 132 112 122 122', 'cut', true],
      ['M 133 40 C 130 62 126 96 122 122', 'seam', true],
      ['M 136 34 L 150 50 L 192 62 C 200 64 202 69 201 75', 'cut', true],
      ['M 201 75 C 209 110 215 150 219 190', 'cut', true],
      ['M 219 190 L 193 196', 'cut', true],
      ['M 193 196 C 187 158 180 122 174 108', 'cut', true],
      ['M 201 75 C 190 82 180 94 174 108', 'seam', true],
      ['M 216 178 L 190 184', 'seam', true],
      ['M 174 108 C 177 160 180 224 181 274', 'cut', true],
      ['M 181 274 L 120 274', 'cut', true],
      ['M 122 122 L 120 274', 'seam', false],
      ['M 138 176 L 174 176 L 175 192 L 139 192 Z', 'cut', true],
      ['M 141 180 L 171 180', 'stitch', true]
    ],
    botoes: [[129, 134, 3.2, false], [129, 172, 3.2, false]]
  },

  /* --- peças acrescentadas para o aplicativo --- */

  camiseta: {
    caixa: [240, 230],
    tracos: [
      ['M 120 36 L 133 36 C 141 37 145 42 146 48', 'cut', true],
      ['M 120 44 L 131 44 C 137 45 140 49 141 54', 'stitch', true],
      ['M 146 48 L 186 60 C 192 62 194 66 193 71', 'cut', true],
      ['M 193 71 C 198 86 202 100 205 114', 'cut', true],
      ['M 205 114 L 178 122', 'cut', true],
      ['M 178 122 C 174 108 170 96 166 88', 'cut', true],
      ['M 193 71 C 184 74 172 80 166 88', 'seam', true],
      ['M 203 108 L 176 116', 'stitch', true],
      ['M 166 88 C 169 124 170 164 170 200', 'cut', true],
      ['M 170 200 L 120 200', 'cut', true],
      ['M 170 193 L 120 193', 'stitch', true],
      ['M 120 36 L 120 200', 'seam', false]
    ],
    botoes: []
  },

  /* Sapato é vista lateral: não há simetria para espelhar. Bico à esquerda. */
  tenis: {
    caixa: [240, 160],
    tracos: [
      /* solado */
      ['M 24 120 C 19 129 24 137 34 137 L 201 137 C 212 137 216 128 210 120 Z', 'cut', false],
      ['M 24 126 L 211 126', 'seam', false],
      ['M 26 132 L 209 132', 'stitch', false],
      /* cabedal */
      ['M 26 120 C 28 102 42 90 64 84 C 88 77 106 68 120 56 C 126 51 132 50 137 54 L 148 63 C 152 67 156 75 158 84 C 162 74 172 67 184 67 C 198 67 206 80 208 96 L 210 120', 'cut', false],
      /* biqueira */
      ['M 60 86 C 66 100 68 110 68 120', 'seam', false],
      ['M 55 89 C 61 102 63 111 63 120', 'stitch', false],
      /* gáspea e ilhoses */
      ['M 104 74 C 116 66 126 58 134 54', 'seam', false],
      ['M 108 70 L 122 79', 'stitch', false],
      ['M 116 62 L 130 71', 'stitch', false],
      ['M 124 55 L 138 64', 'stitch', false],
      /* contraforte */
      ['M 186 70 C 192 84 196 100 198 120', 'seam', false],
      ['M 158 84 C 168 88 178 92 186 98', 'stitch', false]
    ],
    botoes: [[110, 71, 1.7, false], [118, 63, 1.7, false], [126, 56, 1.7, false]]
  },

  frasco: {
    caixa: [240, 250],
    tracos: [
      ['M 120 30 L 146 30 C 149 30 150 32 150 35 L 150 60 L 120 60', 'cut', true],
      ['M 120 38 L 150 38', 'stitch', true],
      ['M 120 52 L 150 52', 'stitch', true],
      ['M 136 60 L 136 76 L 120 76', 'cut', true],
      ['M 136 76 C 158 80 172 92 174 110 L 176 196 C 176 210 168 218 154 218 L 120 218', 'cut', true],
      ['M 120 210 C 146 210 164 206 170 194', 'seam', true],
      ['M 120 120 L 158 120 L 158 168 L 120 168', 'cut', true],
      ['M 120 134 L 152 134', 'stitch', true],
      ['M 120 148 L 146 148', 'stitch', true],
      ['M 120 176 C 146 176 164 172 172 164', 'seam', true],
      ['M 120 30 L 120 218', 'seam', false]
    ],
    botoes: []
  },

  etiqueta: {
    caixa: [240, 200],
    tracos: [
      ['M 120 40 L 152 52 C 160 56 164 62 164 70 L 164 156 C 164 164 158 170 150 170 L 120 170', 'cut', true],
      ['M 120 60 L 146 70 C 152 73 155 77 155 83 L 155 150 C 155 156 151 160 145 160 L 120 160', 'stitch', true],
      ['M 120 100 L 150 100', 'stitch', true],
      ['M 120 116 L 144 116', 'stitch', true],
      ['M 120 40 L 120 170', 'seam', false]
    ],
    botoes: [[120, 58, 5, false]]
  }
}

const peca = computed(() => PECAS[props.peca])

const tracos = computed(() =>
  peca.value.tracos.flatMap(([d, cls, esp]) =>
    esp ? [{ d, cls }, { d: espelha(d), cls }] : [{ d, cls }]
  )
)

const botoes = computed(() =>
  peca.value.botoes.flatMap(([x, y, r, esp]) =>
    esp ? [{ x, y, r }, { x: 2 * CX - x, y, r }] : [{ x, y, r }]
  )
)

const caixa = computed(() => {
  const [w, h] = peca.value.caixa
  const m = props.margem
  return `${-m} ${-m / 2} ${w + m * 2} ${h + m}`
})

const rotulo: Record<Flat, string> = {
  jaqueta: 'Jaqueta de trabalho, vista de frente',
  calca: 'Calça, vista de frente',
  camisa: 'Camisa, vista de frente',
  camiseta: 'Camiseta, vista de frente',
  casaco: 'Sobretudo, vista de frente',
  tenis: 'Calçado, vista lateral',
  frasco: 'Frasco, vista de frente',
  etiqueta: 'Etiqueta, vista de frente'
}
</script>

<template>
  <svg class="flat" :viewBox="caixa" role="img" :aria-label="`Desenho técnico. ${rotulo[props.peca]}`">
    <path v-for="(t, i) in tracos" :key="`t${i}`" :class="t.cls" :d="t.d" />
    <circle v-for="(b, i) in botoes" :key="`b${i}`" class="btn" :cx="b.x" :cy="b.y" :r="b.r" />
  </svg>
</template>

<style scoped>
.flat {
  display: block;
  width: 100%;
  height: 100%;
  overflow: visible;
}
.flat :deep(path),
.flat path,
.flat circle {
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  vector-effect: non-scaling-stroke;
}
.flat .cut { stroke-width: 1.9; }
.flat .seam { stroke-width: 1.05; }
.flat .stitch { stroke-width: 0.8; stroke-dasharray: 3 2.6; }
.flat .btn { stroke-width: 1.05; }
</style>
