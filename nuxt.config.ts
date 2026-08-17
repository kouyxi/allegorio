export default defineNuxtConfig({
  compatibilityDate: '2026-08-16',
  devtools: { enabled: true },

  modules: ['@nuxt/content'],

  content: {
    experimental: {
      sqliteConnector: 'native',
    },
  },

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    },
  },

  app: {
    head: {
      htmlAttrs: { lang: 'pt-BR' },
      meta: [
        { name: 'theme-color', content: '#f5efe5' },
        { name: 'color-scheme', content: 'light' },
      ],
    },
  },

  nitro: {
    compressPublicAssets: {
      gzip: true,
      brotli: true,
    },
  },

  routeRules: {
    '/': { prerender: true },
    '/artigos': { prerender: true },
  },

  typescript: {
    strict: true,
  },
})
