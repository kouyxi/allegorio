<script setup lang="ts">
const route = useRoute()
const slug = Array.isArray(route.params.slug)
  ? route.params.slug.join('/')
  : route.params.slug

const { data: article } = await useAsyncData(`article:${slug}`, () => {
  return queryCollection('articles')
    .path(`/articles/${slug}`)
    .where('status', '=', 'published')
    .first()
})

if (!article.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Artigo não encontrado',
  })
}

useSeoMeta({
  title: () => `${article.value?.title} — Allegorio`,
  description: () => article.value?.description,
  ogTitle: () => article.value?.title,
  ogDescription: () => article.value?.description,
  ogType: 'article',
})
</script>

<template>
  <article v-if="article" class="article-page">
    <header class="container container--prose article-page__header">
      <p class="eyebrow">{{ article.pillar }}</p>
      <h1>{{ article.title }}</h1>
      <p class="article-page__description">{{ article.description }}</p>
    </header>

    <ContentRenderer class="container container--prose prose" :value="article" />
  </article>
</template>
