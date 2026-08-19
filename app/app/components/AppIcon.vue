<script setup lang="ts">
/**
 * Conjunto de ícones da casa. Traço de 1.6 em caixa de 24, sem preenchimento,
 * herdando a cor do contexto. Os ícones de papel (top, bottom, footwear...)
 * são glifos simplificados e não desenhos técnicos: abaixo de 24px o traço
 * triplo da ficha vira borrão.
 */
const props = withDefaults(defineProps<{
  name: string
  size?: string
  /** peso do traço em unidades da caixa de 24. Abaixo de 18px o traço encolhe
   *  junto com o ícone e some, então o tamanho pequeno pede peso maior. */
  weight?: number
}>(), { size: '1.25rem', weight: 1.6 })

type Glyph = { d: string[], c?: [number, number, number][], preenchido?: boolean }

const ICONS: Record<string, Glyph> = {
  /* navegação e sistema */
  sun: { d: ['M12 3v1.9M12 19.1V21M21 12h-1.9M4.9 12H3M18.4 5.6l-1.35 1.35M6.95 17.05 5.6 18.4M18.4 18.4l-1.35-1.35M6.95 6.95 5.6 5.6'], c: [[12, 12, 3.6]] },
  hanger: { d: ['M12 5.4a2.1 2.1 0 1 1 2.1 2.1c-1.16 0-2.1.94-2.1 2.1', 'M12 9.6 4.2 15c-.95.66-.48 2.15.68 2.15h14.24c1.16 0 1.63-1.49.68-2.15L12 9.6Z'] },
  plus: { d: ['M12 5.5v13M5.5 12h13'] },
  minus: { d: ['M5.5 12h13'] },
  sliders: { d: ['M4 8.5h6.5M14.5 8.5H20M4 15.5h3.5M11.5 15.5H20'], c: [[12.5, 8.5, 2.1], [9.5, 15.5, 2.1]] },
  search: { d: ['m16 16 4.5 4.5'], c: [[11, 11, 6.5]] },
  filter: { d: ['M4 7h16M7 12h10M10 17h4'] },
  close: { d: ['m6 6 12 12M18 6 6 18'] },
  chevron: { d: ['m9 5.5 7 6.5-7 6.5'] },
  chevronDown: { d: ['m5.5 9 6.5 7 6.5-7'] },
  arrow: { d: ['M4.5 12h15M13 5.5l6.5 6.5-6.5 6.5'] },
  swap: { d: ['M17 4.5 20.5 8 17 11.5M20.5 8H7.5M7 12.5 3.5 16 7 19.5M3.5 16h13'] },
  shuffle: { d: ['M20 7.5v5h-5M4 16.5v-5h5', 'M6.2 8.6A7 7 0 0 1 18.6 7.9M17.8 15.4a7 7 0 0 1-12.4.7'] },
  undo: { d: ['M4.5 10h9.5a5.5 5.5 0 0 1 0 11H10', 'm4.5 10 4.5-4.5M4.5 10 9 14.5'] },
  check: { d: ['M5 12.5 10 17.5 19 7.5'] },
  clock: { d: ['M12 7.5V12l3 1.8'], c: [[12, 12, 8]] },
  heart: { d: ['M12 19.5s-7.2-4.3-7.2-9.15A3.9 3.9 0 0 1 12 8.1a3.9 3.9 0 0 1 7.2 2.25c0 4.85-7.2 9.15-7.2 9.15Z'] },
  trash: { d: ['M4.5 6.5h15M9.5 6.5V5a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v1.5M6.5 6.5l.8 12.1a1 1 0 0 0 1 .9h7.4a1 1 0 0 0 1-.9l.8-12.1M10 10v6M14 10v6'] },
  pencil: { d: ['M4.5 19.5h4L19 9a2.1 2.1 0 0 0-3-3L5.5 16.5l-1 3Z', 'M14.5 7.5 17.5 10.5'] },
  layers: { d: ['m12 3.5 8.5 4.5-8.5 4.5L3.5 8l8.5-4.5Z', 'm3.5 12.5 8.5 4.5 8.5-4.5', 'm3.5 16.5 8.5 4.5 8.5-4.5'] },
  info: { d: ['M12 11v5.5M12 7.6v.1'], c: [[12, 12, 8.5]] },
  olho: { d: ['M2.6 12S6.4 5.9 12 5.9 21.4 12 21.4 12 17.6 18.1 12 18.1 2.6 12 2.6 12Z'], c: [[12, 12, 3.1]] },
  olhoFechado: { d: ['M3.5 3.5l17 17', 'M9.6 6.4A9.6 9.6 0 0 1 12 6.1c5.6 0 9.4 5.9 9.4 5.9a17 17 0 0 1-3.3 3.8M14.9 15.4A9 9 0 0 1 12 15.9c-5.6 0-9.4-5.9-9.4-5.9a17 17 0 0 1 4-4.3', 'M10.1 10.1a2.7 2.7 0 0 0 3.8 3.8'] },

  /* O G do Google em traço único e monocromático. A marca oficial é
     quadricolor, e a interface deste aplicativo não tem cor que não venha da
     roupa ou do frasco. Recolorir é desvio pequeno de guia de marca; furar a
     monocromia seria desvio grande do sistema da casa, e a forma do glifo já
     carrega o reconhecimento. */
  google: {
    preenchido: true,
    d: ['M21.6 12.23c0-.71-.06-1.4-.18-2.05H12v3.88h5.38a4.6 4.6 0 0 1-2 3.02v2.5h3.24c1.89-1.74 2.98-4.3 2.98-7.35Z M12 22c2.7 0 4.96-.9 6.62-2.42l-3.24-2.51c-.9.6-2.05.96-3.38.96-2.6 0-4.8-1.76-5.59-4.12H3.06v2.59A10 10 0 0 0 12 22Z M6.41 13.91a5.99 5.99 0 0 1 0-3.82V7.5H3.06a10 10 0 0 0 0 9L6.4 13.9Z M12 5.98c1.47 0 2.79.5 3.83 1.5l2.87-2.87C16.96 3 14.7 2 12 2A10 10 0 0 0 3.06 7.5l3.35 2.6c.79-2.37 3-4.12 5.59-4.12Z']
  },

  /* situações */
  coffee: { d: ['M4.5 8.5h12v5.5a4.5 4.5 0 0 1-4.5 4.5h-3a4.5 4.5 0 0 1-4.5-4.5V8.5Z', 'M16.5 10h1.4a2.6 2.6 0 0 1 0 5.2h-1.4', 'M7.5 3.5v2M11 3v2.5M14.5 3.5v2'] },
  briefcase: { d: ['M3.5 8.5h17V19a1 1 0 0 1-1 1h-15a1 1 0 0 1-1-1V8.5Z', 'M9 8.5V6.2A1.7 1.7 0 0 1 10.7 4.5h2.6A1.7 1.7 0 0 1 15 6.2v2.3', 'M3.5 13.2h17'] },
  spark: { d: ['M12 3.4c.62 4.5 3.08 6.96 7.6 7.6-4.52.64-6.98 3.1-7.6 7.6-.62-4.5-3.08-6.96-7.6-7.6 4.52-.64 6.98-3.1 7.6-7.6Z', 'M18.6 3v2.6M19.9 4.3h-2.6'] },

  /* clima */
  cloud: { d: ['M7.2 18.5h9.3a3.6 3.6 0 0 0 .4-7.18A5.3 5.3 0 0 0 7 11.2a3.7 3.7 0 0 0 .2 7.3Z', 'M15.8 7.4 17.2 6M13 5.6V4M9.4 7.2 8.2 6'] },
  snow: { d: ['M12 3.5v17M4.65 7.75l14.7 8.5M19.35 7.75l-14.7 8.5', 'M12 6.6 9.7 4.9M12 6.6l2.3-1.7M12 17.4l-2.3 1.7M12 17.4l2.3 1.7'] },

  /* papéis do look */
  top: { d: ['M8.6 4.2 5 6.4 3.4 10l2.6 1.3V20h12v-8.7L20.6 10 19 6.4l-3.6-2.2', 'M8.6 4.2a3.4 3.4 0 0 0 6.8 0'] },
  bottom: { d: ['M7.2 4h9.6l1 16h-3.9l-.9-9.4-.9 9.4H6.2L7.2 4Z', 'M7 8.2h10'] },
  outer: { d: ['M9 4.2 5.6 6.4 4 10l2.6 1.3V20h10.8v-8.7L20 10l-1.6-3.6L15 4.2', 'M12 4.2V20', 'M9 4.2l3 2.8 3-2.8'] },
  footwear: { d: ['M3.4 16.2c3-.6 5.9-3.1 7.8-6.6l3.4 1c.5 3 2.5 5 5.9 6 1.6.5 1.6 2.9-.2 2.9H4.6c-1.6 0-1.9-2.8-1.2-3.3Z', 'M4 18.4h15.5'] },
  accessory: { d: ['M4.2 12.4 12.4 4.2h7.4v7.4l-8.2 8.2-7.4-7.4Z'], c: [[16.4, 7.6, 1.3]] },
  scent: { d: ['M10.2 3.4h3.6v2.8h-3.6zM9.6 6.2h4.8', 'M8.2 9.6c0-1.9 1.5-3.4 3.4-3.4h.8c1.9 0 3.4 1.5 3.4 3.4V19a1.6 1.6 0 0 1-1.6 1.6H9.8A1.6 1.6 0 0 1 8.2 19V9.6Z', 'M9.8 12.2h4.4v4.2H9.8z'] },
  onePiece: { d: ['M8.6 4.2 6 6.4V11l1.6.6L7 20h4l1-6.5 1 6.5h4l-.6-8.4L18 11V6.4l-2.6-2.2', 'M8.6 4.2a3.4 3.4 0 0 0 6.8 0'] }
}

const glyph = computed(() => ICONS[props.name] ?? ICONS.info!)
</script>

<template>
  <svg
    class="ico"
    viewBox="0 0 24 24"
    aria-hidden="true"
    focusable="false"
    :class="{ 'ico--fill': glyph.preenchido }"
    :style="{ '--ico-size': props.size, '--ico-weight': props.weight }"
  >
    <path v-for="(d, i) in glyph.d" :key="i" :d="d" />
    <circle v-for="(c, i) in glyph.c ?? []" :key="`c${i}`" :cx="c[0]" :cy="c[1]" :r="c[2]" />
  </svg>
</template>

<style scoped>
.ico {
  flex: 0 0 auto;
  width: var(--ico-size);
  height: var(--ico-size);
  fill: none;
  stroke: currentColor;
  stroke-width: var(--ico-weight, 1.6);
  stroke-linecap: round;
  stroke-linejoin: round;
}

/* Marca de terceiro, que só existe como silhueta fechada. O traço de 1,6 do
   resto do conjunto não descreve um logotipo. */
.ico--fill { fill: currentColor; stroke: none; }
</style>
