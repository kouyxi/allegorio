import { DEFAULT_CATEGORIES, DEMO_ITEMS } from '~/data/demo'
import type { Category, CollectionItem, NewItemInput, RecommendationRole } from '~/types/domain'

/** Recorte de peças e categorias sobre o store. */
export function useCollection() {
  const store = useStore()
  const { items, categories, loading, error, commit } = store

  onMounted(() => { store.load() })

  const owned = computed(() => items.value.filter(item => item.ownership === 'owned'))
  const wishlist = computed(() => items.value.filter(item => item.ownership === 'wishlist'))
  const categoryById = computed(() => new Map(categories.value.map(entry => [entry.id, entry])))
  const itemById = computed(() => new Map(items.value.map(item => [item.id, item])))

  /* O id nasce no cliente. O Postgres aceita id explícito, e com isso a escrita
     otimista não precisa reconciliar identificador depois da resposta. */
  function addItem(input: NewItemInput) {
    const category = categories.value.find(entry => entry.id === input.categoryId)
    if (!category) throw new Error('Categoria inválida')

    const item: CollectionItem = {
      ...input,
      id: crypto.randomUUID(),
      currency: 'BRL',
      formality: input.formality ?? 2,
      climates: input.climates?.length ? input.climates : ['hot', 'mild', 'cold'],
      contexts: input.contexts?.length ? input.contexts : ['everyday'],
      styleTags: [],
      projection: input.kind === 'scent' ? input.projection ?? 'moderate' : undefined,
      remainingPercent: input.kind === 'scent' && input.ownership === 'owned' ? 100 : undefined,
      wearCount: 0
    }

    items.value = [item, ...items.value]
    commit(store => store.saveItems([item]))
    return item
  }

  function updateItem(id: string, patch: Partial<CollectionItem>) {
    const index = items.value.findIndex(item => item.id === id)
    if (index < 0) return

    const anterior = items.value[index]!
    const next = { ...anterior, ...patch }
    items.value = items.value.map(item => (item.id === id ? next : item))
    commit(store => store.saveItems([next]))

    /* Trocar a foto deixa a antiga órfã no bucket. Ninguém a veria de novo e
       ela continuaria contando cota, então sai junto. A remoção não entra no
       `commit`: falhar em apagar um arquivo velho não é motivo para desfazer a
       edição que a pessoa acabou de fazer. */
    if (anterior.imagePath && anterior.imagePath !== next.imagePath) {
      dropImage(anterior.imagePath)
    }
  }

  function removeItem(id: string) {
    const alvo = items.value.find(item => item.id === id)
    items.value = items.value.filter(item => item.id !== id)
    commit(store => store.deleteItem(id))
    if (alvo?.imagePath) dropImage(alvo.imagePath)
  }

  /** Sobe a foto e devolve o caminho. Diferente do resto, aqui a espera é
   *  explícita: o item precisa nascer já sabendo onde a imagem está, e fingir
   *  que subiu significaria salvar item apontando para arquivo inexistente. */
  function uploadImage(blob: Blob) {
    return store.persistence().saveImage(blob)
  }

  function dropImage(path: string) {
    return store.persistence().deleteImage(path).catch(() => undefined)
  }

  function markAsOwned(id: string) {
    const item = items.value.find(entry => entry.id === id)
    if (!item) return
    updateItem(id, {
      ownership: 'owned',
      remainingPercent: item.kind === 'scent' ? item.remainingPercent ?? 100 : undefined
    })
  }

  /** Registra o uso do look. É a recência que o recomendador consulta, então
   *  usar o aplicativo melhora as próximas sugestões. */
  function wearItems(ids: string[], when = new Date()) {
    const stamp = when.toISOString().slice(0, 10)
    const touched: CollectionItem[] = []

    items.value = items.value.map(item => {
      if (!ids.includes(item.id)) return item
      const next = { ...item, lastWornAt: stamp, wearCount: (item.wearCount ?? 0) + 1 }
      touched.push(next)
      return next
    })

    if (touched.length) commit(store => store.saveItems(touched))
  }

  function addCategory(name: string, kind: Category['kind'], role: RecommendationRole) {
    const category: Category = { id: crypto.randomUUID(), name: name.trim(), kind, role, custom: true }
    categories.value = [...categories.value, category]
    commit(store => store.saveCategory(category))
    return category
  }

  function renameCategory(id: string, name: string) {
    const category = categories.value.find(entry => entry.id === id)
    if (!category || !name.trim()) return

    const next = { ...category, name: name.trim() }
    categories.value = categories.value.map(entry => (entry.id === id ? next : entry))
    commit(store => store.saveCategory(next))
  }

  function removeCategory(id: string) {
    if (items.value.some(item => item.categoryId === id)) return false
    categories.value = categories.value.filter(category => category.id !== id)
    commit(store => store.deleteCategory(id))
    return true
  }

  function replaceAll(nextItems: CollectionItem[], nextCategories: Category[]) {
    const outfits = store.outfits.value
    categories.value = nextCategories
    items.value = nextItems
    commit(persist => persist.replaceAll({ items: nextItems, categories: nextCategories, outfits }))
  }

  function resetDemo() {
    replaceAll(structuredClone(DEMO_ITEMS), structuredClone(DEFAULT_CATEGORIES))
  }

  return {
    items, categories, owned, wishlist, categoryById, itemById, loading, error,
    isRemote: store.isRemote, reload: () => store.load(true),
    addItem, updateItem, removeItem, markAsOwned, wearItems, uploadImage, dropImage,
    addCategory, renameCategory, removeCategory, replaceAll, resetDemo
  }
}
