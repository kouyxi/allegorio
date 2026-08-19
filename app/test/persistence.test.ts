import { describe, expect, it } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'
import { createSupabasePersistence } from '~/utils/persistence'
import { CATEGORIES, item } from './fixtures'

interface Call { table: string, op: string, payload?: unknown, filters: [string, unknown][] }

/**
 * Cliente falso que registra a chamada e finge a resposta. Serve para provar o
 * formato do que sai daqui sem tocar num projeto real: nome de tabela errado ou
 * `user_id` esquecido aparece no teste, não em produção.
 */
function fakeClient(fail?: { code?: string, message: string }) {
  const calls: Call[] = []

  const client = {
    from(table: string) {
      const call: Call = { table, op: '', filters: [] }
      const result = { data: [], error: fail ?? null }

      const builder = {
        select(_columns?: string) { call.op = 'select'; calls.push(call); return builder },
        insert(payload: unknown) { call.op = 'insert'; call.payload = payload; calls.push(call); return builder },
        upsert(payload: unknown) { call.op = 'upsert'; call.payload = payload; calls.push(call); return builder },
        delete() { call.op = 'delete'; calls.push(call); return builder },
        eq(column: string, value: unknown) { call.filters.push([column, value]); return builder },
        order(_column: string, _options?: unknown) { return builder },
        then(resolve: (value: typeof result) => unknown) { return Promise.resolve(result).then(resolve) }
      }

      return builder
    }
  } as unknown as SupabaseClient

  return { client, calls }
}

const ITEM = item({ id: 'i1', categoryId: 'c-top', name: 'Camisa' })

describe('createSupabasePersistence', () => {
  it('carrega as três tabelas e traz as peças da combinação junto', async () => {
    const { client, calls } = fakeClient()
    await createSupabasePersistence(client, 'u1').load()

    expect(calls.map(call => call.table)).toEqual(['categories', 'items', 'outfits'])
    expect(calls.every(call => call.op === 'select')).toBe(true)
  })

  it('carimba user_id em toda linha gravada', async () => {
    const { client, calls } = fakeClient()
    await createSupabasePersistence(client, 'u1').saveItems([ITEM])

    const payload = calls[0]!.payload as { user_id: string, id: string }[]
    expect(calls[0]!.table).toBe('items')
    expect(calls[0]!.op).toBe('upsert')
    expect(payload[0]!.user_id).toBe('u1')
    expect(payload[0]!.id).toBe('i1')
  })

  it('grava em lote em vez de uma chamada por peça', async () => {
    const { client, calls } = fakeClient()
    const items = ['a', 'b', 'c'].map(id => item({ id, categoryId: 'c-top' }))
    await createSupabasePersistence(client, 'u1').saveItems(items)

    expect(calls).toHaveLength(1)
    expect((calls[0]!.payload as unknown[])).toHaveLength(3)
  })

  it('não vai à rede quando não há nada para gravar', async () => {
    const { client, calls } = fakeClient()
    await createSupabasePersistence(client, 'u1').saveItems([])
    expect(calls).toHaveLength(0)
  })

  it('grava a combinação e depois o vínculo com as peças, na ordem', async () => {
    const { client, calls } = fakeClient()
    await createSupabasePersistence(client, 'u1').saveOutfit({
      id: 'o1', name: 'Usado', contextId: 'work', climate: 'mild',
      itemIds: ['a', 'b'], createdAt: '', worn: true
    })

    expect(calls.map(call => call.table)).toEqual(['outfits', 'outfit_items'])
    const links = calls[1]!.payload as { item_id: string, position: number }[]
    expect(links).toEqual([
      { outfit_id: 'o1', item_id: 'a', user_id: 'u1', position: 0 },
      { outfit_id: 'o1', item_id: 'b', user_id: 'u1', position: 1 }
    ])
  })

  it('apaga na ordem que a chave estrangeira permite', async () => {
    const { client, calls } = fakeClient()
    await createSupabasePersistence(client, 'u1').replaceAll({
      items: [ITEM], categories: CATEGORIES, outfits: []
    })

    // item aponta para categoria com `on delete restrict`: categoria só sai
    // depois que os itens saíram
    const deletes = calls.filter(call => call.op === 'delete').map(call => call.table)
    expect(deletes).toEqual(['outfits', 'items', 'categories'])

    // e insere na ordem inversa, senão o item não acha a categoria
    const inserts = calls.filter(call => call.op === 'insert').map(call => call.table)
    expect(inserts).toEqual(['categories', 'items'])
  })

  it('limpa só as linhas do próprio usuário', async () => {
    const { client, calls } = fakeClient()
    await createSupabasePersistence(client, 'u1').replaceAll({ items: [], categories: [], outfits: [] })

    for (const call of calls.filter(entry => entry.op === 'delete')) {
      expect(call.filters).toContainEqual(['user_id', 'u1'])
    }
  })

  it('traduz violação de unicidade em recado utilizável', async () => {
    const { client } = fakeClient({ code: '23505', message: 'duplicate key value' })
    await expect(createSupabasePersistence(client, 'u1').saveCategory(CATEGORIES[0]!))
      .rejects.toThrow('Já existe um registro com esse nome.')
  })

  it('traduz violação de faixa e de referência', async () => {
    const range = fakeClient({ code: '23514', message: 'check constraint' })
    await expect(createSupabasePersistence(range.client, 'u1').saveItems([ITEM]))
      .rejects.toThrow('Algum campo saiu da faixa aceita.')

    const fk = fakeClient({ code: '23503', message: 'foreign key' })
    await expect(createSupabasePersistence(fk.client, 'u1').saveItems([ITEM]))
      .rejects.toThrow('depende de outro que não existe mais')
  })

  it('erro desconhecido chega com a ação que falhou', async () => {
    const { client } = fakeClient({ message: 'connection reset' })
    await expect(createSupabasePersistence(client, 'u1').load())
      .rejects.toThrow(/Carregar categorias: connection reset/)
  })
})
