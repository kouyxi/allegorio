<script setup lang="ts">
import type { Category, CollectionItem } from '~/types/domain'
import { itemColor, money } from '~/utils/format'

const props = defineProps<{ item: CollectionItem, category?: Category }>()
defineEmits<{ select: [CollectionItem] }>()

const price = computed(() => money(props.item.price))
const detail = computed(() =>
  props.item.kind === 'scent'
    ? [props.item.concentration, props.item.volumeMl ? `${props.item.volumeMl} ml` : undefined].filter(Boolean).join(' · ')
    : [props.item.color, props.item.size].filter(Boolean).join(' · ')
)
</script>

<template>
  <button type="button" class="item" @click="$emit('select', item)">
    <div class="item__visual">
      <ItemVisual :item="item" :role="category?.role" :category-name="category?.name" />
      <span v-if="item.ownership === 'wishlist'" class="item__wish"><AppIcon name="heart" size="0.875rem" /></span>
    </div>

    <div class="item__body">
      <p class="item__brand label dimmer">{{ item.brand || (category?.name ?? '') }}</p>
      <h3 class="item__name">{{ item.name }}</h3>
      <div class="item__foot">
        <span class="item__detail">
          <span
            class="item__dot"
            :style="{ background: itemColor(item.kind, item.colorHex) }"
            aria-hidden="true"
          />
          {{ detail || category?.name }}
        </span>
        <span v-if="price" class="item__price num">{{ price }}</span>
      </div>
    </div>
  </button>
</template>

<style scoped>
.item {
  display: block;
  min-width: 0;
  padding: 0;
  overflow: hidden;
  border: 0;
  border-radius: var(--r-md);
  background: var(--card);
  color: inherit;
  text-align: left;
  box-shadow: var(--sh-2);
  transition: transform var(--t) var(--ease), box-shadow var(--t) var(--ease);
}
.item:hover { transform: translateY(-3px); box-shadow: var(--sh-lift); }
.item:active { transform: scale(0.982); box-shadow: var(--sh-1); }

.item__visual { position: relative; aspect-ratio: 1 / 1.1; }
.item__visual > :first-child { width: 100%; height: 100%; }

.item__wish {
  display: grid;
  place-items: center;
  position: absolute;
  inset: var(--s2) var(--s2) auto auto;
  padding: var(--s1) var(--s2);
  border-radius: var(--r-full);
  background: color-mix(in srgb, var(--card) 88%, transparent);
  color: var(--ink-2);
  backdrop-filter: blur(8px);
  box-shadow: var(--sh-1);
}

.item__body { padding: var(--s3); }
.item__brand { color: var(--ink-4); }
.item__name {
  display: -webkit-box;
  margin-top: var(--s1);
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  font-size: var(--fs-sm);
  font-variation-settings: "wght" 650;
  letter-spacing: -0.016em;
  line-height: 1.25;
}
.item__foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--s2);
  margin-top: var(--s2);
}
.item__detail {
  display: inline-flex;
  align-items: center;
  gap: var(--s1);
  font-size: 0.625rem;
  min-width: 0;
  overflow: hidden;
  color: var(--ink-3);
  white-space: nowrap;
  text-overflow: ellipsis;
}
.item__dot {
  flex: 0 0 auto;
  width: 0.5625rem; height: 0.5625rem;
  border-radius: var(--r-full);
  box-shadow: inset 0 0 0 1px rgb(20 18 15 / 18%);
}
.item__price { flex: 0 0 auto; color: var(--ink-2); font-size: 0.625rem; }
</style>
