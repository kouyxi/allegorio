<script setup lang="ts">
import type { CollectionItem, RecommendationRole } from '~/types/domain'
import { flatFor, itemColor } from '~/utils/format'

const props = defineProps<{
  item: CollectionItem
  role?: RecommendationRole
  categoryName?: string
}>()

const color = computed(() => itemColor(props.item.kind, props.item.colorHex))
const peca = computed(() => flatFor(props.item.name, props.categoryName, props.role, props.item.kind))
const foto = useImagemDoItem(() => props.item)
</script>

<template>
  <div class="visual" :style="{ '--c': color }">
    <!-- Recorte usa `contain` com folga e foto inteira usa `cover`. A peça sem
         fundo precisa flutuar sobre o campo de cor, como prancha; foto com fundo
         precisa preencher o quadro, senão sobra moldura dentro da moldura. -->
    <img
      v-if="foto"
      :src="foto"
      :alt="item.name"
      loading="lazy"
      decoding="async"
      :class="item.imageCutout ? 'visual__recorte' : 'visual__foto'"
    >
    <div v-else class="visual__flat">
      <FlatTecnico :peca="peca" :margem="14" />
    </div>
    <span class="visual__grain" aria-hidden="true" />
  </div>
</template>

<style scoped>
.visual {
  position: relative;
  display: grid;
  overflow: hidden;
  background:
    radial-gradient(120% 95% at 26% 10%, color-mix(in oklab, var(--c) 12%, white), transparent 72%),
    linear-gradient(158deg,
      color-mix(in oklab, var(--c) 34%, white),
      color-mix(in oklab, var(--c) 54%, white));
}
.visual__foto { width: 100%; height: 100%; object-fit: cover; }
.visual__recorte {
  width: 100%;
  height: 100%;
  padding: 8%;
  object-fit: contain;
  filter: drop-shadow(0 6px 12px rgb(41 34 22 / 18%));
}

/* O traço assume a cor da peça, escurecida o bastante para ler sobre o campo
   claro da mesma cor. É o que amarra desenho e cor real do item. */
.visual__flat {
  display: grid;
  place-items: center;
  padding: 11%;
  color: color-mix(in oklab, var(--c) 32%, #14120f);
}
.visual__flat > * { max-height: 100%; }

.visual__grain {
  position: absolute;
  inset: 0;
  opacity: 0.3;
  mix-blend-mode: multiply;
  pointer-events: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 160 160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.3'/%3E%3C/svg%3E");
}
</style>
