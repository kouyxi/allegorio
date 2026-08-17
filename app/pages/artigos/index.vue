<script setup lang="ts">
const { data: articles } = await useAsyncData('published-articles', () => {
  return queryCollection('articles')
    .where('status', '=', 'published')
    .order('publishedAt', 'DESC')
    .all()
})

useSeoMeta({
  title: 'Artigos — Allegorio',
  description: 'Guias, fundamentos e análises de moda masculina publicados pela Allegorio.',
})
</script>

<template>
  <section class="page-section">
    <div class="container container--narrow">
      <header class="page-heading">
        <p class="eyebrow">Acervo editorial</p>
        <h1>Artigos</h1>
        <p>Fundamentos, peças, aplicações e análises organizados para consulta.</p>
      </header>

      <div v-if="articles?.length" class="article-grid">
        <ArticleCard
          v-for="article in articles"
          :key="article.path"
          :title="article.title"
          :description="article.description"
          :path="article.path.replace('/articles/', '/artigos/')"
          :pillar="article.pillar"
        />
      </div>

      <p v-else class="empty-state">
        O primeiro percurso editorial está em preparação.
      </p>
    </div>
  </section>
</template>
