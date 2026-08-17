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

Existe um scaffold inicial em Nuxt, TypeScript e Nuxt Content. A aplicação ainda não foi lançada e a home definitiva ainda será desenhada.

Decisões técnicas atuais:

- Nuxt é responsável pela publicação, renderização híbrida e frontend;
- Nuxt Content mantém o conteúdo editorial estruturado no MVP;
- não existe banco transacional, autenticação ou backend Phoenix nesta fase;
- Phoenix deve ser reconsiderado quando surgir a primeira necessidade real de estado durável, autorização ou processamento assíncrono persistente;
- a intenção de hospedagem é uma VPS da Hetzner, ainda sem configuração operacional definida.

Não antecipar autenticação, filas, banco transacional ou serviços separados antes desses gatilhos.
