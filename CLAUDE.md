# Project Context — Allegorio

Este diretório contém a definição inicial de uma publicação editorial de moda masculina que poderá evoluir para um ecossistema de conteúdo, dados, recomendação e comércio.

## Antes de trabalhar no projeto

Leia, nesta ordem:

1. `docs/00-vision.md`
2. `docs/01-icp-and-positioning.md`
3. `docs/06-guardrails.md`
4. o documento da fase em que o trabalho se encontra;
5. `docs/05-decisions-and-open-questions.md` antes de tomar decisões de produto.

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

A aplicação Nuxt vive em `web/`, fora da raiz, para abrir espaço a um backend Phoenix futuro em diretório irmão. O escopo atual é blog + newsletter. Nada foi lançado.

A home, o índice e a página de artigo já aplicam a direção visual definitiva. O sistema de design está em `web/app/assets/css/main.css`; os sketches que levaram até ele ficaram em `design/`, com `design/build.py` embutindo as imagens para publicação como artifact.

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
- as fotos atuais são provisórias (Creative Commons via Openverse) e devem ser trocadas por produção própria.

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
- não existe banco transacional, autenticação ou backend Phoenix nesta fase;
- Phoenix deve ser reconsiderado quando surgir a primeira necessidade real de estado durável, autorização ou processamento assíncrono persistente;
- a intenção de hospedagem é uma VPS da Hetzner, ainda sem configuração operacional definida.

Não antecipar autenticação, filas, banco transacional ou serviços separados antes desses gatilhos.
