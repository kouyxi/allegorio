<script setup lang="ts">
import type { LookSlot } from '~/types/domain'
import { ROLE_ICONS, ROLE_SHORT } from '~/utils/recommend'

const props = defineProps<{ pick: LookSlot }>()
defineEmits<{ swap: [LookSlot] }>()

const swappable = computed(() => props.pick.alternatives.length > 0)
</script>

<template>
  <button
    v-if="pick.item"
    type="button"
    class="row"
    :disabled="!swappable"
    :aria-label="`${pick.roleLabel}: ${pick.item.name}${swappable ? '. Tocar para trocar' : ''}`"
    @click="$emit('swap', pick)"
  >
    <ItemAmostra :item="pick.item" class="row__swatch" aria-hidden="true" />

    <span class="row__name">{{ pick.item.name }}</span>

    <span v-if="swappable" class="row__swap">
      <AppIcon name="swap" size="0.875rem" :weight="2.1" />
      <span class="num">{{ pick.alternatives.length }}</span>
    </span>

    <span class="row__meta">
      <AppIcon :name="ROLE_ICONS[pick.role]" size="0.8125rem" :weight="2.3" />
      <span class="row__role">{{ ROLE_SHORT[pick.role] }}</span>
      <span v-if="pick.note" class="row__note">· {{ pick.note }}</span>
    </span>
  </button>

  <div v-else class="row row--gap">
    <span class="row__swatch row__swatch--empty" aria-hidden="true">
      <AppIcon :name="ROLE_ICONS[pick.role]" size="1rem" />
    </span>
    <span class="row__name row__name--muted">Nada no acervo</span>
    <NuxtLink class="row__add" to="/adicionar" :aria-label="`Adicionar ${pick.roleLabel.toLowerCase()}`">
      <AppIcon name="plus" size="1.0625rem" />
    </NuxtLink>
    <span class="row__meta">
      <AppIcon :name="ROLE_ICONS[pick.role]" size="0.8125rem" :weight="2.3" />
      <span class="row__role">{{ ROLE_SHORT[pick.role] }}</span>
      <span class="row__note">· cadastre para completar o look</span>
    </span>
  </div>
</template>

<style scoped>
/* Duas linhas por peça, não três: o nome é o que se procura, e papel mais
   motivo cabem juntos numa linha miúda. Foi o que tirou a altura do cartão.

   A linha miúda ocupa da segunda coluna até a borda, passando por baixo do
   botão de troca. Disputando largura com ele, ela truncava em toda peça. */
.row {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  grid-template-rows: auto auto;
  align-items: center;
  column-gap: var(--s3);
  row-gap: 0.0625rem;
  width: 100%;
  padding: var(--s2) 0;
  border: 0;
  background: transparent;
  color: inherit;
  text-align: left;
  transition: transform var(--t-fast) var(--ease), opacity var(--t) var(--ease);
}
.row:not(:disabled):active { transform: scale(0.985); opacity: 0.72; }
.row:disabled { cursor: default; }

.row__swatch { grid-row: 1 / 3; width: 2.5rem; height: 2.5rem; }
.row__swatch--empty {
  grid-row: 1 / 3;
  display: grid;
  place-items: center;
  width: 2.5rem; height: 2.5rem;
  border: 1px dashed var(--line-3);
  border-radius: var(--r-sm);
  background: var(--paper-2);
  color: var(--ink-4);
}

.row__name {
  grid-column: 2;
  grid-row: 1;
  align-self: end;
  overflow: hidden;
  font-size: var(--fs-base);
  font-variation-settings: "wght" 640;
  letter-spacing: -0.02em;
  line-height: 1.25;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.row__name--muted { color: var(--ink-4); font-variation-settings: "wght" 520; }

.row__meta {
  grid-column: 2 / 4;
  grid-row: 2;
  align-self: start;
  display: flex;
  align-items: center;
  gap: var(--s1);
  min-width: 0;
  color: var(--ink-4);
  font-size: var(--fs-micro);
  line-height: 1.3;
}
.row__role {
  flex: 0 0 auto;
  font-variation-settings: "wght" 700;
  letter-spacing: 0.03em;
  text-transform: uppercase;
}
.row__note {
  overflow: hidden;
  color: var(--ink-3);
  white-space: nowrap;
  text-overflow: ellipsis;
}

.row__swap {
  grid-column: 3;
  grid-row: 1;
  display: inline-flex;
  align-items: center;
  gap: var(--s1);
  padding: var(--s1) var(--s2);
  border-radius: var(--r-full);
  background: var(--paper-2);
  color: var(--ink-3);
  font-size: 0.625rem;
}

.row__add {
  grid-column: 3;
  grid-row: 1 / 3;
  display: grid;
  place-items: center;
  width: 2.5rem; height: 2.5rem;
  border-radius: var(--r-full);
  background: var(--ink);
  color: var(--ink-inv);
  transition: transform var(--t-fast) var(--ease);
}
.row__add:active { transform: scale(0.9); }
</style>
