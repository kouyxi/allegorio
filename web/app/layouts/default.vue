<template>
  <div>
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

    <footer class="colofao shell">
      <VaultSeal class="seal" />
      <div class="colofao__grid">
        <div>
          <p class="lbl">A marca</p>
          <p class="dim">
            O selo é desenhado por código, não é um arquivo. Isso deixa cada peça
            do acervo receber a sua própria variação sem redesenhar nada.
          </p>
        </div>
        <div>
          <p class="lbl">Imagens</p>
          <p class="dim">
            As fotos atuais são <strong>provisórias</strong>. Vieram de acervo Creative
            Commons pelo Openverse e foram tratadas em preto e branco. A ideia é
            substituir por fotografia própria das peças assim que der.
          </p>
        </div>
        <div>
          <p class="lbl">Afiliados</p>
          <p class="dim">
            Se um dia existirem, virão declarados no texto. Comissão não vai decidir
            o que a gente recomenda.
          </p>
        </div>
        <div>
          <p class="lbl">Tipografia</p>
          <p class="dim">
            Archivo Expanded 900 no display e Martian Mono no resto. A interface
            não usa cor: ela vem das fotografias.
          </p>
        </div>
      </div>
    </footer>
  </div>
</template>

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

.bar__mark sup {
  font-size: 0.55em;
  vertical-align: super;
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

.colofao { padding-block: clamp(1.25rem, 2.6vw, 2rem); }

.seal {
  width: 38px;
  margin-bottom: 0.75rem;
  animation: turn 90s linear infinite;
}

.colofao__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 14rem), 1fr));
  gap: clamp(1.25rem, 3vw, 2.5rem);
}

.colofao__grid p + p {
  font-size: 0.75rem;
  line-height: 1.6;
  margin-top: 0.4rem;
}
</style>
