// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxt/content'],
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],

  app: {
    head: {
      htmlAttrs: { lang: 'pt-BR' },
      meta: [
        // a barra do navegador acompanha o par papel/tinta do site
        { name: 'theme-color', content: '#efede6', media: '(prefers-color-scheme: light)' },
        { name: 'theme-color', content: '#0e0e0c', media: '(prefers-color-scheme: dark)' }
      ],
      link: [
        // o selo como marca de aba. O SVG troca de cor com o esquema do
        // sistema; os PNGs atendem quem não lê favicon vetorial.
        // Gerados por scripts/gera-favicon.py, não editar à mão.
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32.png' },
        { rel: 'apple-touch-icon', href: '/favicon-180.png' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,400..900&family=Martian+Mono:wdth,wght@75..112.5,300..700&display=swap'
        }
      ]
    }
  }
})
