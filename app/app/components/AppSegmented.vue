<script setup lang="ts" generic="T extends string">
interface Option { value: T, label: string, count?: number, icon?: string }

const model = defineModel<T>({ required: true })
const props = defineProps<{ options: Option[], label: string }>()

const index = computed(() => Math.max(0, props.options.findIndex(option => option.value === model.value)))
</script>

<template>
  <div
    class="seg"
    role="tablist"
    :aria-label="props.label"
    :style="{ '--seg-count': props.options.length, '--seg-index': index }"
  >
    <span class="seg__thumb" aria-hidden="true" />
    <button
      v-for="option in props.options"
      :key="option.value"
      type="button"
      role="tab"
      class="seg__btn"
      :aria-selected="model === option.value"
      @click="model = option.value"
    >
      <AppIcon v-if="option.icon" :name="option.icon" size="1rem" />
      {{ option.label }}
      <span v-if="option.count !== undefined" class="seg__count">{{ option.count }}</span>
    </button>
  </div>
</template>
