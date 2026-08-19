<template>
  <div class="raiz">
    <!-- A fita métrica. Corre a altura inteira do documento, sempre no mesmo
         lugar, em toda página. É o que dá para reconhecer numa miniatura. -->
    <aside class="rail">
      <p class="rail__marca lbl">Allegorio · publicação independente · Brasil</p>
    </aside>

    <header class="bar">
      <div class="bar__in shell">
        <NuxtLink class="bar__mark" to="/">Allegorio</NuxtLink>
        <nav>
          <ul class="bar__nav lbl">
            <li><NuxtLink to="/#comece">Comece aqui</NuxtLink></li>
            <li><NuxtLink to="/#criterio">Critério</NuxtLink></li>
            <li><NuxtLink to="/artigos">Índice</NuxtLink></li>
            <li><NuxtLink to="/#carta">A carta</NuxtLink></li>
          </ul>
        </nav>
      </div>
    </header>

    <main>
      <slot />
    </main>

    <footer class="colofao">
      <div class="shell">
        <div class="head">
          <h2 class="fat">Política editorial</h2>
          <p class="lbl dim">O que a publicação se compromete a fazer</p>
        </div>

        <dl class="politica">
          <div v-for="p in POLITICA" :key="p.tit" class="politica__item">
            <dt class="lbl acc">{{ p.tit }}</dt>
            <dd class="dim">{{ p.txt }}</dd>
          </div>
        </dl>
      </div>

      <div class="shell colofao__pe">
        <VaultSeal class="seal" vem />
        <div class="colofao__grid">
          <div>
            <p class="lbl">A marca</p>
            <p class="dim">
              O selo é desenhado por código, e os anéis e caixotões saem do próprio
              artigo. Cada texto publicado carrega a sua variação sem ninguém
              redesenhar nada.
            </p>
          </div>
          <div>
            <p class="lbl">Imagens</p>
            <p class="dim">
              As fotos atuais são <strong>provisórias</strong>. Vieram de acervo
              Creative Commons pelo Openverse. A ideia é substituir por fotografia
              própria das peças assim que der, seguindo a norma de enquadramento
              que a gente já escreveu.
            </p>
          </div>
          <div>
            <p class="lbl">Medidas</p>
            <p class="dim">
              Gramatura e composição que não vieram de peça aferida aparecem
              marcadas como referência de categoria.
            </p>
          </div>
          <div>
            <p class="lbl">Tipografia</p>
            <p class="dim">
              Archivo Expanded 900 no display e Martian Mono no resto. A interface
              não usa cor: ela vem das fotografias, conforme cada uma entra na tela.
            </p>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
/**
 * As políticas abaixo já existiam. Elas estavam vestidas de etiqueta de
 * conservação, com os símbolos da norma de lavagem servindo de ícone. A
 * piada tirava seriedade de compromissos que precisam ser levados a sério,
 * então ficou o texto e saiu a fantasia.
 */
const POLITICA = [
  {
    tit: 'Frequência',
    txt: 'A carta sai quando sai artigo. Calendário inventado só para parecer que tem movimento não ajuda ninguém.'
  },
  {
    tit: 'Correção',
    txt: 'Erro publicado não é apagado. A gente corrige no texto e deixa a nota do que mudou, com a data.'
  },
  {
    tit: 'Opinião',
    txt: 'Fato, convenção e preferência aparecem separados. Quando é gosto nosso, está escrito que é gosto nosso.'
  },
  {
    tit: 'Dados',
    txt: 'A inscrição na carta guarda só o e-mail, e a saída é um clique no rodapé.'
  },
  {
    tit: 'Comércio',
    txt: 'Nada aqui é patrocinado hoje. Se mudar, vem declarado antes do texto e não no rodapé, e comissão não decide recomendação.'
  }
]
</script>

<style scoped>
.bar {
  position: sticky;
  top: 0;
  z-index: 40;
  background: var(--paper);
  border-bottom: var(--bar) solid var(--ink);
}

.bar__in {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  height: var(--bar-h);
}

.bar__mark {
  font-family: var(--display);
  font-variation-settings: "wdth" 112, "wght" 900;
  font-size: 0.9375rem;
  text-transform: uppercase;
  text-decoration: none;
}

.bar__nav {
  display: flex;
  gap: 1.25rem;
}

.bar__nav a { text-decoration: none; }
.bar__nav a:hover { color: var(--accent-ink); }

@media (max-width: 700px) {
  .bar__nav li:nth-child(-n+2) { display: none; }
}

/* ── política editorial ────────────────────────────────────────────── */
.colofao { padding-block: clamp(1.75rem, 3.4vw, 3rem) clamp(1.25rem, 2.6vw, 2rem); }

.politica {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 14rem), 1fr));
  gap: clamp(1.1rem, 2.6vw, 2rem);
}

.politica dd {
  margin: 0.35rem 0 0;
  font-size: 0.75rem;
  line-height: 1.6;
}

.colofao__pe {
  margin-top: clamp(1.75rem, 3.4vw, 3rem);
  padding-top: clamp(1.25rem, 2.4vw, 1.75rem);
  border-top: var(--bar) solid var(--ink);
}

.seal {
  width: 38px;
  margin-bottom: 0.9rem;
}

.colofao__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 13rem), 1fr));
  gap: clamp(1.25rem, 3vw, 2.5rem);
}

.colofao__grid p + p {
  font-size: 0.75rem;
  line-height: 1.6;
  margin-top: 0.4rem;
}
</style>
