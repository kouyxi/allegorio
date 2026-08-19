import type { Climate, LookResult, SavedOutfit } from '~/types/domain'

/** Recorte de combinações sobre o store. */
export function useOutfits() {
  const store = useStore()
  const { outfits, commit } = store

  onMounted(() => { store.load() })

  const wornToday = computed(() => {
    const stamp = new Date().toISOString().slice(0, 10)
    return outfits.value.find(outfit => outfit.worn && outfit.createdAt.slice(0, 10) === stamp)
  })

  function record(contextId: string, climate: Climate, result: LookResult, worn: boolean) {
    const outfit: SavedOutfit = {
      id: crypto.randomUUID(),
      name: worn ? 'Usado' : 'Guardado',
      contextId,
      climate,
      itemIds: result.items.map(item => item.id),
      createdAt: new Date().toISOString(),
      worn
    }

    outfits.value = [outfit, ...outfits.value]
    commit(persist => persist.saveOutfit(outfit))
    return outfit
  }

  function removeOutfit(id: string) {
    outfits.value = outfits.value.filter(outfit => outfit.id !== id)
    commit(persist => persist.deleteOutfit(id))
  }

  function replaceOutfits(next: SavedOutfit[]) {
    outfits.value = next
    store.writeCache()
  }

  return { outfits, wornToday, record, removeOutfit, replaceOutfits }
}
