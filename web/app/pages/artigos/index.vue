<script setup lang="ts">
import type { Artigo } from '~/types/artigo'

const { data: artigos } = await useAsyncData('artigos', () =>
  queryCollection('artigos').order('date', 'DESC').all()
)

const todos = computed(() => (artigos.value ?? []) as unknown as Artigo[])

useHead({ title: 'Índice · Allegorio' })
</script>

<template>
  <section class="slab shell">
    <div class="head">
      <h2 class="fat">Índice</h2>
      <p class="lbl dim">Organizado por assunto</p>
    </div>

    <template v-if="todos.length">
      <IndexRow
        v-for="(a, i) in todos"
        :key="a.path"
        :artigo="a"
        :numero="String(i + 1).padStart(3, '0')"
      />
    </template>

    <p v-else class="lbl dim">Nenhum artigo publicado ainda.</p>
  </section>
</template>
