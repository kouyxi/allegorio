# Project Context — Allegorio

Este diretório contém a definição inicial de uma publicação editorial de moda masculina que poderá evoluir para um ecossistema de conteúdo, dados, recomendação e comércio.

## Antes de trabalhar no projeto

Leia, nesta ordem:

1. `docs/00-vision.md`
2. `docs/01-icp-and-positioning.md`
3. `docs/06-guardrails.md`
4. o documento da fase em que o trabalho se encontra;
5. `docs/05-decisions-and-open-questions.md` antes de tomar decisões de produto.

Para trabalho no aplicativo, o documento da fase é `docs/07-app-mvp.md`.

## Fonte de verdade

- Estes documentos registram a intenção atual do fundador.
- Não trate hipóteses como decisões. Elas estão marcadas explicitamente.
- Quando uma decisão relevante for tomada, registre-a em `docs/05-decisions-and-open-questions.md` e atualize qualquer documento afetado.
- **Allegorio** é o nome atual da marca e do diretório. Não o substitua silenciosamente; disponibilidade jurídica, domínio e usuários sociais ainda precisam ser validados.

## Resumo do produto

- O produto inicial é uma **publicação editorial**, não um perfil de creator e não um SaaS.
- O site é o destino principal; a newsletter cria relacionamento e recorrência.
- TikTok e Instagram distribuem conteúdo por meio de vídeos curtos faceless, técnicos e visualmente editoriais.
- O foco inicial é ajudar homens jovens a amadurecer o streetwear por meio de fundamentos de workwear e clássicos contemporâneos.
- A autoridade deve vir de método, explicações, exemplos e transparência, não da performance de um guru.
- A evolução pretendida é: publicação -> participação -> personalização -> recomendação -> comércio.

## Princípios que não devem ser alterados silenciosamente

1. Conteúdo gratuito deve resolver problemas de verdade.
2. Receita deve vir de utilidade adicional, não de escassez artificial de informação.
3. Comissão de afiliado nunca deve controlar silenciosamente uma recomendação.
4. Produto e ferramenta devem nascer de demanda e dados observados.
5. Não construir um algoritmo sofisticado antes de existir catálogo e comportamento suficientes.
6. Não lançar uma rede social genérica; começar por contribuições estruturadas que tenham utilidade individual.
7. Cadência sustentável importa mais que volume aspiracional.
8. O posicionamento inicial pode ser estreito sem limitar a ambição futura.

## Protocolo obrigatório de alerta de desvio

Antes de implementar ou recomendar uma mudança relevante, compare-a com `docs/06-guardrails.md`.

Se um pedido ou decisão contrariar um guardrail:

1. exiba o título **ALERTA DE DESVIO ESTRATÉGICO**;
2. identifique o guardrail afetado;
3. explique concretamente o risco para o projeto;
4. proponha uma alternativa que preserve a intenção do pedido;
5. peça confirmação antes de executar a direção conflitante quando ela produzir mudança material.

O alerta não é um bloqueio permanente. O fundador pode alterar conscientemente a estratégia, mas o conflito nunca deve passar silenciosamente.

Exemplos que exigem alerta:

- escolher uma estética genérica de “old money”, luxo europeu performático ou streetwear hype;
- publicar fundamentos sem conectá-los à lente estética do ICP;
- criar rotinas independentes para site, newsletter e redes sem reaproveitamento editorial;
- depender de imagens de terceiros sem política de licenciamento;
- usar CTA social genérico que não ofereça utilidade específica no site;
- publicar conteúdo ou produtos sem metadados que sustentem o catálogo futuro;
- introduzir afiliados, reviews, contas ou parcerias sem regras de confiança e governança;
- construir comunidade, personalização ou algoritmo antes de existir demanda e dados suficientes.

## Restrições atuais

- Fundador trabalha como gerente e possui tempo limitado.
- Audiência inicial é zero.
- Capital inicial é baixo.
- O projeto pode crescer lentamente; não existe exigência de receita imediata.
- Evitar transformar programação em fuga da produção editorial.

## Estado da implementação

A publicação Nuxt vive em `web/`. Um segundo projeto Nuxt vive em `app/` e implementa o protótipo mobile-first de acervo pessoal, lista de desejos e recomendação contextual de roupas + perfumes. Nada foi lançado.

O protótipo em `app/` é uma mudança consciente registrada em 2026-08-18. Ele deve continuar estreito: utilidade pessoal antes de comunidade ou catálogo global, regras determinísticas antes de IA e itens adquiridos antes de sugestões de compra. Cloudflare Workers + Supabase substituem a hipótese inicial de Phoenix para este primeiro backend durável; Phoenix pode ser reavaliado quando a lógica de domínio ou os jobs justificarem a operação própria.

A home, o índice e a página de artigo já aplicam a direção visual definitiva. O sistema de design está em `web/app/assets/css/main.css`; os sketches que levaram até ele ficaram em `design/`, com `design/build.py` embutindo as imagens para publicação como artifact.

Em 2026-08-18 o sistema ganhou uma gramática própria, tirada da ficha técnica de confecção. A justificativa, as cinco decisões e a norma de fotografia estão em `docs/08-visual-identity.md`, que é a fonte de verdade do assunto.

Em 2026-08-19 o aplicativo ganhou fotografia de peça com recorte de fundo no
aparelho, a página `/historico` e a busca automática de temperatura, e o preset
de entrega na Cloudflare foi corrigido de `cloudflare` para `cloudflare-module`.
As decisões estão em `docs/05-decisions-and-open-questions.md` e os detalhes em
`docs/07-app-mvp.md`.

O aplicativo em `app/` foi redesenhado do zero em 2026-08-18 e tem sistema
próprio em `app/app/assets/css/main.css`. Ele é um dialeto da publicação, com a
justificativa e a tabela de divergências em `docs/05-decisions-and-open-questions.md`.
As regras abaixo valem para `web/`; dentro de `app/` valem raio de canto,
profundidade por sombra, transições de 150ms a 400ms e tipografia própria:
**Bricolage Grotesque** no display, **Onest** na interface e Martian Mono só em
algarismo. O aplicativo não usa mais Archivo. O parentesco com a publicação passa
a vir da monocromia, do desenho técnico e da notação de ficha, não da fonte. Continuam valendo nos
dois: sem serifa, monocromia e desenho técnico gerado por código.

Regras do sistema visual que não devem ser quebradas sem alerta:

- sem serifa em nenhum lugar; display é Archivo Expanded 900, texto é Martian Mono;
- Archivo em `wdth 125 / wght 900` tem avanço **médio de 0,851em por maiúscula**, e a variação entre letras é grande: `G` 1,012 · `O` 1,008 · `A` 0,954 · `R` 0,943 · `E` 0,860 · `L` 0,786 · `I` 0,395. Não estime "1em por letra": erra 18% para mais e produz display tímido. Para medir a largura exata de uma palavra, baixe o subset latin (o bloco com `U+0000-00FF` na CSS do Google Fonts) e rode:

  ```python
  from fontTools.ttLib import TTFont
  from fontTools.varLib.instancer import instantiateVariableFont
  f = instantiateVariableFont(TTFont("archivo-latin.woff2"), {"wdth": 125, "wght": 900})
  upem, cmap, hmtx = f["head"].unitsPerEm, f.getBestCmap(), f["hmtx"]
  em = sum(hmtx[cmap[ord(c)]][0] / upem for c in "PALAVRA")
  ```

  A largura final é `(em + letter_spacing * n_letras) × font_size`;
- **a interface é monocromática**: papel, preto e os cinzas derivados, mais nada. A única cor do site está nas fotografias, e ela chega conforme a imagem entra na tela. Os tokens `--accent`, `--accent-ink` e `--on-accent` continuam existindo, apontando para os neutros, caso a decisão mude;
- sem cor, a hierarquia sai de valor, peso e escala. Ênfase é `.acc` (preto cheio) contra `.dim` no entorno;
- nada de artefato fingido: sem "Fig. 01", sem número de edição, sem numeral romano de data, sem ® numa marca ainda não registrada. Latim só como etiqueta pequena, nunca como manchete;
- zero raio de canto, borda única de 2px, transições de 60ms;
- fotografia entra legendada como prova técnica, nunca como enfeite;
- as fotos atuais são provisórias (Creative Commons via Openverse) e devem ser trocadas por produção própria, seguindo a norma de enquadramento de `docs/08-visual-identity.md`;
- **toda régua horizontal é linha de corte com margem de costura**: fio de 2px, pontilhado de 1px cinco pixels abaixo, piquetes nas pontas dos cabeçalhos. Está em `.slab`, `.head`, `.corte` e `.piquete`;
- **a canhota do documento é uma fita métrica** (`.rail`), presente em toda página acima de 860px. Não remover para ganhar largura;
- **a notação é única** (`Ficha.vue`), com ordem de campo fixa: material é `MATÉRIA · CONSTRUÇÃO · PESO · PROCEDÊNCIA`, artigo é `PILAR · AFERIÇÃO · DATA`. Nenhuma chamada nova inventa ordem própria;
- **o selo é paramétrico** (`VaultSeal.vue`): passando `semente`, os anéis e caixotões saem de hash determinístico do conteúdo. Não substituir por arquivo estático;
- **as peças aparecem em desenho técnico** (`FlatTecnico.vue`) gerado por código, com três pesos de traço que carregam significado: cheio é corte, fino é costura de união, pontilhado é pesponto. O desenho é figura de artigo, não vitrine: nada de prancha de demonstração na home;
- **o registro é o de uma publicação séria**. Compromissos editoriais aparecem como texto sob "Política editorial", nunca fantasiados de etiqueta de conservação ou de qualquer outro artefato de vestuário;
- valor de ficha que não veio de peça aferida precisa vir marcado como referência de categoria.

## Voz e escrita

Registro: profissional, com um pouco de pessoal. Usa "a gente" quando cabe, sem virar diário.

Padrões que denunciam texto de IA e que não devem voltar:

1. travessão (—) no meio da frase; use vírgula, dois pontos ou corte em duas frases;
2. a fórmula "não é X, é Y" usada como muleta retórica;
3. tricolon aforístico, ou seja, três frases curtas em paralelo fechando um parágrafo;
4. listas negativas do tipo "sem hype, sem promoção, sem calendário";
5. frase curta de efeito encerrando todo parágrafo;
6. paralelismo perfeito entre itens de uma lista, com todos na mesma forma sintática;
7. conectivos de ênfase como "e é exatamente por isso que".

O antídoto é variar o comprimento das frases, deixar alguma correr mais solta e trocar aforismo por informação concreta.

Decisões técnicas atuais:

- Nuxt 4 é responsável pela publicação, renderização e frontend;
- Nuxt Content mantém o conteúdo editorial estruturado no MVP (`web/content/artigos/`);
- a newsletter grava inscrições em arquivo local (`web/.data/subscribers.jsonl`) via `server/api/subscribe.post.ts`; é provisório e deve ser o primeiro trecho a migrar para Phoenix ou um provedor de e-mail;
- a publicação em `web/` não possui banco transacional nem autenticação;
- o aplicativo em `app/` cria a primeira necessidade real de estado durável e autorização, atendida no V1 por Supabase Auth, Postgres e Storage;
- Phoenix permanece uma opção futura caso lógica de domínio ou jobs persistentes justifiquem backend próprio;
- a intenção de hospedagem da publicação é uma VPS da Hetzner; o aplicativo está configurado para Cloudflare Workers.

Não antecipar autenticação, filas, banco transacional ou serviços separados antes desses gatilhos.
