import { DEFAULT_CATEGORIES, DEMO_ITEMS } from '~/data/demo'
import type { Category, CollectionItem, NewItemInput, RecommendationRole, SavedOutfit } from '~/types/domain'
import type { Persistence, Snapshot } from '~/utils/persistence'
import { createLocalPersistence, createSupabasePersistence } from '~/utils/persistence'

/**
 * Estado único do acervo.
 *
 * `useCollection` e `useOutfits` são recortes deste store, e não estados
 * paralelos: com dois donos do mesmo dado, salvar uma combinação e marcar a
 * peça como usada acabariam divergindo.
 *
 * Escrita é otimista. A tela muda na hora, a gravação vai atrás, e se ela
 * falhar o estado volta do servidor e o erro aparece. Para um acervo pessoal
 * isso vale mais que esperar a rede a cada toque.
 */
export function useStore() {
  const nuxt = useNuxtApp()
  const { user, configured } = useAuth()

  const items = useState<CollectionItem[]>('store-items', () => [])
  const categories = useState<Category[]>('store-categories', () => [])
  const outfits = useState<SavedOutfit[]>('store-outfits', () => [])
  const loading = useState('store-loading', () => true)
  const error = useState<string | null>('store-error', () => null)
  const loadedFor = useState<string | null>('store-loaded-for', () => null)

  function snapshot(): Snapshot {
    return { items: items.value, categories: categories.value, outfits: outfits.value }
  }

  /* Cache separado por conta: trocar de usuário no mesmo navegador não pode
     mostrar o acervo de quem saiu enquanto o servidor não responde. */
  const cacheKey = computed(() => `allegorio:cache:${user.value?.id ?? 'local'}`)

  function readCache(): Snapshot | null {
    const raw = localStorage.getItem(cacheKey.value)
    if (!raw) return null
    try { return JSON.parse(raw) as Snapshot } catch { return null }
  }

  function writeCache() {
    localStorage.setItem(cacheKey.value, JSON.stringify(snapshot()))
  }

  function persistence(): Persistence {
    const client = nuxt.$supabase
    if (client && user.value) return createSupabasePersistence(client, user.value.id)
    return createLocalPersistence(snapshot)
  }

  function apply(next: Snapshot) {
    categories.value = next.categories
    items.value = next.items
    outfits.value = next.outfits
  }

  /** Uma conta nova não tem categoria, e sem categoria não dá para cadastrar
   *  nada. A semente entra sem os itens de exemplo: acervo é do usuário. */
  async function seed(store: Persistence) {
    const fresh = structuredClone(DEFAULT_CATEGORIES)
    for (const category of fresh) {
      category.id = crypto.randomUUID()
      await store.saveCategory(category)
    }
    categories.value = fresh
  }

  async function load(force = false) {
    const key = user.value?.id ?? 'local'
    if (!force && loadedFor.value === key) return

    error.value = null
    const store = persistence()

    // pinta o que já se sabe antes de perguntar ao servidor
    const cached = readCache()
    if (cached) apply(cached)
    loading.value = !cached

    try {
      const remote = await store.load()

      if (remote) {
        apply(remote)
        if (store.remote && !remote.categories.length) await seed(store)
      } else if (!store.remote) {
        // primeiro uso local: dados de exemplo para a tela ter o que mostrar
        apply({
          items: structuredClone(DEMO_ITEMS),
          categories: structuredClone(DEFAULT_CATEGORIES),
          outfits: []
        })
      }

      loadedFor.value = key
      writeCache()
    } catch (cause) {
      error.value = cause instanceof Error ? cause.message : 'Não consegui carregar o acervo.'
    } finally {
      loading.value = false
    }
  }

  /** Executa a gravação; se ela falhar, desfaz voltando do servidor. */
  async function commit(write: (store: Persistence) => Promise<void>) {
    error.value = null
    try {
      await write(persistence())
      writeCache()
    } catch (cause) {
      error.value = cause instanceof Error ? cause.message : 'Não consegui salvar.'
      await load(true)
    }
  }

  return {
    items, categories, outfits, loading, error,
    load, commit, writeCache, apply, snapshot, persistence,
    isRemote: computed(() => Boolean(configured.value && user.value))
  }
}
