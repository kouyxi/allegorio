/* As chaves do Supabase precisam existir em dois momentos: no build, porque o
   valor entra no bundle do navegador, e em execução, porque o Worker também
   renderiza no servidor e lê `useRuntimeConfig` a cada pedido.

   Elas saem daqui para o `vars` do Worker em vez de ficarem escritas no
   `wrangler.jsonc`, que vai para o repositório. Uma `vars` vazia seria pior que
   nenhuma: o Nitro aplica variável de ambiente definida por cima da
   configuração do build, então `""` apagaria justamente o valor que o build
   tinha embutido, e o aplicativo cairia no modo local sem avisar. Por isso o
   filtro de vazio antes de montar o objeto. */
const varsDoWorker = Object.fromEntries(
  ['NUXT_PUBLIC_SUPABASE_URL', 'NUXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY']
    .map(chave => [chave, process.env[chave]])
    .filter(([, valor]) => Boolean(valor))
)

export default defineNuxtConfig({
  modules: ['@vite-pwa/nuxt'],
  compatibilityDate: '2026-08-18',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],

  /* `cloudflare` é apelido do preset antigo, em formato de service worker, que
     serve estáticos por Workers Sites e não combina com o `assets` do
     wrangler.jsonc: o build saía num formato e o deploy esperava outro.
     `cloudflare-module` é o formato de módulo atual.

     Com `deployConfig`, o Nitro lê o `wrangler.jsonc` da raiz, junta `main` e
     `assets` calculados por ele e grava o resultado em `.output/server/`. É por
     isso que aquele arquivo não declara nenhum dos dois: quem sabe o caminho
     do build é o build. */
  nitro: {
    preset: 'cloudflare-module',
    cloudflare: {
      deployConfig: true,
      wrangler: { vars: varsDoWorker }
    }
  },

  /* Cache dos binários do recorte.
     A rede é conferida por hash no script de preparo e nunca muda de conteúdo,
     então pode valer um ano e ser imutável. O runtime não leva versão no nome
     do arquivo: subir o `onnxruntime-web` troca o `.wasm` mantendo o caminho, e
     um `.wasm` velho ao lado de um carregador novo quebra o recorte. Uma semana
     é o intervalo em que a atualização chega sem que a foto volte a baixar
     treze megabytes a cada visita. */
  routeRules: {
    '/modelos/**': { headers: { 'cache-control': 'public, max-age=31536000, immutable' } },
    '/ort/**': { headers: { 'cache-control': 'public, max-age=604800' } }
  },

  runtimeConfig: {
    public: {
      supabaseUrl: '',
      supabasePublishableKey: ''
    }
  },

  app: {
    head: {
      htmlAttrs: { lang: 'pt-BR' },
      meta: [
        { name: 'theme-color', content: '#f3f0e9' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
        { name: 'format-detection', content: 'telephone=no' }
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wdth,wght@12..96,75..100,400..800&family=Onest:wght@300..900&family=Martian+Mono:wdth,wght@75..112.5,300..700&display=swap'
        },
        { rel: 'icon', href: '/icon.svg', type: 'image/svg+xml' },
        { rel: 'apple-touch-icon', href: '/icon.svg' }
      ]
    }
  },

  pwa: {
    /* Era `prompt`, que só atualiza quando algum componente chama
       `updateServiceWorker()` do módulo virtual — e nenhum chamava. Na
       prática isso deixa o service worker antigo no ar para sempre: ele nota
       que existe versão nova e fica esperando um sinal que nunca vem. Foi
       provavelmente o motivo do celular mostrar sessão sem login e acervo de
       demonstração depois do deploy que corrigiu as chaves do Supabase — o
       aparelho continuou servindo o pacote antigo, gravado com as chaves
       vazias, de uma visita anterior. `autoUpdate` troca sozinho assim que
       percebe build novo, sem precisar de interface de aviso. */
    registerType: 'autoUpdate',
    manifest: {
      name: 'Allegorio',
      short_name: 'Allegorio',
      description: 'Seu guarda-roupa e seus perfumes, combinados para a vida real.',
      theme_color: '#f3f0e9',
      background_color: '#f3f0e9',
      display: 'standalone',
      orientation: 'portrait',
      start_url: '/',
      scope: '/',
      lang: 'pt-BR',
      categories: ['lifestyle', 'shopping'],
      icons: [
        {
          src: '/icon.svg',
          sizes: 'any',
          type: 'image/svg+xml',
          purpose: 'any maskable'
        }
      ]
    },
    workbox: {
      navigateFallback: '/',
      /* A rede e o runtime do recorte ficam fora do precache de propósito: são
         18 MB que só quem pede recorte precisa, e o Workbox recusaria os dois
         de qualquer jeito pelo limite de tamanho por arquivo. O cache normal do
         navegador basta, e a segunda foto já não baixa nada. */
      globPatterns: ['**/*.{js,css,html,svg,png,webp,woff2}'],
      globIgnores: ['**/modelos/**', '**/ort/**'],
      cleanupOutdatedCaches: true
    },
    client: {
      installPrompt: true,
      periodicSyncForUpdates: 3600
    },
    devOptions: {
      enabled: false
    }
  }
})
