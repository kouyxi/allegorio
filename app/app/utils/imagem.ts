/**
 * Manipulação da fotografia do item dentro do navegador.
 *
 * Tudo acontece no aparelho: a foto é decodificada, reduzida, recortada e
 * codificada antes de qualquer chamada de rede. O arquivo que sobe já é o
 * arquivo final, e não existe versão original guardada em servidor nenhum.
 */

import { LADO, type Caixa } from '~/utils/recorte'

/** Maior lado do arquivo guardado. Acima disso a foto vira peso de upload sem
 *  ganhar detalhe visível num cartão de 160px. */
export const LADO_MAXIMO = 1280

export interface FotoPronta {
  blob: Blob
  /** `image/webp` quando o navegador codifica com alfa, `image/png` senão */
  tipo: string
  largura: number
  altura: number
  /** true quando o fundo saiu e o arquivo tem canal alfa */
  recortada: boolean
  /** URL temporária para prévia; quem cria é quem revoga */
  previa: string
  /** Cor mais recorrente no objeto recortado. Só é aplicada automaticamente
   *  quando existe transparência, para a parede não virar a cor da roupa. */
  corHex?: string
}

type Tela = OffscreenCanvas | HTMLCanvasElement

function tela(largura: number, altura: number): Tela {
  if (typeof OffscreenCanvas !== 'undefined') return new OffscreenCanvas(largura, altura)
  const elemento = document.createElement('canvas')
  elemento.width = largura
  elemento.height = altura
  return elemento
}

function contexto(alvo: Tela): CanvasRenderingContext2D {
  const ctx = alvo.getContext('2d') as CanvasRenderingContext2D | null
  if (!ctx) throw new Error('Este navegador não desenha em canvas.')
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  return ctx
}

async function paraBlob(alvo: Tela, tipo: string, qualidade: number): Promise<Blob> {
  if ('convertToBlob' in alvo) return alvo.convertToBlob({ type: tipo, quality: qualidade })
  return new Promise((resolve, reject) => {
    ;(alvo as HTMLCanvasElement).toBlob(
      blob => (blob ? resolve(blob) : reject(new Error('Não consegui codificar a imagem.'))),
      tipo,
      qualidade
    )
  })
}

/**
 * Codifica preferindo WebP com alfa.
 *
 * O recorte precisa de transparência, e PNG de fotografia pesa perto de dez
 * vezes mais que o mesmo recorte em WebP, que também carrega alfa. Quando o
 * navegador não codifica WebP ele devolve PNG por conta própria, e o `type` do
 * blob denuncia isso: é por ele que a decisão é conferida, não por suposição.
 */
async function codificar(alvo: Tela, comAlfa: boolean): Promise<{ blob: Blob, tipo: string }> {
  const webp = await paraBlob(alvo, 'image/webp', comAlfa ? 0.92 : 0.86)
  if (webp.type === 'image/webp') return { blob: webp, tipo: 'image/webp' }

  const reserva = await paraBlob(alvo, comAlfa ? 'image/png' : 'image/jpeg', 0.86)
  return { blob: reserva, tipo: reserva.type || (comAlfa ? 'image/png' : 'image/jpeg') }
}

export function corDominante(dados: Uint8ClampedArray): string | undefined {
  const bins = new Map<string, { count: number, r: number, g: number, b: number }>()
  const step = dados.length > 160_000 ? 16 : 4

  for (let i = 0; i < dados.length; i += step) {
    const alpha = dados[i + 3] ?? 0
    if (alpha < 160) continue

    const r = dados[i] ?? 0
    const g = dados[i + 1] ?? 0
    const b = dados[i + 2] ?? 0
    const key = `${r >> 5}:${g >> 5}:${b >> 5}`
    const bin = bins.get(key) ?? { count: 0, r: 0, g: 0, b: 0 }
    bin.count += 1
    bin.r += r
    bin.g += g
    bin.b += b
    bins.set(key, bin)
  }

  const winner = [...bins.values()].sort((a, b) => b.count - a.count)[0]
  if (!winner) return undefined
  const channel = (value: number) => Math.round(value / winner.count).toString(16).padStart(2, '0')
  return `#${channel(winner.r)}${channel(winner.g)}${channel(winner.b)}`
}

function corDaTela(alvo: Tela): string | undefined {
  const amostra = tela(48, 48)
  const ctx = contexto(amostra)
  ctx.drawImage(alvo as CanvasImageSource, 0, 0, 48, 48)
  return corDominante(ctx.getImageData(0, 0, 48, 48).data)
}

/** Decodifica o arquivo já com a rotação do EXIF aplicada. Sem isso toda foto
 *  tirada de pé no iPhone chega deitada. */
export async function decodificar(arquivo: File | Blob): Promise<ImageBitmap> {
  return createImageBitmap(arquivo, { imageOrientation: 'from-image' })
}

function cabendoEm(largura: number, altura: number, maior: number) {
  const escala = Math.min(1, maior / Math.max(largura, altura))
  return {
    largura: Math.max(1, Math.round(largura * escala)),
    altura: Math.max(1, Math.round(altura * escala))
  }
}

/** RGBA de 320×320 esticado, que é o formato de entrada da rede. O
 *  esticamento é intencional: a U²-Net foi treinada assim. */
export function amostrarParaRede(bitmap: ImageBitmap): Uint8ClampedArray {
  const alvo = tela(LADO, LADO)
  const ctx = contexto(alvo)
  ctx.drawImage(bitmap, 0, 0, LADO, LADO)
  return ctx.getImageData(0, 0, LADO, LADO).data
}

/**
 * Compõe a foto com a máscara e corta na peça.
 *
 * A máscara de 320×320 é desenhada esticada até o tamanho final e usada como
 * `destination-in`, o que deixa a interpolação da borda por conta do navegador
 * em vez de um reamostrador escrito à mão.
 */
export function recortar(bitmap: ImageBitmap, mascara: Float32Array, caixa: Caixa | null): Tela {
  const corte = caixa ?? { x: 0, y: 0, largura: LADO, altura: LADO }
  const escalaX = bitmap.width / LADO
  const escalaY = bitmap.height / LADO

  const origem = {
    x: corte.x * escalaX,
    y: corte.y * escalaY,
    largura: corte.largura * escalaX,
    altura: corte.altura * escalaY
  }

  const { largura, altura } = cabendoEm(origem.largura, origem.altura, LADO_MAXIMO)
  const alvo = tela(largura, altura)
  const ctx = contexto(alvo)

  ctx.drawImage(bitmap, origem.x, origem.y, origem.largura, origem.altura, 0, 0, largura, altura)

  const cinza = tela(LADO, LADO)
  const ctxCinza = contexto(cinza)
  const dados = ctxCinza.createImageData(LADO, LADO)
  for (let i = 0; i < mascara.length; i += 1) {
    const valor = Math.round(mascara[i]! * 255)
    dados.data[i * 4] = valor
    dados.data[i * 4 + 1] = valor
    dados.data[i * 4 + 2] = valor
    dados.data[i * 4 + 3] = 255
  }
  ctxCinza.putImageData(dados, 0, 0)

  ctx.globalCompositeOperation = 'destination-in'
  ctx.drawImage(
    cinza as CanvasImageSource,
    corte.x, corte.y, corte.largura, corte.altura,
    0, 0, largura, altura
  )
  ctx.globalCompositeOperation = 'source-over'

  return alvo
}

/** Reduz sem mexer no fundo. É o caminho de quem desligou o recorte ou de quem
 *  está num navegador que não roda a rede. */
export function reduzir(bitmap: ImageBitmap): Tela {
  const { largura, altura } = cabendoEm(bitmap.width, bitmap.height, LADO_MAXIMO)
  const alvo = tela(largura, altura)
  contexto(alvo).drawImage(bitmap, 0, 0, largura, altura)
  return alvo
}

export async function finalizar(alvo: Tela, recortada: boolean): Promise<FotoPronta> {
  const { blob, tipo } = await codificar(alvo, recortada)
  const corHex = recortada ? corDaTela(alvo) : undefined
  return {
    blob,
    tipo,
    largura: alvo.width,
    altura: alvo.height,
    recortada,
    previa: URL.createObjectURL(blob),
    corHex
  }
}
