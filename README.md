# Allegorio

Allegorio é uma publicação editorial brasileira de moda masculina que deve evoluir, com o tempo, para uma plataforma de descoberta, recomendação e comércio curado.

O projeto começa como **site + newsletter**, com vídeos curtos faceless no TikTok e Instagram usados como distribuição. A ambição de longo prazo inclui contas, avaliações estruturadas, perfis de estilo, recomendação de looks, peças e perfumes, afiliados, decants, brechó e parcerias.

## Estado atual

- Fase: implementação do MVP editorial.
- Nome da marca: **Allegorio**, sujeito à validação jurídica e de disponibilidade digital.
- Stack inicial: Nuxt, TypeScript e Nuxt Content.
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

O arquivo [CLAUDE.md](CLAUDE.md) resume o contexto operacional para futuras sessões com agentes de código.

## Desenvolvimento local

### Requisitos

- Node.js 22.12 ou superior;
- pnpm 11.

### Comandos

```bash
pnpm install
cp .env.example .env
pnpm dev
```

Verificações disponíveis:

```bash
pnpm typecheck
pnpm build
pnpm generate
```

O frontend está em `app/`, os conteúdos editoriais em `content/` e o schema das collections em `content.config.ts`.
