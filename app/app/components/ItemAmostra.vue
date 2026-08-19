<script setup lang="ts">
import type { CollectionItem } from '~/types/domain'
import { itemColor } from '~/utils/format'

/**
 * A marca miúda de um item nas listas.
 *
 * É a amostra de cor de sempre quando não existe foto, e a própria foto quando
 * existe. Esta é a razão de a fotografia entrar no aplicativo: duas camisetas
 * pretas produzem a mesma amostra e o mesmo desenho, e a linha do look fica
 * pedindo para a pessoa adivinhar qual das duas o motor escolheu.
 */
const props = defineProps<{ item: CollectionItem }>()

const foto = useImagemDoItem(() => props.item)
const cor = computed(() => itemColor(props.item.kind, props.item.colorHex))
</script>

<template>
  <span class="amostra swatch" :style="{ '--sw': cor }">
    <img
      v-if="foto"
      :src="foto"
      alt=""
      loading="lazy"
      decoding="async"
      :class="item.imageCutout ? 'amostra__recorte' : 'amostra__foto'"
    >
  </span>
</template>

<style scoped>
.amostra { display: block; }
.amostra img { position: absolute; inset: 0; width: 100%; height: 100%; }
.amostra__foto { object-fit: cover; }
.amostra__recorte { padding: 10%; object-fit: contain; }
</style>
