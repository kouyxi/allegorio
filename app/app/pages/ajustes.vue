<script setup lang="ts">
import type { Category, ItemKind, RecommendationRole } from '~/types/domain'
import { ROLE_ICONS, ROLE_LABELS } from '~/utils/recommend'
import { plural } from '~/utils/format'

const { items, categories, addCategory, renameCategory, removeCategory, resetDemo, isRemote } = useCollection()
const { outfits } = useOutfits()
const backup = useBackup()
const { user, configured, signOut } = useAuth()
const perfil = useProfile()

async function leave() {
  await signOut()
  await navigateTo('/entrar')
}

/* Rascunho separado do valor salvo, senão cada tecla digitada já reescreveria
   o nome que aparece no resto do aplicativo antes de existir confirmação. */
const nomeDraft = ref('')
const nomeSalvo = ref(false)
watch(perfil.displayName, valor => { nomeDraft.value = valor }, { immediate: true })

async function salvarNome() {
  await perfil.save(nomeDraft.value)
  nomeSalvo.value = true
  setTimeout(() => { nomeSalvo.value = false }, 2000)
}

const fileInput = ref<HTMLInputElement | null>(null)
const pending = ref<import('~/utils/backup').Backup | null>(null)
const importError = ref('')

const importOpen = computed({
  get: () => pending.value !== null,
  set: (value: boolean) => { if (!value) pending.value = null }
})

async function onFile(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return

  importError.value = ''
  try {
    pending.value = backup.parse(await file.text())
  } catch (cause) {
    importError.value = cause instanceof Error ? cause.message : 'Não consegui ler o arquivo.'
  }
}

function confirmImport() {
  if (!pending.value) return
  backup.restore(pending.value)
  pending.value = null
  notice.value = 'Backup restaurado.'
}

const GARMENT_ROLES: RecommendationRole[] = ['top', 'bottom', 'outer_layer', 'footwear', 'accessory', 'one_piece']

const createOpen = ref(false)
const editing = ref<Category | null>(null)
const draftName = ref('')
const notice = ref('')

const form = reactive({ name: '', kind: 'garment' as ItemKind, role: 'top' as RecommendationRole })

const editOpen = computed({
  get: () => editing.value !== null,
  set: (value: boolean) => { if (!value) editing.value = null }
})

const counts = computed(() => {
  const map = new Map<string, number>()
  for (const item of items.value) map.set(item.categoryId, (map.get(item.categoryId) ?? 0) + 1)
  return map
})

const grouped = computed(() => [
  { kind: 'garment' as ItemKind, label: 'Roupas', list: categories.value.filter(entry => entry.kind === 'garment') },
  { kind: 'scent' as ItemKind, label: 'Perfumes', list: categories.value.filter(entry => entry.kind === 'scent') }
])

watch(() => form.kind, kind => { form.role = kind === 'scent' ? 'scent' : 'top' })

function openEdit(category: Category) {
  editing.value = category
  draftName.value = category.name
  notice.value = ''
}

function saveName() {
  if (!editing.value || !draftName.value.trim()) return
  renameCategory(editing.value.id, draftName.value)
  editing.value = null
}

function drop(category: Category) {
  if (removeCategory(category.id)) {
    editing.value = null
    notice.value = ''
  } else {
    notice.value = `${category.name} ainda tem ${plural(counts.value.get(category.id) ?? 0, 'item', 'itens')}. Mova ou remova antes.`
  }
}

function create() {
  if (!form.name.trim()) return
  addCategory(form.name, form.kind, form.role)
  form.name = ''
  createOpen.value = false
}

useHead({ title: 'Ajustes · Allegorio' })
</script>

<template>
  <div class="settings">
    <header class="settings__head rise">
      <p class="label dimmer">Estrutura do acervo</p>
      <h1 class="display display-lg">Categorias</h1>
      <p class="settings__intro">
        O nome é seu. O papel é o que o recomendador entende: uma categoria chamada Overshirts
        pode ocupar o lugar de terceira peça sem que a sugestão precise saber disso.
      </p>
    </header>

    <!-- a conta vem antes das categorias: é a primeira coisa que alguém quer
         conferir ao abrir ajustes, e um acervo com muitas categorias faria
         rolar bastante para chegar até aqui lá embaixo -->
    <section v-if="configured" class="account rise rise-1">
      <div class="sec-head">
        <h2 class="sec-head__title"><AppIcon name="sun" size="1.0625rem" />Conta</h2>
      </div>
      <div class="account__row card card--flat">
        <span class="account__copy">
          <span class="label dimmer">Conectado como</span>
          <strong>{{ perfil.displayName.value || user?.email }}</strong>
          <span v-if="perfil.displayName.value" class="account__email">{{ user?.email }}</span>
        </span>
        <button type="button" class="btn btn--quiet btn--sm" @click="leave">Sair</button>
      </div>

      <label class="field account__nome">
        <span class="label">Como te chamar</span>
        <div class="account__nome-row">
          <input
            v-model="nomeDraft"
            class="input"
            type="text"
            placeholder="Seu nome"
            autocomplete="name"
            @keyup.enter="salvarNome"
          >
          <button
            type="button"
            class="btn btn--ghost btn--sm"
            :disabled="nomeDraft.trim() === perfil.displayName.value"
            @click="salvarNome"
          >
            {{ nomeSalvo ? 'Salvo' : 'Salvar' }}
          </button>
        </div>
        <span class="account__nota">É o nome que a tela de hoje usa para te cumprimentar.</span>
      </label>
    </section>

    <section v-for="group in grouped" :key="group.kind" class="group rise rise-2">
      <div class="sec-head">
        <h2 class="sec-head__title">
          <AppIcon :name="group.kind === 'scent' ? 'scent' : 'hanger'" size="1.0625rem" />
          {{ group.label }}
        </h2>
        <span class="label dimmer">{{ group.list.length }}</span>
      </div>

      <ul class="cats card card--flat">
        <li v-for="category in group.list" :key="category.id">
          <button type="button" class="cat" @click="openEdit(category)">
            <span class="cat__copy">
              <span class="cat__name">{{ category.name }}</span>
              <span class="cat__role label dimmer">{{ ROLE_LABELS[category.role] }}</span>
            </span>
            <span class="cat__count num">{{ counts.get(category.id) ?? 0 }}</span>
            <AppIcon name="chevron" size="1rem" class="cat__go" />
          </button>
        </li>
      </ul>
    </section>

    <p v-if="notice" class="settings__notice" role="status">{{ notice }}</p>

    <button type="button" class="btn btn--ghost btn--full settings__add rise rise-3" @click="createOpen = true">
      <AppIcon name="plus" size="1.0625rem" />
      Nova categoria
    </button>

    <section class="data rise rise-4">
      <div class="sec-head">
        <h2 class="sec-head__title"><AppIcon name="layers" size="1.0625rem" />Backup</h2>
      </div>
      <p class="data__note">
        O acervo vive no armazenamento deste navegador. Trocar de aparelho, limpar o site ou o
        próprio navegador despejar o dado apaga tudo. Enquanto a sincronização não existir, o arquivo
        abaixo é a sua cópia, e vale guardar num lugar que não seja o telefone.
      </p>
      <p class="data__note">
        As fotografias não entram no arquivo: ele guarda a ficha e o caminho da imagem,
        não os bytes dela. Restaurar num aparelho novo devolve o acervo inteiro com o
        desenho técnico no lugar das fotos.
      </p>

      <dl class="data__stats">
        <div><dt class="label dimmer">Itens</dt><dd class="num">{{ items.length }}</dd></div>
        <div><dt class="label dimmer">Categorias</dt><dd class="num">{{ categories.length }}</dd></div>
        <div><dt class="label dimmer">Combinações</dt><dd class="num">{{ outfits.length }}</dd></div>
      </dl>

      <NuxtLink v-if="outfits.length" class="link-quiet data__hist" to="/historico">
        <AppIcon name="clock" size="1rem" />
        Ver o histórico de uso
      </NuxtLink>

      <div class="data__actions">
        <button type="button" class="btn" @click="backup.download()">
          <AppIcon name="arrow" size="1.0625rem" />
          Exportar arquivo
        </button>
        <button type="button" class="btn btn--ghost" @click="fileInput?.click()">
          <AppIcon name="layers" size="1.0625rem" />
          Importar
        </button>
        <input
          ref="fileInput"
          class="sr-only"
          type="file"
          accept="application/json,.json"
          @change="onFile"
        >
      </div>

      <p v-if="importError" class="data__error" role="alert">
        <AppIcon name="info" size="1.0625rem" />
        {{ importError }}
      </p>

      <button v-if="!isRemote" type="button" class="link-quiet data__reset" @click="resetDemo">
        Voltar aos dados de exemplo
      </button>
    </section>

    <AppSheet v-model="importOpen" title="Restaurar backup" subtitle="Isto substitui o acervo atual">
      <div v-if="pending" class="restore">
        <dl class="restore__stats">
          <div><dt class="label dimmer">Itens</dt><dd class="num">{{ items.length }} → {{ pending.items.length }}</dd></div>
          <div><dt class="label dimmer">Categorias</dt><dd class="num">{{ categories.length }} → {{ pending.categories.length }}</dd></div>
          <div><dt class="label dimmer">Combinações</dt><dd class="num">{{ outfits.length }} → {{ pending.outfits.length }}</dd></div>
        </dl>
        <p class="restore__note">
          Arquivo exportado em {{ pending.exportedAt.slice(0, 10) || 'data desconhecida' }}. O acervo
          que está aqui agora será descartado, e não dá para desfazer.
        </p>
      </div>
      <template #footer>
        <div class="restore__actions">
          <button type="button" class="btn btn--quiet" @click="importOpen = false">Cancelar</button>
          <button type="button" class="btn" @click="confirmImport">Substituir</button>
        </div>
      </template>
    </AppSheet>

    <!-- editar -->
    <AppSheet v-model="editOpen" :title="editing?.name ?? ''" subtitle="Renomear ou remover">
      <div v-if="editing" class="edit">
        <label class="field">
          <span class="label">Nome</span>
          <input v-model="draftName" class="input" type="text" @keyup.enter="saveName">
        </label>
        <p class="edit__role">
          Papel no recomendador: <strong>{{ ROLE_LABELS[editing.role] }}</strong>. O papel é fixo
          porque a sugestão depende dele para montar o look.
        </p>
      </div>
      <template #footer>
        <div v-if="editing" class="edit__actions">
          <button type="button" class="btn btn--quiet" :disabled="!editing.custom" @click="drop(editing)">
            <AppIcon name="trash" size="1.0625rem" />
            Remover
          </button>
          <button type="button" class="btn" @click="saveName">Salvar</button>
        </div>
      </template>
    </AppSheet>

    <!-- criar -->
    <AppSheet v-model="createOpen" title="Nova categoria" subtitle="Nome livre, papel fixo">
      <div class="edit">
        <label class="field">
          <span class="label">Nome</span>
          <input v-model="form.name" class="input" type="text" placeholder="Overshirts" @keyup.enter="create">
        </label>

        <div class="field">
          <span class="label">Tipo</span>
          <AppSegmented
            v-model="form.kind"
            label="Tipo"
            :options="[{ value: 'garment', label: 'Roupa' }, { value: 'scent', label: 'Perfume' }]"
          />
        </div>

        <div v-if="form.kind === 'garment'" class="field">
          <span class="label">Papel no look</span>
          <div class="chip-row" data-hscroll role="group" aria-label="Papel no look">
            <button
              v-for="role in GARMENT_ROLES"
              :key="role"
              type="button"
              class="chip"
              :aria-pressed="form.role === role"
              @click="form.role = role"
            >
              <AppIcon :name="ROLE_ICONS[role]" size="1rem" />
              {{ ROLE_LABELS[role] }}
            </button>
          </div>
        </div>
      </div>
      <template #footer>
        <button type="button" class="btn btn--full" :disabled="!form.name.trim()" @click="create">Criar</button>
      </template>
    </AppSheet>
  </div>
</template>

<style scoped>
.settings__head { margin-bottom: var(--s6); }
.settings__head h1 { margin-top: var(--s2); }
.settings__intro { max-width: 42ch; margin-top: var(--s3); color: var(--ink-3); font-size: var(--fs-sm); line-height: 1.55; }

.group { margin-top: var(--s7); }
.cats { overflow: hidden; }
.cats > li + li { border-top: 1px solid var(--line); }

.cat {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto auto;
  align-items: center;
  gap: var(--s3);
  width: 100%;
  min-height: 3.5rem;
  padding: var(--s3) var(--pad);
  border: 0;
  background: transparent;
  color: inherit;
  text-align: left;
  transition: background var(--t) var(--ease);
}
.cat:hover { background: var(--card-2); }
.cat:active { background: var(--paper-2); }
.cat__copy { display: grid; gap: 0.0625rem; min-width: 0; }
.cat__name {
  overflow: hidden;
  font-size: var(--fs-base);
  font-variation-settings: "wght" 600;
  letter-spacing: -0.018em;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.cat__count { min-width: 1.5rem; color: var(--ink-4); font-size: var(--fs-micro); text-align: right; }
.cat__go { color: var(--ink-4); }

.settings__notice {
  margin-top: var(--s4);
  padding: var(--s3) var(--s4);
  border: 1px solid var(--ink);
  border-radius: var(--r-md);
  background: var(--card);
  font-size: var(--fs-sm);
  line-height: 1.5;
}
.settings__add { margin-top: var(--s5); }

/* Sem borda de divisor nem margem grande: virou a primeira seção da página, e
   quem separava do que vinha antes era o botão "Nova categoria" que não existe
   mais aqui em cima. O respiro já vem do cabeçalho. */
.account { margin-bottom: var(--s7); }
.account__row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: var(--s3);
  padding: var(--s3) var(--s4);
}
.account__copy { display: grid; gap: 0.0625rem; min-width: 0; }
.account__copy strong {
  overflow: hidden;
  font-size: var(--fs-sm);
  font-variation-settings: "wght" 640;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.account__email { overflow: hidden; color: var(--ink-4); font-size: var(--fs-micro); white-space: nowrap; text-overflow: ellipsis; }

.account__nome { margin-top: var(--s3); }
.account__nome-row { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: var(--s2); }
.account__nota { color: var(--ink-4); font-size: var(--fs-xs); line-height: 1.45; }

.data { margin-top: var(--s7); padding-top: var(--s6); border-top: 1px solid var(--line); }
.data__note { margin-bottom: var(--s4); color: var(--ink-3); font-size: var(--fs-sm); line-height: 1.55; }

.data__stats, .restore__stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--s2);
  margin-bottom: var(--s4);
  padding: var(--s3);
  border-radius: var(--r-md);
  background: var(--paper-2);
  box-shadow: var(--sh-inset);
}
.data__stats dd, .restore__stats dd {
  margin-top: var(--s1);
  font-size: var(--fs-sm);
  color: var(--ink);
}

.data__actions { display: grid; grid-template-columns: 1fr 1fr; gap: var(--s2); }
.data__error {
  display: flex;
  align-items: center;
  gap: var(--s2);
  margin-top: var(--s3);
  padding: var(--s3) var(--s4);
  border: 1px solid var(--ink);
  border-radius: var(--r-md);
  background: var(--card);
  font-size: var(--fs-sm);
  line-height: 1.45;
}
.data__hist { margin-top: calc(var(--s2) * -1); margin-bottom: var(--s3); }
.data__reset { margin-top: var(--s3); }

.restore { padding-top: var(--s3); }
.restore__stats { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.restore__note { color: var(--ink-3); font-size: var(--fs-sm); line-height: 1.55; }
.restore__actions { display: grid; grid-template-columns: auto minmax(0, 1fr); gap: var(--s2); }

.edit { display: grid; gap: var(--s4); padding-top: var(--s2); }
.edit__role { color: var(--ink-3); font-size: var(--fs-xs); line-height: 1.5; }
.edit__role strong { color: var(--ink-2); }
.edit__actions { display: grid; grid-template-columns: auto minmax(0, 1fr); gap: var(--s2); }
</style>
