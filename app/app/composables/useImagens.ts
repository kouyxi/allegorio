import type { CollectionItem } from '~/types/domain'

/* A URL assinada do Supabase vale uma hora. Resolver de novo dez minutos antes
   evita a foto sumir no meio de uma sessão longa sem que nada tenha quebrado. */
const VIDA_MS = 50 * 60 * 1000

/* Fora do `useState` de propósito: são dados de janela, não estado de aplicação.
   Levá-los para o payload de hidratação mandaria URL assinada dentro do HTML. */
const validade = new Map<string, number>()
const emVoo = new Set<string>()

/**
 * Caminho de imagem para URL exibível.
 *
 * A resolução é preguiçosa e compartilhada: uma grade de acervo com trinta
 * itens pediria trinta URLs assinadas a cada renderização se cada cartão
 * cuidasse da sua.
 */
export function useImagens() {
  const store = useStore()
  const urls = useState<Record<string, string>>('image-urls', () => ({}))

  function resolver(caminho?: string) {
    if (!caminho || !import.meta.client) return

    const agora = Date.now()
    if (urls.value[caminho] && (validade.get(caminho) ?? 0) > agora) return
    if (emVoo.has(caminho)) return

    emVoo.add(caminho)
    store.persistence().imageUrl(caminho)
      .then(url => {
        if (!url) return

        /* No modo local a URL é `blob:` e prende o arquivo na memória da aba
           até alguém revogar. Sem isto, cada revalidação deixaria para trás uma
           foto inteira presa. */
        const anterior = urls.value[caminho]
        if (anterior?.startsWith('blob:') && anterior !== url) URL.revokeObjectURL(anterior)

        urls.value = { ...urls.value, [caminho]: url }
        validade.set(caminho, Date.now() + VIDA_MS)
      })
      .catch(() => undefined)
      .finally(() => emVoo.delete(caminho))
  }

  return { urls, resolver }
}

/** Açúcar para um item só, que é como todo componente usa. */
export function useImagemDoItem(item: MaybeRefOrGetter<CollectionItem | undefined>) {
  const { urls, resolver } = useImagens()
  const caminho = computed(() => toValue(item)?.imagePath)

  watch(caminho, valor => resolver(valor), { immediate: true })

  return computed(() => (caminho.value ? urls.value[caminho.value] : undefined))
}
