/**
 * Depósito local de fotos, em IndexedDB.
 *
 * `localStorage` está fora de questão: ele guarda texto, o que obrigaria a
 * converter cada foto para base64 (mais um terço de tamanho) dentro de uma cota
 * de 5 MB compartilhada com o acervo inteiro. Duas fotos e o acervo pararia de
 * salvar. IndexedDB guarda `Blob` direto e tem cota de disco.
 *
 * Vale só para quem roda sem Supabase. Com sessão, a foto vive no bucket.
 */

const BANCO = 'allegorio-imagens'
const ARMAZEM = 'fotos'

let conexao: Promise<IDBDatabase> | null = null

function abrir(): Promise<IDBDatabase> {
  conexao ??= new Promise((resolve, reject) => {
    const pedido = indexedDB.open(BANCO, 1)
    pedido.onupgradeneeded = () => {
      if (!pedido.result.objectStoreNames.contains(ARMAZEM)) pedido.result.createObjectStore(ARMAZEM)
    }
    pedido.onsuccess = () => resolve(pedido.result)
    pedido.onerror = () => reject(pedido.error ?? new Error('Não consegui abrir o depósito de fotos.'))
  })
  return conexao
}

function transacao<T>(modo: IDBTransactionMode, executar: (armazem: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return abrir().then(banco => new Promise<T>((resolve, reject) => {
    const pedido = executar(banco.transaction(ARMAZEM, modo).objectStore(ARMAZEM))
    pedido.onsuccess = () => resolve(pedido.result)
    pedido.onerror = () => reject(pedido.error ?? new Error('Falha no depósito de fotos.'))
  }))
}

export function guardarFoto(chave: string, blob: Blob) {
  return transacao('readwrite', armazem => armazem.put(blob, chave)).then(() => undefined)
}

export function lerFoto(chave: string) {
  return transacao<Blob | undefined>('readonly', armazem => armazem.get(chave))
}

export function apagarFoto(chave: string) {
  return transacao('readwrite', armazem => armazem.delete(chave)).then(() => undefined)
}
