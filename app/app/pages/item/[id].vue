<script setup lang="ts">
const route = useRoute()
const { items } = useCollection()

const item = computed(() => items.value.find(entry => entry.id === route.params.id))
</script>

<template>
  <ItemForm v-if="item" :key="item.id" :item="item" />

  <div v-else class="empty">
    <span class="empty__icon"><AppIcon name="search" size="1.375rem" /></span>
    <h2>Item não encontrado</h2>
    <p>Ele pode ter sido removido em outro momento.</p>
    <NuxtLink class="btn" to="/acervo">Voltar ao acervo</NuxtLink>
  </div>
</template>
