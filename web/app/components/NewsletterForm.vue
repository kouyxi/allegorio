<script setup lang="ts">
const email = ref('')
const estado = ref<'parado' | 'enviando' | 'pronto' | 'erro'>('parado')

async function enviar() {
  estado.value = 'enviando'
  try {
    await $fetch('/api/subscribe', { method: 'POST', body: { email: email.value } })
    estado.value = 'pronto'
    email.value = ''
  } catch {
    estado.value = 'erro'
  }
}
</script>

<template>
  <div>
    <form v-if="estado !== 'pronto'" class="form" @submit.prevent="enviar">
      <input
        v-model="email"
        type="email"
        required
        placeholder="seu@email.com"
        autocomplete="email"
        aria-label="Seu e-mail"
      >
      <button type="submit" :disabled="estado === 'enviando'">
        {{ estado === 'enviando' ? 'Enviando' : 'Assinar' }}
      </button>
    </form>

    <p v-else class="done">Registrado.</p>

    <p v-if="estado === 'erro'" class="erro lbl" role="alert">
      Não deu para registrar agora. Tente de novo em instantes.
    </p>
  </div>
</template>

<style scoped>
.form {
  display: flex;
  margin-top: 1.75rem;
  border: var(--bar) solid var(--paper);
}

input {
  flex: 1 1 auto;
  min-width: 0;
  font-family: var(--mono);
  font-variation-settings: "wdth" 85, "wght" 400;
  font-size: 0.8125rem;
  padding: 0.85rem 1rem;
  color: var(--paper);
  background: transparent;
  border: 0;
}

input::placeholder { color: color-mix(in oklab, var(--paper) 55%, var(--ink)); }

input:focus {
  outline: 0;
  background: color-mix(in oklab, var(--paper) 12%, var(--ink));
}

button {
  font-family: var(--display);
  font-variation-settings: "wdth" 108, "wght" 900;
  font-size: 0.8125rem;
  text-transform: uppercase;
  padding: 0.85rem 1.5rem;
  color: var(--ink);
  background: var(--paper);
  border: 0;
  cursor: pointer;
}

button:hover { background: var(--accent); color: var(--on-accent); }
button[disabled] { cursor: progress; opacity: 0.7; }

.done {
  font-family: var(--display);
  font-variation-settings: "wdth" 108, "wght" 900;
  font-size: 0.9375rem;
  text-transform: uppercase;
  margin-top: 1.75rem;
  padding-block: 0.85rem;
}

.erro { margin-top: 0.75rem; color: var(--paper); }
</style>
