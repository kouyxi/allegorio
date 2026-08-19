<script setup lang="ts">
const { offset, live, handlers } = useSwipeNav()
const { error, reload } = useCollection()
</script>

<template>
  <div class="shell">
    <main
      class="shell__main shell__drag"
      :class="{ 'shell__drag--live': live }"
      :style="{ transform: `translate3d(${offset}px, 0, 0)` }"
      v-on="handlers"
    >
      <slot />
    </main>

    <Transition name="sync">
      <div v-if="error" class="sync" role="alert">
        <AppIcon name="info" size="1.0625rem" />
        <p>{{ error }}</p>
        <button type="button" @click="reload()">Tentar de novo</button>
      </div>
    </Transition>

    <AppTabBar />
  </div>
</template>

<style scoped>
/* Gravação otimista pode falhar em silêncio, e silêncio aqui significa achar
   que salvou. O aviso fica acima da barra de abas e não bloqueia a tela. */
.sync {
  position: fixed;
  z-index: 60;
  inset: auto var(--gutter) calc(var(--tabbar-h) + env(safe-area-inset-bottom) + var(--s4));
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: var(--s3);
  width: min(calc(100% - var(--gutter) * 2), calc(var(--shell) - var(--s4)));
  margin-inline: auto;
  padding: var(--s3) var(--s4);
  border-radius: var(--r-md);
  background: var(--ink);
  color: var(--ink-inv);
  box-shadow: var(--sh-3);
}
.sync p { font-size: var(--fs-xs); line-height: 1.4; }
.sync button {
  border: 0;
  padding: var(--s1) var(--s2);
  border-radius: var(--r-full);
  background: rgb(255 255 255 / 14%);
  color: inherit;
  font-size: var(--fs-micro);
  font-variation-settings: "wght" 650;
  white-space: nowrap;
}

.sync-enter-active, .sync-leave-active { transition: opacity var(--t) var(--ease), transform var(--t-slow) var(--ease); }
.sync-enter-from, .sync-leave-to { opacity: 0; transform: translateY(var(--s3)); }
</style>
