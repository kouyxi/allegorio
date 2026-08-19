<script setup lang="ts">
const direction = useState<'next' | 'prev' | 'none'>('nav-direction', () => 'none')

const transition = computed(() => ({
  name: direction.value === 'none' ? 'page' : direction.value === 'next' ? 'slide-left' : 'slide-right',
  mode: 'out-in' as const
}))
</script>

<template>
  <NuxtPwaManifest />
  <NuxtLayout>
    <NuxtRouteAnnouncer />
    <NuxtPage :transition="transition" />
  </NuxtLayout>
</template>
