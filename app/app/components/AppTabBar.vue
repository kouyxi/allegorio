<script setup lang="ts">
const route = useRoute()
const { tabs, index, slot, isActive, goTo, addRoute } = useTabs()

const onAdd = computed(() => route.path.startsWith(addRoute))

/* Na tela de adicionar o botão vira X e desfaz a própria navegação, em vez de
   apontar para a rota em que já se está. */
const router = useRouter()

function onFab(event: MouseEvent) {
  if (!onAdd.value) return
  event.preventDefault()
  if (window.history.length > 1) router.back()
  else router.push('/acervo')
}
const leading = computed(() => tabs.slice(0, 2))
const trailing = computed(() => tabs.slice(2))
</script>

<template>
  <nav class="tabbar" aria-label="Navegação principal">
    <div class="tabbar__inner" :style="{ '--tab-slot': slot }">
      <span v-show="index !== -1" class="tabbar__thumb" aria-hidden="true" />

      <NuxtLink
        v-for="(tab, i) in leading"
        :key="tab.to"
        :to="tab.to"
        class="tab"
        :aria-current="isActive(tab.to) ? 'page' : undefined"
        @click="goTo(i)"
      >
        <AppIcon :name="tab.icon" size="1.3125rem" />
        <span>{{ tab.label }}</span>
      </NuxtLink>

      <NuxtLink
        class="tabbar__fab"
        :to="addRoute"
        :aria-current="onAdd ? 'page' : undefined"
        :aria-label="onAdd ? 'Fechar cadastro' : 'Adicionar item'"
        @click="onFab"
      >
        <AppIcon name="plus" size="1.5rem" :weight="1.9" />
      </NuxtLink>

      <NuxtLink
        v-for="(tab, i) in trailing"
        :key="tab.to"
        :to="tab.to"
        class="tab"
        :aria-current="isActive(tab.to) ? 'page' : undefined"
        @click="goTo(i + 2)"
      >
        <AppIcon :name="tab.icon" size="1.3125rem" />
        <span>{{ tab.label }}</span>
      </NuxtLink>
    </div>
  </nav>
</template>
