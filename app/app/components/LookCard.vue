<script setup lang="ts">
import type { Climate, LookResult, LookSlot, RecommendationContext } from '~/types/domain'
import { CLIMATE_ICONS, CLIMATE_LABELS, CONTEXT_ICONS } from '~/utils/recommend'

const props = defineProps<{
  look: LookResult
  context: RecommendationContext
  climate: Climate
  /** grau lido agora, ou o rótulo da faixa quando não há leitura */
  climaEtiqueta?: string
  position: number
  total: number
  worn: boolean
}>()

defineEmits<{ swap: [LookSlot] }>()
</script>

<template>
  <article class="look card card--raised" :class="{ 'look--worn': props.worn }">
    <header class="look__head">
      <span class="look__tag">
        <AppIcon :name="CONTEXT_ICONS[props.context.id] ?? 'spark'" size="0.875rem" :weight="2.2" />
        <span class="label">{{ props.context.label }}</span>
      </span>
      <span class="look__tag">
        <AppIcon :name="CLIMATE_ICONS[props.climate]" size="0.875rem" :weight="2.2" />
        <span class="label">{{ props.climaEtiqueta ?? CLIMATE_LABELS[props.climate] }}</span>
      </span>
      <span class="look__index num">
        {{ String(props.position).padStart(2, '0') }}/{{ String(props.total).padStart(2, '0') }}
      </span>
    </header>

    <ul class="look__rows">
      <li v-for="pick in props.look.slots" :key="pick.role">
        <LookRow :pick="pick" @swap="$emit('swap', $event)" />
      </li>
    </ul>

    <span v-if="props.worn" class="look__worn">
      <AppIcon name="check" size="0.875rem" :weight="2.2" />
      <span class="label">Usado</span>
    </span>
  </article>
</template>

<style scoped>
/* Padding único: tudo dentro do cartão nasce na mesma vertical. O bloco de
   motivos saiu daqui para o pé do baralho, porque ele descreve a sugestão
   inteira e era o que fazia o cartão crescer para baixo sem necessidade. */
.look {
  position: relative;
  display: flex;
  flex-direction: column;
  padding: var(--pad);
  transition: box-shadow var(--t) var(--ease);
}

.look__head {
  display: flex;
  align-items: center;
  gap: var(--s2);
  padding-bottom: var(--s2);
  border-bottom: 1px solid var(--line);
}
.look__tag {
  display: inline-flex;
  align-items: center;
  gap: var(--s1);
  padding: var(--s1) var(--s2);
  border-radius: var(--r-full);
  background: var(--paper-2);
  color: var(--ink-2);
}
.look__index { margin-left: auto; color: var(--ink-4); font-size: 0.625rem; }

.look__rows { flex: 1 1 auto; }
.look__rows > li + li { border-top: 1px solid var(--line); }

.look__worn {
  position: absolute;
  inset: auto var(--s3) var(--s3) auto;
  display: inline-flex;
  align-items: center;
  gap: var(--s1);
  padding: var(--s1) var(--s2);
  border-radius: var(--r-full);
  background: var(--ink);
  color: var(--ink-inv);
}
.look--worn { box-shadow: var(--sh-lift); }
</style>
