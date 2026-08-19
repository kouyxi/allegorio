import type { SupabaseClient } from '@supabase/supabase-js'
import type { Category, CollectionItem, SavedOutfit } from '~/types/domain'
import { apagarFoto, guardarFoto, lerFoto } from '~/utils/deposito'
import { fromCategory, fromItem, toCategory, toItem, toOutfit } from '~/utils/mapping'
import type { CategoryRow, ItemRow, OutfitRow } from '~/utils/mapping'

export const BUCKET_IMAGENS = 'item-images'

/** A extensão precisa bater com o `allowed_mime_types` do bucket. Tipo fora da
 *  lista é recusado pelo Storage com erro genérico, difícil de ler na tela. */
const EXTENSOES: Record<string, string> = {
  'image/webp': 'webp',
  'image/png': 'png',
  'image/jpeg': 'jpg'
}

function extensao(tipo: string) {
  const encontrada = EXTENSOES[tipo]
  if (!encontrada) throw new Error('Formato de imagem não aceito.')
  return encontrada
}

export interface Snapshot {
  items: CollectionItem[]
  categories: Category[]
  outfits: SavedOutfit[]
}

export interface Persistence {
  readonly remote: boolean
  load(): Promise<Snapshot | null>
  saveItems(items: CollectionItem[]): Promise<void>
  deleteItem(id: string): Promise<void>
  saveCategory(category: Category): Promise<void>
  deleteCategory(id: string): Promise<void>
  saveOutfit(outfit: SavedOutfit): Promise<void>
  deleteOutfit(id: string): Promise<void>
  replaceAll(snapshot: Snapshot): Promise<void>

  /** Grava a foto e devolve o caminho que vai no item. */
  saveImage(blob: Blob): Promise<string>
  /** Caminho para URL exibível. `undefined` quando o arquivo sumiu, o que é um
   *  estado alcançável: backup restaurado em outro aparelho traz o caminho sem
   *  os bytes. */
  imageUrl(path: string): Promise<string | undefined>
  deleteImage(path: string): Promise<void>
}

const LOCAL_KEYS = {
  items: 'allegorio:items:v1',
  categories: 'allegorio:categories:v1',
  outfits: 'allegorio:outfits:v2'
}

/**
 * Modo sem projeto configurado. Cada operação regrava o instantâneo inteiro,
 * que é grosseiro mas honesto para o volume envolvido, e mantém o protótipo
 * utilizável para quem clona o repositório sem Supabase.
 */
export function createLocalPersistence(snapshot: () => Snapshot): Persistence {
  function dump() {
    const current = snapshot()
    localStorage.setItem(LOCAL_KEYS.items, JSON.stringify(current.items))
    localStorage.setItem(LOCAL_KEYS.categories, JSON.stringify(current.categories))
    localStorage.setItem(LOCAL_KEYS.outfits, JSON.stringify(current.outfits))
  }

  function read<T>(key: string): T[] | null {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    try { return JSON.parse(raw) as T[] } catch { return null }
  }

  return {
    remote: false,
    async load() {
      const items = read<CollectionItem>(LOCAL_KEYS.items)
      const categories = read<Category>(LOCAL_KEYS.categories)
      if (!items || !categories) return null
      return { items, categories, outfits: read<SavedOutfit>(LOCAL_KEYS.outfits) ?? [] }
    },
    async saveItems() { dump() },
    async deleteItem() { dump() },
    async saveCategory() { dump() },
    async deleteCategory() { dump() },
    async saveOutfit() { dump() },
    async deleteOutfit() { dump() },
    async replaceAll() { dump() },

    async saveImage(blob) {
      const chave = `local/${crypto.randomUUID()}.${extensao(blob.type)}`
      await guardarFoto(chave, blob)
      return chave
    },
    async imageUrl(path) {
      const blob = await lerFoto(path)
      return blob ? URL.createObjectURL(blob) : undefined
    },
    async deleteImage(path) {
      await apagarFoto(path)
    }
  }
}

/** Traduz o erro do Postgres para algo que sirva na tela. */
function fail(action: string, error: { message: string, code?: string } | null): void {
  if (!error) return
  if (error.code === '23505') throw new Error('Já existe um registro com esse nome.')
  if (error.code === '23503') throw new Error('Esse registro depende de outro que não existe mais.')
  if (error.code === '23514') throw new Error('Algum campo saiu da faixa aceita.')
  throw new Error(`${action}: ${error.message}`)
}

export function createSupabasePersistence(client: SupabaseClient, userId: string): Persistence {
  const owned = <T>(rows: T[]) => rows.map(row => ({ ...row, user_id: userId }))

  return {
    remote: true,

    async load() {
      const [categories, items, outfits] = await Promise.all([
        client.from('categories').select('*').order('name'),
        client.from('items').select('*').order('created_at', { ascending: false }),
        client.from('outfits')
          .select('*, outfit_items(item_id, position)')
          .order('created_at', { ascending: false })
      ])

      fail('Carregar categorias', categories.error)
      fail('Carregar itens', items.error)
      fail('Carregar combinações', outfits.error)

      return {
        categories: (categories.data as CategoryRow[]).map(toCategory),
        items: (items.data as ItemRow[]).map(toItem),
        outfits: (outfits.data as OutfitRow[]).map(toOutfit)
      }
    },

    async saveItems(items) {
      if (!items.length) return
      const { error } = await client.from('items').upsert(owned(items.map(fromItem)))
      fail('Salvar item', error)
    },

    async deleteItem(id) {
      const { error } = await client.from('items').delete().eq('id', id)
      fail('Remover item', error)
    },

    async saveCategory(category) {
      const { error } = await client.from('categories').upsert(owned([fromCategory(category)]))
      fail('Salvar categoria', error)
    },

    async deleteCategory(id) {
      const { error } = await client.from('categories').delete().eq('id', id)
      fail('Remover categoria', error)
    },

    async saveOutfit(outfit) {
      const { error } = await client.from('outfits').upsert([{
        id: outfit.id,
        user_id: userId,
        name: outfit.name,
        context_id: outfit.contextId,
        climate: outfit.climate,
        worn: outfit.worn
      }])
      fail('Salvar combinação', error)

      if (!outfit.itemIds.length) return
      const links = await client.from('outfit_items').upsert(outfit.itemIds.map((itemId, position) => ({
        outfit_id: outfit.id,
        item_id: itemId,
        user_id: userId,
        position
      })))
      fail('Salvar peças da combinação', links.error)
    },

    async deleteOutfit(id) {
      const { error } = await client.from('outfits').delete().eq('id', id)
      fail('Remover combinação', error)
    },

    /* A primeira pasta do caminho é o id do usuário, que é exatamente o que a
       política do bucket confere. Sem esse prefixo o upload volta 403. */
    async saveImage(blob) {
      const caminho = `${userId}/${crypto.randomUUID()}.${extensao(blob.type)}`
      const { error } = await client.storage
        .from(BUCKET_IMAGENS)
        .upload(caminho, blob, { contentType: blob.type, upsert: false })

      if (error) throw new Error(`Enviar foto: ${error.message}`)
      return caminho
    },

    /* O bucket é privado, então a exibição usa URL assinada. Uma hora cobre a
       sessão de uso e ainda expira rápido o bastante para que um link copiado
       do inspetor não vire acesso permanente ao acervo. */
    async imageUrl(path) {
      const { data, error } = await client.storage
        .from(BUCKET_IMAGENS)
        .createSignedUrl(path, 3600)

      if (error || !data) return undefined
      return data.signedUrl
    },

    async deleteImage(path) {
      await client.storage.from(BUCKET_IMAGENS).remove([path])
    },

    /* Restaurar backup é voltar a um estado, então apaga antes de inserir. A
       ordem importa: item aponta para categoria com `on delete restrict`, então
       categoria só sai depois que os itens saíram. */
    async replaceAll(snapshot) {
      for (const table of ['outfits', 'items', 'categories']) {
        const { error } = await client.from(table).delete().eq('user_id', userId)
        fail(`Limpar ${table}`, error)
      }

      if (snapshot.categories.length) {
        const { error } = await client.from('categories').insert(owned(snapshot.categories.map(fromCategory)))
        fail('Restaurar categorias', error)
      }
      if (snapshot.items.length) {
        const { error } = await client.from('items').insert(owned(snapshot.items.map(fromItem)))
        fail('Restaurar itens', error)
      }
      for (const outfit of snapshot.outfits) {
        await this.saveOutfit(outfit)
      }
    }
  }
}
