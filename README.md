# Allegorio

Allegorio é uma publicação editorial brasileira de moda masculina que deve evoluir, com o tempo, para uma plataforma de descoberta, recomendação e comércio curado.

O projeto começa como **site + newsletter**, com vídeos curtos faceless no TikTok e Instagram usados como distribuição. A ambição de longo prazo inclui contas, avaliações estruturadas, perfis de estilo, recomendação de looks, peças e perfumes, afiliados, decants, brechó e parcerias.

## Estado atual

- Fase: implementação do MVP editorial e protótipo privado do aplicativo de acervo.
- Nome da marca: **Allegorio**, sujeito à validação jurídica e de disponibilidade digital.
- Stack editorial: Nuxt 4 + TypeScript + Nuxt Content, em `web/`.
- Stack do aplicativo: Nuxt 4 PWA, em `app/`, preparado para Cloudflare Workers + Supabase.
- Identidade visual: direção inicial em tons de marrom e branco, ainda em exploração.
- Produto lançado: não.
- Data deste contexto: 2026-08-16.

## Documentos

1. [Visão e princípios](docs/00-vision.md)
2. [ICP e posicionamento](docs/01-icp-and-positioning.md)
3. [MVP editorial](docs/02-editorial-mvp.md)
4. [Evolução para plataforma](docs/03-platform-evolution.md)
5. [Monetização e confiança](docs/04-monetization-and-trust.md)
6. [Decisões e questões em aberto](docs/05-decisions-and-open-questions.md)
7. [Guardrails e alertas de desvio](docs/06-guardrails.md)
8. [MVP do aplicativo](docs/07-app-mvp.md)

O arquivo [CLAUDE.md](CLAUDE.md) resume o contexto operacional para futuras sessões com agentes de código.

## Estrutura

```
docs/   documentação estratégica (fonte de verdade do produto)
web/    aplicação Nuxt — blog + newsletter
app/    aplicação Nuxt — guarda-roupa, perfumes e recomendação contextual
```

## Desenvolvimento local

Requer Node 22.12+ e pnpm 11.

```bash
cd web
pnpm install
pnpm dev
```

Artigos ficam em `web/content/artigos/*.md`, com schema em `web/content.config.ts`.
As inscrições da newsletter são gravadas em `web/.data/subscribers.jsonl` — arquivo local,
provisório até existir um backend.
