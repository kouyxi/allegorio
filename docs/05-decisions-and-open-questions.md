# Decisões e questões em aberto

Atualizado em 2026-08-16.

## Decidido

- Começar pelo site editorial, não por uma ferramenta ou loja.
- Usar newsletter para recorrência e aviso de novos conteúdos.
- Usar TikTok e Instagram como distribuição, não como destino principal.
- Produzir vídeos curtos faceless, com linguagem técnica e editorial.
- Construir autoridade por método e qualidade, não por persona ou status.
- Começar com um ICP mais estreito que “homens interessados em moda”.
- Explorar a transição de um streetwear jovem para uma estética mais madura, com workwear e clássicos contemporâneos.
- Evoluir para contas, avaliações estruturadas, personalização e recomendação somente com sinais e dados suficientes.
- Monetizar sem enfraquecer a independência editorial.
- Considerar afiliados, produtos editoriais, decants, brechó, parcerias e produtos próprios como vertentes futuras.
- Ensinar fundamentos universais através de uma lente estética específica, em vez de reduzir o conteúdo apenas ao workstreet.
- Operar site, newsletter e redes a partir de um sistema de reaproveitamento editorial.
- Construir uma linguagem visual faceless com ativos originais ou corretamente licenciados.
- Oferecer uma utilidade específica no site como ponte de cada conteúdo social.
- Estruturar metadados desde o MVP sem antecipar um recomendador sofisticado.
- Criar regras de governança antes de abrir reviews, contas, afiliados ou parcerias.
- Alertar explicitamente caso decisões futuras contrariem esses guardrails.
- Adotar **Allegorio**, com `ll`, como nome atual da marca e do projeto; a decisão permanece condicionada à validação jurídica e de disponibilidade digital.
- Adotar Nuxt com TypeScript e Nuxt Content para o MVP editorial.
- Manter o conteúdo editorial estruturado em collections tipadas no início.
- Não introduzir Phoenix, autenticação ou banco transacional antes de existir uma necessidade concreta de estado durável, autorização, catálogo mutável ou jobs persistentes.
- Reavaliar Phoenix como backend de domínio no primeiro desses gatilhos, antes de construir lógica equivalente de produto em Nitro.
- Preservar Nuxt como frontend SSR/híbrido caso Phoenix seja introduzido futuramente.
- **Substituída em 2026-08-17:** a direção inicial em marrom e branco com tipografia arredondada foi trocada por uma direção brutalista editorial, descrita abaixo. O marrom sobreviveu como marca, não como superfície.
- Adotar direção visual brutalista editorial: preto (`#0e0e0c`) sobre branco-quente (`#efede6`), bordas de 2px, zero raio de canto, hover que inverte em 60ms.
- **Substituída em 2026-08-17:** o marrom como cor de marca foi retirado. A interface passou a ser inteiramente monocromática e a única cor do site vive nas fotografias, que entram dessaturadas e ganham cor conforme sobem na tela.
- Não usar artefatos fingidos de publicação: numeração de edição, "Fig. N", data em numeral romano ou símbolo de marca registrada antes do registro existir.
- Adotar Archivo Expanded 900 como display e Martian Mono como texto corrido. Sem serifa em nenhum ponto do site.
- Adotar como marca o óculo do Panteão reduzido a selo, gerado por código e paramétrico por anéis e caixotões, em vez de um logotipo desenhado.
- Usar a tríade vitruviana — firmitas, utilitas, venustas — como critério público de análise de peças.
- Usar fotografia de material e construção com legenda técnica, em vez de lookbook; imagem funciona como prova, não como enfeite.
- Pretender hospedar o projeto em uma VPS da Hetzner; configuração, dimensionamento e operação continuam em aberto.

## Hipóteses atuais

- Faixa aproximada do ICP: 18 a 32 anos.
- “Amadurecer o streetwear” é uma tensão reconhecível para o público.
- “Workstreet” pode descrever o território estético.
- Um manual estruturado pode ser um primeiro produto editorial legítimo.
- Avaliações de caimento e tamanho podem criar dados proprietários valiosos.
- O recomendador pode ser gratuito e monetizado parcialmente por afiliados.

## Em aberto — marca

- Manifesto e frase principal.
- Identidade visual.
- Tom exato da voz editorial.
- Uso público ou apenas interno do termo “workstreet”.
- Disponibilidade jurídica, domínio e usuários sociais de **Allegorio**.

### Direção nominal aceita

- sonoridade greco-latina, portuguesa ou mediterrânea;
- aura esotérica, filosófica, simbólica ou mitológica;
- sensação de nome próprio ou nome de universo editorial;
- modernidade leve e tropicalidade brasileira;
- personalidade editorial;
- intervenção gráfica ou fonética sutil, sem parecer nome genérico ou imitação de grife estrangeira;
- capacidade de comportar mídia, tecnologia, curadoria e comércio.

O nome não precisa descrever moda literalmente. Agriffo, Paradiso, Eudamonia e Bossa foram referências de tom que conduziram à escolha de **Allegorio**.

### Estado da exploração

- **Allegorio:** nome atual escolhido, preservando a grafia com `ll`. A camada simbólica e editorial faz fit com a evolução do projeto; a terminação mais pesada foi considerada e aceita conscientemente pelo fundador.
- **Talhe:** estacionada como referência fonética e editorial. As derivações literais não funcionaram e não são mais a direção principal.
- **Urdia:** descartada por fonética. Não reconsiderar apenas por causa de sua boa narrativa etimológica.
- **B, T e L:** famílias fonéticas preferidas para a próxima rodada.
- **Bainha, Linhavo, Lapela, Recorte e Botina:** rodada rejeitada por ser literal, artesanal ou descritiva demais.
- **Nova busca:** nomes com imaginário próprio, musicalidade aberta e camada cultural/esotérica.

## Em aberto — editorial

- Primeiros conteúdos e ordem de publicação.
- Cadência sustentável.
- Equilíbrio entre fundamentos, aplicação, estilos e análises comerciais.
- Papel de perfumes na primeira fase.
- Formato visual definitivo dos vídeos.
- Política de fontes, testes e correções.

## Em aberto — MVP técnico

- Workflow de autoria sobre Nuxt Content.
- Taxonomia inicial.
- Busca e analytics.
- Provedor da newsletter.
- Estrutura de captura de e-mail.
- Necessidade ou não de comentários no começo.
- Configuração da VPS, deploy, backups e observabilidade.

## Em aberto — portões de evolução

- Período mínimo de consistência editorial.
- Tamanho e profundidade mínimos do acervo.
- Métricas de retorno e engajamento relevantes.
- Sinal que justifica cadastro de usuários.
- Densidade de catálogo necessária para recomendação.
- Evidência necessária antes de operar decants ou estoque de brechó.

## Próxima decisão recomendada

Definir o recorte editorial de lançamento:

1. qual transformação os primeiros conteúdos prometem;
2. quais conteúdos formam o percurso “Comece aqui”;
3. qual cadência cabe na rotina real;
4. qual formato de artigo pode ser repetido sem perder qualidade.
