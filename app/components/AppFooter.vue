<script setup lang="ts">
const currentYear = new Date().getFullYear()
</script>

<template>
  <footer class="site-footer">
    <div class="container site-footer__inner">
      <p>Allegorio — moda masculina explicada com critério.</p>
      <p>&copy; {{ currentYear }}</p>
    </div>
  </footer>
</template>
