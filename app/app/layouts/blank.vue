<template>
  <div class="blank">
    <slot />
  </div>
</template>

<style scoped>
/* `overflow-x: clip` existia só na casca das telas com abas, e a tela de
   entrada usa este layout. Sem o corte, qualquer filho que passe da largura
   empurra o documento inteiro para o lado e o texto some pela esquerda, que é
   como a tela de entrada aparecia cortada em janela estreita.

   `min-width: 0` no lugar de largura implícita: filho em grade tem largura
   mínima automática igual ao conteúdo, então um campo ou um título comprido
   estica o container em vez de encolher dentro dele. */
.blank {
  display: grid;
  align-content: center;
  justify-items: stretch;
  min-height: 100dvh;
  width: min(100%, var(--shell));
  min-width: 0;
  margin-inline: auto;
  padding:
    calc(env(safe-area-inset-top) + var(--s8))
    var(--gutter)
    calc(env(safe-area-inset-bottom) + var(--s8));
  overflow-x: clip;
}
.blank > * { min-width: 0; }
</style>
