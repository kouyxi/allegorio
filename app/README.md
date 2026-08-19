# app — Allegorio

PWA mobile-first para organizar roupas e perfumes, manter uma lista de desejos
e montar combinações adequadas a uma situação.

## Desenvolvimento

Requer Node 22.18+ e pnpm 11.

```bash
pnpm install
pnpm recorte    # baixa a rede e o runtime do recorte de fundo
pnpm dev
pnpm test
pnpm deploy     # build + wrangler deploy
```

Sem credenciais do Supabase, o aplicativo abre em modo de demonstração e
persiste alterações no `localStorage` do navegador. As fotos vão para o
IndexedDB.

Para conectar um projeto Supabase:

```bash
cp .env.example .env
```

Preencha `NUXT_PUBLIC_SUPABASE_URL` e
`NUXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Nunca coloque uma `service_role` no
frontend.

## Entrega

O `.env` serve os dois momentos em que as chaves são necessárias. No build, o
valor entra no bundle do navegador. Em execução, o mesmo valor vira `vars` do
Worker, montadas em `nuxt.config.ts` e gravadas na configuração que o Nitro
gera em `.output/server/wrangler.json`. Por isso o `wrangler.jsonc` da raiz não
declara `main`, `assets` nem `vars`: quem sabe esses valores é o build.

```bash
pnpm deploy
```

Rodar `wrangler deploy` sozinho também funciona depois de um build, porque o
Nitro escreve `.wrangler/deploy/config.json` apontando para a configuração
gerada.

O alvo é Workers e não Pages. A Cloudflare recomenda Workers para projeto novo
e concentra nele o trabalho novo de plataforma; Pages continua funcionando e
parou de ganhar recurso. O `observability` do `wrangler.jsonc` já é coisa de
Workers.

### Entrada pelo Google

O código não precisa de nada. O que falta é painel, na ordem abaixo, porque o
endereço de produção só existe depois do primeiro deploy:

1. Google Cloud Console: credencial OAuth, guardando client ID e secret.
2. Supabase, Authentication, Providers, Google: cola os dois.
3. Supabase, Authentication, URL Configuration:
   - **Site URL** recebe o endereço de produção. Ele é o que vai nos links de
     confirmação de e-mail, então `localhost` aqui manda outra pessoa para o seu
     computador;
   - **Redirect URLs** recebe os dois ambientes, com `/**` no fim de cada um:

     ```
     http://localhost:3131/**
     https://<projeto>.workers.dev/**
     ```

     A porta precisa ser a real do `pnpm dev`. O `/**` também não é opcional: a
     barra final conta no casamento do padrão e o retorno chega com barra.

Trocar de domínio depois mexe só nessa lista. O `redirectTo` sai de
`window.location.origin`, então não existe URL fixa dentro do build.

## Recorte de fundo

A foto da peça pode ser guardada com o fundo removido. A rede é a U²-Netp
(Apache-2.0, 4,4 MB) rodando em `onnxruntime-web` dentro do navegador: nenhum
byte da imagem sai do aparelho.

Rede e runtime somam cerca de 18 MB, são servidos pelo próprio domínio e só
baixam quando alguém pede recorte pela primeira vez. Eles não entram no
repositório; `pnpm recorte` refaz os dois e o `pnpm build` chama o script antes
do Nuxt. Se o download falhar, o build segue e a opção de recorte some da tela.

## Estado da primeira fatia

- shell instalável como PWA;
- acervo e lista de desejos;
- filtros por tipo, categoria e faixa de preço;
- categorias com nome editável e papel semântico estável;
- recomendação determinística por contexto;
- fotografia da peça, com recorte de fundo opcional no aparelho;
- histórico de combinações e lista de peças encostadas;
- temperatura buscada sozinha, com o seletor manual ganhando dela;
- autenticação por e-mail e senha, com Supabase Postgres e Storage;
- backup exportável e restaurável em arquivo;
- dados de demonstração locais;
- schema em `supabase/migrations/`.

O domínio pretendido é `app.allegorio.com`.
