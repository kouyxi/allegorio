# web — Allegorio

Aplicação Nuxt 4 da publicação. Blog (Nuxt Content) + formulário de newsletter.

```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm build      # servidor Nitro em .output/
```

## Onde as coisas estão

| Caminho | O quê |
| --- | --- |
| `app/assets/css/main.css` | o sistema de design: tokens, papéis tipográficos, lajes |
| `content/artigos/*.md` | artigos, com frontmatter validado por `content.config.ts` |
| `app/pages/` | home, índice, página de artigo |
| `app/components/` | `VaultSeal`, `StoryCard`, `IndexRow`, `SiteTicker`, `NewsletterForm` |
| `public/img/` | espécimes fotográficos — **provisórios**, Creative Commons |
| `server/api/subscribe.post.ts` | recebe inscrições e grava em `.data/subscribers.jsonl` |

## Sistema visual

Preto e branco assumido, marrom só como marca. Archivo Expanded 900 no display,
Martian Mono no texto — sem serifa em lugar nenhum. Regras completas em `../CLAUDE.md`.

**Cuidado ao mexer em tipografia:** Archivo Expanded 900 gasta cerca de 1em por
maiúscula. Todo tamanho novo de display precisa ser conferido contra a palavra
mais longa da coluna onde vai viver, senão estoura a célula.

## Provisório

A newsletter grava em arquivo local. Não há banco, autenticação nem fila — por decisão,
não por esquecimento. Ver `../CLAUDE.md` para os gatilhos que justificam introduzir Phoenix.
