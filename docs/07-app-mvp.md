# MVP do aplicativo

## Objetivo

Testar se organizar roupas e perfumes no mesmo acervo ajuda uma pessoa a decidir
o que usar em uma situação concreta. O aplicativo começa como utilidade pessoal
mobile-first e não como rede social, catálogo público ou mecanismo de compras.

## Promessa do V1

O usuário registra o que possui, mantém uma lista do que considera comprar e
recebe uma combinação de roupa + perfume para um contexto como dia a dia,
trabalho, encontro ou evento.

```text
situação + clima + acervo adquirido
                 ↓
      roupa completa + perfume
                 ↓
       guardar, trocar ou usar
```

## Funções incluídas

- cadastrar roupa ou perfume manualmente;
- separar itens adquiridos e lista de desejos;
- editar nome, categoria, descrição, preço e link de origem;
- filtrar o acervo por tipo, categoria, texto e preço;
- criar e renomear categorias;
- vincular cada categoria a um papel estável na combinação;
- pedir recomendação por situação e clima;
- gerar apenas com itens adquiridos;
- guardar uma combinação;
- registrar feedback para melhorar pesos futuros;
- fotografar a peça pela câmera traseira ou escolher da galeria e guardar a foto
  com o fundo recortado;
- cadastrar roupa rapidamente com foto e categoria, deixando os detalhes para
  uma edição posterior;
- preencher perfume por código de barras quando houver registro no Open Beauty
  Facts;
- consultar o histórico de combinações e as peças encostadas;
- receber a temperatura de agora sem apertar nada;
- instalar a interface como PWA.

Autenticação, sincronização e armazenamento de foto funcionam quando existe
projeto Supabase configurado. Sem ele o aplicativo continua utilizável: o acervo
vai para o `localStorage` e as fotos para o IndexedDB do próprio navegador.

## Modelo de categoria

O nome visível é customizável. O recomendador trabalha com um papel semântico
estável:

| Nome possível | Papel interno |
| --- | --- |
| Camisetas, camisas | `top` |
| Calças, bermudas | `bottom` |
| Overshirts, jaquetas | `outer_layer` |
| Tênis, botas, mocassins | `footwear` |
| Relógios, bolsas | `accessory` |
| Macacão | `one_piece` |
| Perfumes, decants | `scent` |

Descrição continua livre e não governa o recomendador no V1.

## Recomendador inicial

O motor é determinístico. Ele filtra itens adquiridos, monta os papéis exigidos
pelo contexto e pontua candidatos por ocasião, clima, formalidade e recência de
uso. Perfumes também consideram projeção. A resposta explica os critérios e
informa quando falta uma categoria no acervo.

IA não escolhe as peças no V1. Uma interpretação de pedidos em linguagem livre
pode ser adicionada depois como entrada para os mesmos filtros estruturados.

## Lista de desejos e preços

O filtro de preço opera sobre itens salvos pelo próprio usuário. Busca global de
produto, comparação automática de loja, alerta de preço e afiliados exigem feeds
comerciais e política de atualização, portanto ficam fora desta fase.

## Imagens e catálogo externo

Prioridade de origem:

1. fotografia enviada pelo usuário;
2. imagem licenciada por fabricante, loja ou programa de afiliados;
3. fonte aberta cuja licença e atribuição sejam registradas.

Não raspar Fragrantica, Parfumo, varejistas ou endpoints internos. Todo arquivo
externo deve registrar provedor, URL original, licença e atribuição.

O preenchimento de perfume por código de barras consulta o Open Beauty Facts.
Dados importados registram ODbL 1.0; a fotografia, quando existe, registra CC
BY-SA e atribuição aos contribuidores do projeto. A imagem passa por um endpoint
do próprio aplicativo antes de entrar no depósito privado, então o navegador do
usuário não consulta o host de imagens durante a importação. Ausência no catálogo
ou indisponibilidade da rede sempre volta para o formulário manual.

### Fotografia da peça

A foto existe para resolver um problema estreito e concreto: duas camisetas
pretas produzem o mesmo desenho técnico e a mesma amostra de cor, então o
acervo mistura peças que a pessoa distingue de olho fechado. Por isso a imagem
aparece na linha do look, na grade do acervo e no histórico, e não só numa
página de detalhe.

O caminho do arquivo fica em `items.image_path`. Com sessão, os bytes vão para o
bucket privado `item-images`, sob a pasta do próprio usuário, e a exibição usa
URL assinada de uma hora. Sem sessão, vão para o IndexedDB. `localStorage` não
serve: ele guarda texto, o que obrigaria base64 dentro de uma cota de cinco
megabytes compartilhada com o acervo inteiro.

O recorte de fundo roda no aparelho, com a U²-Netp em `onnxruntime-web`. Rede e
runtime somam cerca de dezoito megabytes e são baixados só quando alguém pede
recorte pela primeira vez; depois ficam no cache do navegador. Os dois arquivos
são servidos pelo próprio domínio, e não por CDN de terceiro, porque uma foto de
acervo privado não deveria depender de host externo nem informá-lo de que o
pedido existiu.

A U²-Netp foi escolhida por licença antes de por qualidade. Ela é Apache-2.0, o
que permite uso comercial. RMBG e BiRefNet general-use recortam melhor e são não
comerciais, o que criaria uma dívida de licenciamento no dia em que o aplicativo
deixasse de ser protótipo.

O recorte falha para o lado seguro. Máscara que cobre quase nada ou quase tudo
significa que a rede não achou peça, e nesse caso a foto inteira é guardada com
um aviso na tela. Perder o fundo é cosmético; perder a foto é perder o que
distingue as duas camisetas.

O arquivo final sai em WebP com canal alfa, e não em PNG. O resultado é o mesmo
recorte sobre transparência, com peso perto de um décimo. Quando o navegador não
codifica WebP, a saída volta para PNG sozinha, e o `type` do blob é conferido em
vez de suposto.

Os binários não entram no repositório. `pnpm recorte` refaz os dois, e o build
chama o script antes do Nuxt. Se o download falhar, o build segue e o aplicativo
esconde a opção de recorte.

Fotografia não entra no arquivo de backup. Ele guarda a ficha e o caminho da
imagem, não os bytes. Restaurar num aparelho novo devolve o acervo com o desenho
técnico no lugar das fotos.

O campo oferece duas ações distintas. "Tirar foto" usa o seletor nativo com a
câmera traseira solicitada por `capture="environment"`; "Escolher da galeria"
mantém o seletor de arquivo comum. Os dois entregam o mesmo `Blob` ao recorte e
ao armazenamento. Quando o recorte produz transparência, a cor dominante da
peça vira uma sugestão inicial de cor, ainda ajustável na ficha.

## Fora do V1

- reviews e perfis públicos;
- feed, seguidores e comentários;
- catálogo global de roupas ou perfumes;
- scraping e APIs não autorizadas;
- recomendação baseada em comissão;
- checkout, afiliados e alerta de preço;
- reconhecimento automático de imagem;
- geração de looks por IA;
- operação de decants ou estoque.

## Interface

Redesenhada do zero em 2026-08-18. A regra de arquitetura da tela é que o valor
chega antes da pergunta: a home abre com o look já montado, usando o dia da
semana como palpite de situação. A versão anterior pedia três decisões em
sequência antes de mostrar qualquer coisa, o que contraria a promessa de não
ter que decidir.

Em 2026-08-19 o seletor de situação subiu para logo abaixo do cabeçalho, antes
do baralho. A ideia original mandava rolar a tela inteira para trocar de
ocasião, o que inverte a ordem certa: escolher entre dia a dia, trabalho,
encontro ou evento é o que decide o look inteiro, então precede a sugestão. O
clima continua abaixo, na seção "Ajustar", porque hoje ele é automático e
raramente pede intervenção.

Decisões de interação que sustentam isso:

- **as margens saem das diretrizes de plataforma, não de gosto.** Lateral de 24px,
  que é o valor confortável do Material 3 (16dp ou 24dp em telefone) e o topo da
  faixa que o HIG da Apple usa. Topo de 40px abaixo da área segura, porque sem
  barra de cabeçalho o título encostaria na barra de status: nas duas diretrizes
  o bloco de título grande tem folga própria, 96pt no iOS e 152dp no Material;
- o **cartão do look é quase quadrado**, e isso é resultado de duas decisões. Cada
  peça ocupa duas linhas em vez de três, com papel e motivo dividindo a linha
  miúda, e o bloco de motivos saiu de dentro do cartão para o pé do baralho,
  porque ele descreve a sugestão inteira e era o que fazia o cartão crescer para
  baixo sem necessidade. A linha miúda usa rótulo curto de papel (`Cima`,
  `3ª peça`), com o nome completo preservado no rótulo de acessibilidade;
- não existe cabeçalho. A navegação inteira mora numa barra flutuante embaixo,
  com cinco fatias: `Hoje · Acervo · (+) · Desejos · Ajustes`. O botão central é
  ação e não destino, então ele fica fora da sequência do gesto lateral e vira X
  na própria tela de cadastro;
- a sugestão é um **baralho horizontal**: três combinações já montadas, trocadas
  por gesto lateral em vez de botão e espera. Eram cinco até 2026-08-19; a
  partir do quarto cartão comparar vira ruído e ninguém pesa cinco opções antes
  de decidir o que vestir. O baralho nunca repete: as combinações saem de um
  odômetro de raiz mista sobre as opções de cada papel, então o primeiro cartão
  é sempre o melhor e cada cartão seguinte troca uma peça ou duas. Com acervo
  pequeno o baralho encolhe em vez de fingir variedade;
- **deslizar na horizontal troca de seção**, com o conteúdo acompanhando o dedo
  e resistindo nas bordas. O eixo do gesto é decidido nos primeiros pixels e
  qualquer rolagem horizontal marcada com `data-hscroll` tem prioridade, para
  que o baralho e as fileiras de chips não sejam roubados pela navegação. A
  transição de página segue a direção do gesto;

- cada papel do look troca sozinho, sem refazer a combinação inteira, e a peça
  escolhida à mão fica fixada até a situação ou o clima mudarem;
- a nota de cada linha mostra o critério que distingue aquela peça. O que vale
  para o look todo saía das linhas e subia para um bloco "Por quê" abaixo do
  baralho; ele saiu de cena em 2026-08-19 por não parecer útil no uso real.
  `buildLook` continua calculando `reasons` (é testado e outras telas podem
  usar), só não há mais nenhuma tela renderizando;
- "Usei hoje" grava a data de uso nas peças, que é o dado que o recomendador já
  lê para dar a vez a quem está parado. Usar o aplicativo melhora a próxima
  sugestão. É desfazível: o botão de desfazer aparece ao lado assim que o uso é
  registrado, e devolve cada peça ao estado exato de antes, não a "nunca usada"
  genérico, porque a peça pode já ter uso de dias anteriores;
- o formulário de cadastro pede formalidade, clima e situação, porque são os
  três campos que o motor consulta. Sem eles todo item entra com o mesmo peso;
- roupa nova começa num cadastro rápido: foto, categoria e nome opcional. A
  categoria define nome, formalidade, clima e situações iniciais, e o bloco de
  detalhes permite corrigir marca, cor, tamanho, material e uso antes ou depois
  de salvar. Perfume continua abrindo a ficha completa porque concentração,
  volume e projeção não podem ser inferidos só pela categoria;
- abaixo de mais ou menos 48px a peça aparece como amostra de cor sólida, acima
  disso como desenho técnico. Cor é o que se lê no tamanho pequeno, construção é
  o que se lê no grande. Havendo fotografia, ela ocupa o lugar dos dois, contida
  sobre o campo de cor quando é recorte e cobrindo o quadro quando tem fundo;
- **a temperatura chega sozinha.** O clima era um seletor que a pessoa apertava
  toda manhã, o que contraria a promessa de não ter que decidir nada para receber
  a sugestão. Agora a tela abre com a leitura de agora e o seletor continua ali,
  ganhando do automático quando alguém discorda dele. Discordar desliga o
  automático até a próxima sessão. Até 2026-08-19 a única diferença visual entre
  automático e manual era um tom de cinza a mais, pouco para perceber de relance.
  O indicador agora muda de verdade: automático mostra um gradiente por faixa de
  temperatura (calor, ameno, frio), a única cor fora de fotografia que a
  interface admite, porque ali a cor é a leitura real do clima. Manual apaga o
  gradiente e fecha em preto sólido, porque naquele estado o valor deixou de ser
  uma leitura de verdade. A primeira paleta ia para pêssego-claro no calor, e
  lia como suco de laranja em vez de temperatura; revisada no mesmo dia para
  coral mais saturado e um ameno que saiu do cinza-azulado neutro para
  verde-água, com identidade própria em vez de ser "nem calor nem frio" por
  eliminação;
- **a conta aparece primeiro em Ajustes**, antes das categorias, porque é a
  primeira coisa que alguém quer conferir ao abrir a tela, e um acervo com
  muitas categorias fazia rolar bastante para chegar até ela lá embaixo. A
  conta mostra nickname e e-mail, oferece logout e concentra a edição do
  nickname: a tela Hoje não interrompe mais a chegada para pedir esse dado.

## Gesto lateral e toque, corrigidos em 2026-08-19

Duas coisas quebravam a ergonomia de toque e nenhuma delas era bug de lógica:
eram propriedades de CSS que faltavam.

O gesto lateral de trocar de seção não funcionava em celular porque nenhum
elemento declarava `touch-action`. Sem essa propriedade, o navegador decide
sozinho se o toque é rolagem antes do primeiro `pointermove` e pode cancelar a
sequência de ponteiro no meio do gesto — o `useSwipeNav` nunca chegava a travar
o eixo. `.shell__drag` agora tem `touch-action: pan-y`, que deixa a rolagem
vertical em pé e devolve o eixo horizontal para o JavaScript; dentro de
`[data-hscroll]` vale o oposto, porque o baralho e as fileiras de chips rolam
sozinhos e precisam do toque livre nos dois eixos.

O flash azul ao tocar e o menu ao segurar vinham de `-webkit-tap-highlight-color`
e da ausência de `-webkit-touch-callout: none` em `a`: a barra de abas inteira é
feita de `NuxtLink`, e sem essas duas propriedades todo toque nela desenhava o
retângulo padrão do navegador e todo toque prolongado abria o menu de "abrir em
nova aba". Os dois entraram no reset, cobrindo link e botão de uma vez.

## Service worker, corrigido em 2026-08-19

`registerType` estava em `prompt`, que só troca de versão quando algum
componente chama `updateServiceWorker()` do módulo virtual — e nenhum chamava.
Na prática isso deixava o service worker antigo no ar para sempre: ele notava
que existia build novo e ficava esperando um sinal que nunca vinha. É a
explicação mais provável para um celular mostrar sessão sem exigir login e
acervo de demonstração depois do deploy que corrigiu as chaves do Supabase — o
aparelho continuou servindo o pacote antigo, gravado com as chaves vazias, de
uma visita anterior à correção. `registerType: 'autoUpdate'` troca sozinho
assim que percebe build novo.

## Histórico

Cada "Usei hoje" gravava uma combinação e carimbava a data nas peças, e nenhuma
tela mostrava nada disso. A página `/historico` fecha o ciclo com as
combinações agrupadas por dia, o que foi usado e o que foi só guardado, e a
opção de montar de novo, que devolve situação, clima e peças fixadas para a tela
Hoje.

No pé da página ficam as peças encostadas, ordenadas pelo tempo desde o último
registro. É o outro lado da penalidade de recência que o recomendador já
aplicava sem explicar, e é o que permite decidir se uma peça ainda merece espaço
no armário.

O histórico não é aba. A navegação lateral continua com quatro destinos, e uma
quinta fatia estragaria a grade da barra e o gesto. Chega-se a ele pela tela Hoje
e pelo bloco de backup em Ajustes.

## Clima

`GET /api/clima` devolve a sensação térmica de agora e a faixa correspondente.
A localização sai da própria borda da Cloudflare, que já conhece a cidade
aproximada de quem fez o pedido: é de graça, não pede permissão e não acorda o
GPS. Quando alguém quer precisão, a tela manda `lat` e `lon` do navegador e
esses valores ganham do palpite da borda.

A coordenada é arredondada para duas casas, cerca de um quilômetro, antes de sair
do Worker. O Open-Meteo não precisa de mais que isso para dizer a temperatura.
Nada é gravado, nem no banco nem em log: a resposta é calculada e esquecida. No
navegador fica meia hora de cache, para abrir o aplicativo três vezes numa manhã
não render três pedidos.

Os cortes entre calor, ameno e frio são de vestir e não de meteorologia: acima
de 25 a terceira peça atrapalha, abaixo de 17 ela deixa de ser opcional. O número
usado é a sensação térmica, porque é ela que decide se a pessoa vai suar dentro
da jaqueta.

A fonte é o Open-Meteo, sob CC BY 4.0, e a atribuição aparece na tela Hoje.

## Esquema

`supabase/migrations/202608180001_initial.sql` foi reescrito em 2026-08-19 para
bater com `app/app/types/domain.ts`. A versão anterior tinha sido escrita antes
da interface existir e divergia em pontos que só apareceriam na primeira
sincronização: faixa de formalidade de 0 a 4 contra 1 a 3, `ownership` com um
estado `archived` que o aplicativo não conhece, coluna de contagem de uso
ausente, e três tabelas sem nenhum código que escrevesse nelas.

A regra adotada é que o esquema descreve o que o aplicativo faz hoje. Tabela que
ninguém escreve entra quando existir a tela que escreve nela. Por isso saíram
`wear_logs`, `recommendation_requests` e `recommendation_feedback`: a recência
que o recomendador consulta já vive em `items.last_worn_at` e `items.wear_count`,
que a ação "Usei hoje" escreve de verdade. O registro de feedback volta quando
houver tela que o produza.

Ficaram as colunas de procedência de imagem (`source_provider`, `source_license`,
`source_attribution`) mesmo sem uso, porque a política de imagens deste documento
exige que todo arquivo de terceiro registre origem, licença e atribuição.

Em 2026-08-19 entrou `items.image_cutout`, que diz se o arquivo tem canal alfa.
A exibição depende disso: recorte aparece contido sobre o campo de cor, foto
inteira aparece cobrindo o quadro. Sem a coluna, a única alternativa seria
adivinhar pelo formato do arquivo, que não é a mesma informação.

## Backup

Enquanto a sincronização não existir, o arquivo exportável em Ajustes é a única
durabilidade real. O formato é o mesmo contrato que a importação para o Postgres
vai consumir, então exportar hoje também funciona como ensaio da migração.

A importação substitui, não mescla: restaurar backup é voltar a um estado, e não
somar dois acervos. O arquivo é recusado antes de tocar no acervo quando não é
JSON, quando não declara o formato, quando a versão não é conhecida ou quando um
item aponta para categoria que não está no arquivo.

## Autenticação e dados

Dois caminhos de entrada: Google e e-mail com senha.

O Google vem primeiro na tela porque é o caminho em que ninguém digita nada, e
porque resolve sozinho o problema de senha esquecida, que hoje não tem tela de
recuperação. A volta do Google traz a sessão na própria URL, lida pelo
`detectSessionInUrl` do cliente, então o aplicativo não precisa de rota de
retorno. O endereço de redirecionamento sai de `window.location.origin`, e não
de uma constante, senão desenvolvimento e produção exigiriam builds diferentes.

Ligar o provedor é trabalho de painel e não de código. No Supabase, em
Authentication, o provedor Google precisa do client ID e do secret vindos do
Google Cloud Console, e a origem do aplicativo precisa estar na lista de
redirecionamentos permitidos. Enquanto isso não existir, o botão aparece e o
erro é traduzido para dizer o que falta, em vez de repetir o texto cru do
serviço.

Os dois campos de URL Configuration não querem a mesma coisa, e confundi-los
custa caro em momentos diferentes:

- **Site URL** é o destino padrão e é o que entra nos links de confirmação de
  e-mail e de recuperação de senha. Deixá-lo em `localhost` faz o e-mail enviado
  a outra pessoa apontar para o computador dela. Ele precisa ser o endereço de
  produção assim que existir um.
- **Redirect URLs** é lista de permissão, e aí `localhost` faz sentido e é
  necessário: sem ele o Google não volta para o ambiente de desenvolvimento. O
  padrão precisa ser `http://localhost:<porta>/**`, com a porta real do
  `pnpm dev`. O `**` não é enfeite: a barra final conta no casamento, e
  `signInWithGoogle` manda `window.location.origin` com barra no fim.

Produção e desenvolvimento convivem na lista ao mesmo tempo. Como o `redirectTo`
sai de `window.location.origin` e não de constante, trocar de domínio mexe só na
lista do painel, nunca no build.

Link mágico continua de fora. O SMTP embutido do Supabase é limitado a poucos
envios por hora e o próprio serviço avisa que serve para teste, então falharia
justamente no momento em que a pessoa precisa entrar. Ele volta a ser opção
quando houver provedor de e-mail próprio.

A tela de entrada foi refeita em 2026-08-19. A versão anterior era um formulário
solto no meio da tela, sem a física de cartão que o resto do aplicativo tem, e
com a alternância entre entrar e criar conta escondida num link no rodapé. Agora
o formulário mora num cartão, a alternância usa o mesmo segmentado do resto do
aplicativo e o campo de senha tem botão de mostrar, que é o que evita a terceira
tentativa errada em teclado de telefone.

### Nickname do perfil

`profiles.display_name` existia no esquema desde a migração inicial e nada
escrevia nela. Em Ajustes, com sessão remota, dá para definir, trocar ou remover
o nickname que a tela de hoje usa para cumprimentar ("Oi, {primeiro nome}") na
mesma linha do dia da semana. O cartão também identifica o e-mail conectado e
oferece logout. Sem sessão remota ele não aparece: o modo local não tem conta,
só um acervo no aparelho, e nickname sem conta para guardar não tem onde morar.

O logotipo do Google aparece monocromático. A marca oficial é quadricolor e a
interface deste aplicativo só admite cor vinda da roupa ou do frasco. Recolorir
é desvio pequeno de guia de marca de terceiro; furar a monocromia seria desvio
grande do sistema da casa, e a forma do glifo já carrega o reconhecimento.

O estado do acervo vive num store único (`useStore`). `useCollection` e
`useOutfits` são recortes dele, e não estados paralelos: com dois donos do mesmo
dado, salvar uma combinação e marcar a peça como usada acabariam divergindo.

Atrás do store há uma interface de persistência com duas implementações. Com
sessão, escreve no Supabase. Sem projeto configurado, escreve no armazenamento
local, o que mantém o protótipo utilizável para quem clona o repositório sem
conta própria.

A escrita é otimista: a tela muda na hora e a gravação vai atrás. Se falhar, o
estado volta do servidor e um aviso aparece acima da barra de abas. Gravação
otimista que falha em silêncio significa a pessoa achar que salvou.

Acervo com zero categorias não é estado alcançável: ao carregar, se o servidor
devolver nenhuma, o store semeia as sete padrão de novo. Sem categoria não dá
para cadastrar nada, então deixar a pessoa nesse buraco seria pior que a
semeadura repetida. Isso vale inclusive depois de restaurar um backup vazio.

O identificador é gerado no cliente. O Postgres aceita id explícito, e com isso a
escrita otimista não precisa reconciliar identificador depois da resposta.

## Testes

`pnpm test` roda a suíte em `app/test/`. A cobertura é deliberadamente estreita e
mira o que quebra em silêncio:

- **recomendador**: o odômetro que gera o baralho, a fixação de peça, o papel que
  falta, a penalidade de recência e a supressão de nota repetida;
- **mapeamento**: ida e volta entre linha e domínio, coerção de `numeric` que
  volta como string, e o zeramento dos campos de perfume numa roupa, que a
  restrição do banco rejeitaria;
- **persistência**: os payloads enviados ao Supabase, com cliente falso. Prova
  nome de tabela, carimbo de `user_id`, gravação em lote e a ordem de exclusão
  que a chave estrangeira exige, sem tocar num projeto real;
- **backup**: as recusas de arquivo inválido, que são o que impede uma
  importação errada de apagar o acervo;
- **recorte**: a preparação do tensor, a normalização da máscara, a caixa da peça
  e a medida de cobertura, que é o número usado para decidir entre guardar o
  recorte e guardar a foto inteira;
- **clima**: os cortes entre as três faixas, inclusive nos limites;
- **cadastro rápido**: os padrões por categoria e a queda para o papel semântico
  em categorias personalizadas;
- **perfume**: normalização de GTIN, volume, concentração e procedência do
  registro importado;
- **imagem**: a escolha da cor dominante ignora a área transparente do recorte;
- **autenticação**: a tradução de erro do Supabase, inclusive o casamento por
  trecho que transforma "provider is not enabled" em instrução de painel.

## Entrega

O preset do Nitro era `cloudflare`, que é apelido do formato antigo, em service
worker, servindo estáticos por Workers Sites. O `wrangler.jsonc` descrevia a
outra coisa, com `main` e `assets`: o build saía num formato e o deploy esperava
outro. Agora o preset é `cloudflare-module`, com `deployConfig` ligado. Nesse
modo o Nitro lê o `wrangler.jsonc` da raiz, junta `main` e `assets` calculados
por ele e grava o resultado em `.output/server/wrangler.json`, que é o que um
`wrangler deploy` sem argumento passa a usar.

As chaves do Supabase precisam existir em dois momentos: no build, porque o valor
entra no bundle do navegador, e em execução, porque o Worker também renderiza no
servidor. Elas são montadas em `nuxt.config.ts` a partir do `.env` do build e
entram na configuração gerada. Escrever `vars` vazias no `wrangler.jsonc` seria
pior que não escrever nada: o Nitro aplica variável de ambiente definida por cima
da configuração do build, então `""` apagaria o valor embutido e o aplicativo
cairia no modo local sem avisar quem já tinha conta.

A chave publicável é pública por natureza. Ela viaja no JavaScript de toda página
e quem protege o dado é a RLS do Postgres. Uma `service_role` nunca pode entrar
em nenhum dos dois lugares.

## Stack

- Nuxt 4 e TypeScript;
- PWA com `@vite-pwa/nuxt`;
- Cloudflare Workers para deploy e endpoints do produto;
- Supabase Auth, Postgres e Storage;
- `onnxruntime-web` com a U²-Netp para o recorte de fundo no aparelho;
- Open-Meteo para a temperatura;
- Open Beauty Facts para preenchimento opcional de perfume por código de barras;
- Row Level Security em toda tabela com dados do usuário.

O protótipo local vive em `app/`. A publicação continua em `web/`.
