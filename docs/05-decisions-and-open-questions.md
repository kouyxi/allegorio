# Decisões e questões em aberto

Atualizado em 2026-08-18.

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
- Não introduzir Phoenix, autenticação ou banco transacional no MVP editorial antes de existir uma necessidade concreta de estado durável, autorização, catálogo mutável ou jobs persistentes. O protótipo de acervo criado em 2026-08-18 constitui esse gatilho.
- **Substituída em 2026-08-18:** a decisão de reavaliar Phoenix como primeira opção no surgimento de estado durável foi trocada por Supabase no V1 do aplicativo, reduzindo a operação inicial. Phoenix continua como opção futura para lógica de domínio e jobs que justifiquem backend próprio.
- Preservar Nuxt como frontend SSR/híbrido caso Phoenix seja introduzido futuramente.
- **Substituída em 2026-08-17:** a direção inicial em marrom e branco com tipografia arredondada foi trocada por uma direção brutalista editorial, descrita abaixo. O marrom sobreviveu como marca, não como superfície.
- Adotar direção visual brutalista editorial: preto (`#0e0e0c`) sobre branco-quente (`#efede6`), bordas de 2px, zero raio de canto, hover que inverte em 60ms.
- **Substituída em 2026-08-17:** o marrom como cor de marca foi retirado. A interface passou a ser inteiramente monocromática e a única cor do site vive nas fotografias, que entram dessaturadas e ganham cor conforme sobem na tela.
- Não usar artefatos fingidos de publicação: numeração de edição, "Fig. N", data em numeral romano ou símbolo de marca registrada antes do registro existir.
- Adotar Archivo Expanded 900 como display e Martian Mono como texto corrido. Sem serifa em nenhum ponto do site.
- Adotar como marca o óculo do Panteão reduzido a selo, gerado por código e paramétrico por anéis e caixotões, em vez de um logotipo desenhado.
- Usar a tríade vitruviana — firmitas, utilitas, venustas — como critério público de análise de peças.
- Usar fotografia de material e construção com legenda técnica, em vez de lookbook; imagem funciona como prova, não como enfeite.
- Pretender hospedar a publicação editorial em uma VPS da Hetzner; configuração, dimensionamento e operação continuam em aberto. O aplicativo usa Cloudflare Workers.
- Iniciar conscientemente, em paralelo ao MVP editorial, um protótipo privado e mobile-first de acervo pessoal que reúne roupas e perfumes.
- Restringir o V1 do aplicativo a acervo próprio, lista de desejos, categorias customizáveis e recomendação contextual determinística. Comunidade, catálogo global, reviews públicos, scraping, afiliados e recomendação por IA ficam fora.
- Usar Nuxt 4 como PWA em `app/`, Cloudflare Workers para entrega e lógica HTTP, e Supabase para autenticação, Postgres e armazenamento de imagens.
- Manter nomes de categorias editáveis pelo usuário, vinculados a papéis semânticos estáveis usados pelo recomendador.
- Usar somente itens marcados como adquiridos nas recomendações. A lista de desejos serve para organização e análise de lacunas, não como se o usuário já possuísse a peça.
- Não usar conteúdo ou imagens do Fragrantica sem licença escrita. Priorizar fotografia do usuário e fontes com licença e atribuição registradas.

## Decidido — aplicativo (2026-08-19)

- Guardar fotografia da peça, com o caminho em `items.image_path` e os bytes no
  bucket privado `item-images` quando existe sessão, ou no IndexedDB do
  navegador quando não existe.
- Recortar o fundo da foto no próprio aparelho, com a U²-Netp em
  `onnxruntime-web`, e servir rede e runtime do domínio do aplicativo. Nenhum
  byte de foto sai do telefone e nenhum host de terceiro fica sabendo que o
  recorte aconteceu.
- Escolher a U²-Netp por licença antes de por qualidade: Apache-2.0 permite uso
  comercial, e RMBG e BiRefNet general-use, que recortam melhor, são não
  comerciais e criariam dívida de licenciamento quando o aplicativo deixasse de
  ser protótipo.
- Gravar o recorte em WebP com canal alfa, e não em PNG, com queda automática
  para PNG onde o navegador não codificar WebP.
- Não versionar os binários do recorte. `pnpm recorte` refaz os dois e o build
  chama o script; falha de download não derruba o build, só esconde a opção.
- Criar a página `/historico`, com as combinações registradas e as peças
  encostadas, sem transformá-la em aba: a navegação lateral continua com quatro
  destinos.
- Buscar a temperatura sozinha em `GET /api/clima`, usando a geolocalização
  aproximada que a borda da Cloudflare já tem, com coordenada arredondada para
  cerca de um quilômetro antes de chegar ao Open-Meteo e nada gravado. O GPS do
  aparelho só é consultado a pedido explícito.
- Adotar Open-Meteo como fonte de temperatura, com atribuição CC BY 4.0 visível
  na tela Hoje.
- Trocar o preset do Nitro de `cloudflare` para `cloudflare-module` com
  `deployConfig`, e montar as `vars` do Worker a partir do `.env` do build em
  vez de escrevê-las no `wrangler.jsonc` versionado.
- Oferecer entrada pelo Google além de e-mail e senha, com o Google em primeiro
  lugar na tela. Link mágico continua fora enquanto o envio de e-mail depender
  do SMTP de teste do Supabase.
- Desenhar o logotipo do Google monocromático, preservando a regra de que a
  única cor da interface vem da roupa e do frasco.
- Refazer a tela de entrada dentro de um cartão, com segmentado entre entrar e
  criar conta e botão de mostrar a senha.
- Retirar o piso de `min-width: 20rem` do `body`. Ele obrigava o documento a
  320px e fazia o conteúdo sair pela esquerda em tela menor, sem barra de
  rolagem que denunciasse o motivo.
- Declarar `touch-action` explicitamente em `.shell__drag` (`pan-y`) e em
  `[data-hscroll]` (`pan-x pan-y`), porque a ausência da propriedade era por
  que o gesto lateral não funcionava em celular: o navegador decidia sozinho
  que o toque era rolagem antes do primeiro `pointermove`.
- Neutralizar `-webkit-tap-highlight-color` e `-webkit-touch-callout` em todo
  `a` e `button`, e não só em `button`. A barra de abas é feita de `NuxtLink`,
  que ficava de fora da correção anterior.
- Trocar o service worker de `registerType: 'prompt'` para `'autoUpdate'`. Sem
  interface de aviso implementada, `prompt` deixava a versão antiga no ar para
  sempre, o que provavelmente explicava sessão sem login e acervo de
  demonstração num celular depois de um deploy que corrigiu as chaves do
  Supabase.
- Usar `profiles.display_name`, que já existia no esquema sem escrita nenhuma,
  para um nome de exibição editável em Ajustes e usado na saudação da tela de
  hoje.

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

## Decidido — identidade visual (2026-08-18)

O sistema visual passou a usar a gramática da ficha técnica de confecção em
vez do vocabulário editorial genérico. Cinco decisões, detalhadas em
`docs/08-visual-identity.md`:

1. o selo virou sistema paramétrico, com anéis e caixotões derivados por hash
   determinístico do caminho do artigo;
2. existe uma notação única da casa, com ordem de campo fixa para material e
   para artigo;
3. toda régua horizontal é linha de corte com margem de costura pontilhada e
   piquetes nas pontas;
4. a canhota do documento é uma fita métrica que corre toda página;
5. as peças aparecem em desenho técnico gerado por código, como figura do
   artigo que discute construção.

No mesmo dia foram retiradas duas peças da primeira versão: a seção de prancha
na home, com seletor de peça e chamadas numeradas, e o rodapé que usava os
símbolos da norma de conservação para apresentar as políticas editoriais. As
duas viravam vitrine e enfraqueciam o registro sério que a publicação precisa
ter. As políticas passaram para uma seção de texto chamada "Política
editorial".

Junto disso ficou registrada a norma de fotografia própria (macro de trama,
luz lateral rasante, fundo tomado pelo tecido, sem filtro), que substitui o
acervo Creative Commons quando houver peça na mão.

## Em aberto — aplicativo

- Se o recorte de fundo justifica os dezoito megabytes de primeira carga depois
  de uso real, ou se a foto inteira já resolve o problema de distinguir peças
  parecidas.
- Se as fotografias devem entrar no arquivo de backup, o que resolveria a
  restauração em aparelho novo e multiplicaria o tamanho do arquivo.
- Como limpar imagens órfãs no bucket depois de uma restauração de backup.
- Se o histórico deve virar aba quando tiver mais que registro e peças
  encostadas.
- Se a tela de entrada precisa de recuperação de senha, ou se o Google já cobre
  o caso na prática.
- Se vale trocar o fluxo OAuth de implícito para PKCE, que tira o token da URL
  em troca de mexer também no link de confirmação de e-mail.

## Em aberto — identidade visual

- Trocar Martian Mono por um grotesco no texto corrido dos artigos. Aumentaria
  a distinção e a legibilidade em texto longo, contraria a regra tipográfica
  registrada e exige refazer o ajuste de tamanhos. Testar em branch.
- Quando a produção fotográfica própria começa, e com qual peça.
- Se as fichas de material dos artigos passam a exigir peça aferida antes de
  publicar.
- Ampliar o repertório de desenhos técnicos além das quatro peças atuais.

## Decisão — persistência do aplicativo

Registrada em 2026-08-19. O fundador pediu permanência e backup, e nenhum
armazenamento de navegador entrega isso.

**Supabase confirmado como fonte de verdade.** Duas alternativas foram
consideradas e descartadas com motivo:

- **SQLite no navegador** (`wa-sqlite`, `sql.js`) grava dentro de OPFS ou
  IndexedDB, então herda a mesma fragilidade de despejo e não ganha durabilidade
  nenhuma. Resolve o modelo de consulta, não o problema pedido.
- **Cloudflare D1** é SQLite servido, na mesma plataforma do deploy, e chegou
  perto. Ficou de fora porque não traz autenticação nem armazenamento de
  arquivo: seria login escrito à mão mais R2 para as fotos. O Supabase entrega
  Postgres, Auth e Storage juntos, e o esquema já estava escrito para Postgres
  com RLS.

Ressalvas que precisam ficar registradas: no plano gratuito o Supabase pausa
projeto inativo e não oferece recuperação em ponto no tempo. Por isso o arquivo
de backup exportável continua no produto. Ele é a cópia que é do usuário, não do
provedor.

Camadas e o que cada uma resolve:

| Camada | Resolve |
| --- | --- |
| Supabase | permanência, backup do provedor, vários aparelhos, outras pessoas |
| Arquivo exportado | cópia própria, independente de conta e de plano |
| Cache local | primeira pintura instantânea e leitura offline |

Ordem de trabalho acordada: esquema reconciliado, editar item e backup primeiro,
porque nenhum dos três depende de conta; autenticação, sincronização e upload de
foto entram quando o projeto Supabase existir.

## Decisão — dialeto visual do aplicativo

Registrada em 2026-08-18.

A primeira versão do aplicativo tentou aplicar o sistema da publicação numa
interface de toque e ficou entre dois lugares: serifa no display, acento verde
neon, corpo em 14px e alvos de toque abaixo do mínimo. Foi refeita do zero.

O aplicativo passa a ser um **dialeto** da publicação, não outra marca. O que
continua idêntico:

- sem serifa em lugar nenhum, Archivo no display e Martian Mono nas etiquetas;
- interface monocromática, com `--signal` apontando para a tinta caso a decisão
  mude;
- desenho técnico gerado por código, com os mesmos três pesos de traço, portado
  de `web/app/components/FlatTecnico.vue`.

O que muda, e só vale dentro de `app/`:

| Publicação | Aplicativo | Motivo |
| --- | --- | --- |
| zero raio de canto | raio de 10px a 36px | superfície de toque, não de leitura |
| borda única de 2px | profundidade por sombra em três camadas | separar cartões sem fatiar a tela em molduras |
| transições de 60ms | 160ms a 420ms, com curvas de mola | 60ms some no dedo; o toque precisa de resposta acompanhável |
| papel escuro no protótipo | papel claro `#f3f0e9` | roupa se compara por cor, e cor se compara sobre neutro claro |

A cor continua vindo só do acervo. O campo de cada peça é tingido pela cor
registrada pelo usuário e o traço do desenho é a mesma cor escurecida, o que
faz a grade funcionar como uma paleta do guarda-roupa.

Em 2026-08-18 o aplicativo trocou de tipografia por inteiro, em duas rodadas.

Primeiro caiu a etiqueta em Martian Mono. Depois caiu o Archivo: em corpo grande
ele empilha, porque tem altura de x grande e desenho estreito, e com entrelinha
apertada o bloco de manchete virava parede. Abrir o eixo de largura não resolveu,
o que mostrou que a causa era o desenho da letra e não o ajuste.

A escolha foi feita sobre a tela real, com seis candidatas e a largura de cada
uma medida no navegador. O par que ficou:

| Papel | Face | Por quê |
| --- | --- | --- |
| Display | Bricolage Grotesque, `wdth` 100 | proporção horizontal, desenho com caráter próprio e `opsz` automático |
| Interface | Onest | humanista aberta, legível em etiqueta de 11px, eixo de peso de 100 a 900 |
| Algarismo | Martian Mono | única vantagem real do monoespaçado aqui é alinhar dígito |

Instrument Sans foi descartada por ser a mais estreita das candidatas de texto, o
que contrariava a própria queixa, e por travar o peso em 700, o que quebraria
metade da hierarquia. Wix Madefor Text ficou neutra demais ao lado do Bricolage.

**Consequência que precisa ficar registrada:** o aplicativo não compartilha mais
nenhuma fonte com a publicação. O parentesco entre os dois passa a vir só de três
coisas: a monocromia, o desenho técnico gerado por código e a notação de ficha com
ordem de campo fixa. Se alguém achar isso pouco, a conversa é sobre trazer o
Bricolage para a publicação, não sobre devolver o Archivo ao aplicativo.

O texto abaixo registra a primeira rodada, que continua valendo.

Em 2026-08-18, depois de ver a interface montada, o fundador reprovou a
tipografia utilitária. Martian Mono em 11px caixa-alta é apertado e frio para
etiqueta de interface, e ele aparecia em toda parte: contagem de itens, papel da
peça, nome da marca no cartão. A regra do aplicativo passa a ser:

- **palavra é Archivo**, inclusive a etiqueta miúda, em caixa-alta com 0,055em de
  entreletra;
- **algarismo é Martian Mono**, porque a única vantagem real do mono aqui é
  alinhar dígito: preço, contagem, posição no baralho.

Isso diverge da regra do `CLAUDE.md` que diz "texto é Martian Mono", mas é
exatamente a troca que `docs/08-visual-identity.md` já registrava como decisão em
aberto. Vale só dentro de `app/`; a publicação continua como está até que alguém
teste a mesma troca lá.

A tela do aplicativo também perdeu o cabeçalho. Barra de topo com marca e dois
botões custava 3,5rem de altura em toda página para repetir uma informação que o
ícone na tela inicial já dá, e os dois atalhos que ela carregava viraram coisa
melhor: o de adicionar virou botão central da barra inferior, e o de desejos
virou aba própria com rota de verdade. A barra inferior tem cinco fatias, com o
botão de adicionar no meio, e ele não entra na sequência do gesto lateral porque
é ação e não destino.

O aplicativo tem conjunto de ícones próprio (`AppIcon.vue`), que a publicação não
tem e não precisa. São glifos de traço em caixa de 24, com o peso compensado nos
tamanhos pequenos. Eles não são desenho técnico: abaixo de 24px os três pesos de
traço da ficha viram borrão, então a ficha continua reservada para os tamanhos em
que ela se lê.

Quatro peças novas foram escritas na gramática da ficha para cobrir o que a
publicação ainda não desenha: tênis em vista lateral, frasco, camiseta e
etiqueta.

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
