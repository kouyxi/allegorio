<script setup lang="ts">
const props = defineProps<{
  error: {
    statusCode?: number
    statusMessage?: string
  }
}>()

const message = computed(() => {
  return props.error.statusCode === 404
    ? 'Esta página não faz parte do acervo.'
    : 'Não foi possível abrir esta página.'
})
</script>

<template>
  <NuxtLayout>
    <section class="page-section">
      <div class="container container--narrow empty-state">
        <p class="eyebrow">Erro {{ error.statusCode || 500 }}</p>
        <h1>{{ message }}</h1>
        <button class="button" type="button" @click="clearError({ redirect: '/' })">
          Voltar ao início
        </button>
      </div>
    </section>
  </NuxtLayout>
</template>
