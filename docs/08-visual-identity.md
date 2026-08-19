# Identidade visual — gramática de ficha técnica

Decidido em 2026-08-18. Este documento é a fonte de verdade do que faz a
Allegorio parecer a Allegorio, em vez de parecer mais um site editorial bem
executado.

## O problema que este sistema resolve

A primeira versão do site aplicava bem um gênero: papel quente, Archivo
Expanded no display, mono no corpo, fio de 2px, sem raio de canto, revelação
no scroll. O conjunto é competente e circula em portfólio de estúdio desde
2023, o que significa que um leitor reconhecia a família antes de reconhecer
a marca. Além disso, nada na tela dizia que o assunto era roupa: fora as
fotografias, o site poderia ser sobre arquitetura ou sobre software.

A saída passou por trocar o vocabulário emprestado do editorial genérico pelo
vocabulário da indústria de confecção, que é onde o projeto realmente vive.
Acrescentar mais estilo teria produzido a mesma família com mais camadas.

## As cinco decisões

### 1. O selo é um sistema, não um arquivo

`VaultSeal.vue` aceita uma `semente`. Passando o caminho do artigo, os anéis,
os caixotões, o raio interno e o giro saem de um hash FNV-1a determinístico do
próprio conteúdo. Cada texto publicado carrega a sua variação, sempre
reconhecível como a mesma família, e o mesmo artigo produz o mesmo selo no
servidor, no cliente e em qualquer imagem de compartilhamento futura.

Onde aparece: cabeçalho do artigo, linha do índice, rodapé.

### 2. Uma notação da casa, com ordem de campo fixa

`Ficha.vue` é o único formato de metadado do site. Duas ordens canônicas:

- material: `MATÉRIA · CONSTRUÇÃO · PESO · PROCEDÊNCIA`
- artigo: `PILAR · AFERIÇÃO · DATA`

Nenhuma chamada nova deve inventar ordem própria. A força da notação vem da
repetição, do mesmo jeito que o crédito de foto de uma revista funciona por
estar sempre no mesmo canto com a mesma pontuação.

### 3. Toda régua horizontal é linha de corte com margem de costura

Onde antes havia um fio de 2px, agora há um fio de 2px com uma linha
pontilhada de 1px cinco pixels abaixo, e piquetes verticais nas duas pontas
dos cabeçalhos de seção. É o desenho de uma peça de modelagem antes de ser
cortada. Está em `.slab`, `.head` e nas utilidades `.corte` e `.piquete`.

### 4. A canhota do documento é uma fita métrica

Uma coluna de 3rem corre a altura inteira de toda página, com traço miúdo a
cada 0,75rem e traço cheio a cada 6rem, mais o nome da publicação em vertical.
Some abaixo de 860px, onde não sobra margem. É a peça que faz o site ser
identificável numa miniatura de 200px, que é o teste honesto de identidade.

### 5. Desenho técnico como figura de artigo

`FlatTecnico.vue` desenha jaqueta de trabalho, calça, camisa e sobretudo em
vista de frente, descrevendo só a metade direita e espelhando, que é como uma
ficha de confecção é construída. Três pesos de traço carregam significado:
cheio é linha de corte, fino é costura de união, pontilhado é pesponto.

Fotografia mostra material e desenho mostra construção, então o desenho entra
onde o artigo discute construção. Ele aparece como figura no fim do texto, para
o artigo que declarar `peca` no frontmatter, com legenda dos pesos de traço e a
ficha do material. Nada além disso.

**Revisto em 2026-08-18, no mesmo dia.** A primeira versão trazia também uma
seção de prancha na home, com seletor de peça e chamadas numeradas, e um bloco
de rodapé que usava os símbolos da norma de conservação para apresentar as
políticas editoriais. As duas coisas saíram: viravam vitrine de recurso e
piada de etiqueta num lugar onde o registro precisa ser o de uma publicação
séria. As políticas continuam, em texto, sob o título "Política editorial".

## Norma de fotografia

As fotos atuais são de acervo Creative Commons e são provisórias. Quando a
produção passar a ser própria, ela segue esta norma, porque enquadramento
repetido faz mais pela identidade do que qualquer decisão tipográfica.

- **Distância**: macro de trama e detalhe de construção. O quadro mostra
  costura, aviamento, boca de bolso ou barra, nunca a peça inteira pendurada.
  A peça inteira é trabalho do desenho técnico.
- **Luz**: uma fonte só, lateral, rasante, para o relevo do tecido aparecer.
  Sem preenchimento frontal e sem softbox de dois lados.
- **Fundo**: o próprio tecido preenche o quadro. Sem mesa, sem cabide, sem
  cenário.
- **Ângulo**: perpendicular à superfície ou a 15 graus. Sem diagonal
  dramática.
- **Proporção**: 4:5 para a plate de abertura, 1:1 para o índice.
- **Tratamento**: sem filtro e sem virada de cor. A cor da imagem é a cor da
  peça, e é a única cor do site.
- **Legenda**: sempre a ficha na ordem canônica, nunca texto solto.

Cada foto publicada precisa de uma peça na mão. Enquanto isso não acontecer, a
ficha exibida diz que os valores são de referência de categoria.

## O que continua valendo do sistema anterior

- Sem serifa em lugar nenhum. Archivo Expanded 900 no display, Martian Mono no
  resto.
- Interface monocromática. Os tokens `--accent`, `--accent-ink` e `--on-accent`
  continuam existindo apontando para os neutros, caso a decisão mude.
- Zero raio de canto, transições de 60ms.
- Nada de artefato fingido: sem número de edição inventado, sem numeral romano
  de data, sem símbolo de marca registrada.

## O que não foi feito e por quê

Trocar Martian Mono por um grotesco no texto corrido aumentaria a distinção e
a legibilidade em textos longos, mas contraria a regra tipográfica registrada
em `CLAUDE.md` e invalidaria o ajuste fino de tamanhos já feito no CSS. Fica
como decisão em aberto, para ser testada em branch antes de qualquer troca.
