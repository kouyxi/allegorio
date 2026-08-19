/**
 * Carga e execução da U²-Netp no navegador.
 *
 * O peso é o motivo de tudo aqui ser preguiçoso: o runtime WebAssembly tem 13 MB
 * e a rede tem 4,4 MB. Ninguém baixa isso ao abrir o aplicativo. Só quem pede
 * recorte paga, uma vez, e o cache do navegador cobre as vezes seguintes.
 *
 * Os dois arquivos são servidos pelo próprio domínio, e não por CDN de terceiro,
 * porque uma foto de acervo privado não deveria depender de um host externo
 * estar de pé nem saber que o pedido existiu.
 */

import { LADO } from '~/utils/recorte'

export const CAMINHO_MODELO = '/modelos/u2netp.onnx'
export const CAMINHO_RUNTIME = '/ort/'

/** Bytes que o primeiro recorte baixa: runtime mais rede. Vira texto na tela,
 *  porque pedir 18 MB sem avisar num aparelho no 4G é falta de educação. */
export const PESO_APROXIMADO_MB = 18

type Sessao = import('onnxruntime-web').InferenceSession

let sessao: Promise<Sessao> | null = null
let disponivel: Promise<boolean> | null = null

/** O recorte só aparece na interface se os arquivos foram publicados. Sem esta
 *  checagem o botão existiria e falharia com 404 depois de o usuário esperar. */
export function redeDisponivel(): Promise<boolean> {
  disponivel ??= (async () => {
    try {
      const resposta = await fetch(CAMINHO_MODELO, { method: 'HEAD' })
      return resposta.ok
    } catch {
      return false
    }
  })()
  return disponivel
}

async function baixarModelo(aoProgredir?: (fracao: number) => void): Promise<ArrayBuffer> {
  const resposta = await fetch(CAMINHO_MODELO)
  if (!resposta.ok) throw new Error('O recortador não está publicado neste servidor.')

  const total = Number(resposta.headers.get('content-length') ?? 0)
  if (!resposta.body || !total) return resposta.arrayBuffer()

  const leitor = resposta.body.getReader()
  const partes: Uint8Array[] = []
  let lidos = 0

  for (;;) {
    const { done, value } = await leitor.read()
    if (done) break
    partes.push(value)
    lidos += value.length
    aoProgredir?.(Math.min(1, lidos / total))
  }

  const buffer = new Uint8Array(lidos)
  let posicao = 0
  for (const parte of partes) {
    buffer.set(parte, posicao)
    posicao += parte.length
  }
  return buffer.buffer
}

async function abrir(aoProgredir?: (fracao: number) => void): Promise<Sessao> {
  /* `onnxruntime-web/wasm` é a variante só de CPU, com o carregador embutido:
     o único arquivo externo é o `.wasm`. As variantes com WebGPU trazem quase
     um megabyte a mais de JavaScript para ganhar velocidade numa tarefa que
     roda uma vez por foto. */
  const ort = await import('onnxruntime-web/wasm')

  ort.env.wasm.wasmPaths = CAMINHO_RUNTIME
  /* Uma thread por decisão. Mais de uma exige SharedArrayBuffer, que exige
     COOP e COEP no documento, e esses cabeçalhos quebram o `<input type=file>`
     e o iframe do próprio Supabase. Segundo e meio a mais vale menos que isso. */
  ort.env.wasm.numThreads = 1
  ort.env.logLevel = 'error'

  const modelo = await baixarModelo(aoProgredir)
  return ort.InferenceSession.create(modelo, {
    executionProviders: ['wasm'],
    graphOptimizationLevel: 'all'
  })
}

export function carregarRede(aoProgredir?: (fracao: number) => void): Promise<Sessao> {
  sessao ??= abrir(aoProgredir).catch(erro => {
    sessao = null
    throw erro
  })
  return sessao
}

/**
 * Roda a rede e devolve o primeiro mapa de saída, ainda cru.
 *
 * A U²-Net publica sete saídas: a fundida e as seis intermediárias de cada
 * estágio. Só a primeira interessa, e ela vem sempre em `outputNames[0]`.
 */
export async function inferir(entrada: Float32Array, aoProgredir?: (fracao: number) => void): Promise<Float32Array> {
  const ort = await import('onnxruntime-web/wasm')
  const ativa = await carregarRede(aoProgredir)

  const tensor = new ort.Tensor('float32', entrada, [1, 3, LADO, LADO])
  const saida = await ativa.run({ [ativa.inputNames[0]!]: tensor })
  const primeira = saida[ativa.outputNames[0]!]

  if (!primeira) throw new Error('A rede não devolveu máscara.')
  return primeira.data as Float32Array
}
