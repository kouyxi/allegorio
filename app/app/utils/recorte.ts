/**
 * Recorte de fundo da fotografia do item.
 *
 * A rede é a U²-Netp, a variante pequena da U²-Net (Apache-2.0, 4,4 MB), rodando
 * no próprio aparelho com onnxruntime-web. Nenhum byte da foto sai do telefone,
 * o que importa porque o acervo é privado e a foto costuma ser tirada dentro de
 * casa.
 *
 * A matemática mora aqui e não toca em canvas de propósito: entra buffer RGBA,
 * sai buffer. É o que permite rodar a mesma função num teste de nó e confirmar
 * que a máscara separa peça de fundo sem depender de navegador.
 */

/** Lado da entrada da rede. A U²-Net foi treinada em 320×320 e degrada fora disso. */
export const LADO = 320

/* Normalização do treino original (ImageNet). Trocar estes números por 0,5
   parece inofensivo e derruba a máscara para cinza uniforme. */
const MEDIA = [0.485, 0.456, 0.406]
const DESVIO = [0.229, 0.224, 0.225]

/**
 * RGBA de 320×320 para o tensor NCHW que a rede espera.
 *
 * A divisão é pelo maior canal da imagem, e não por 255, porque é assim que o
 * `ToTensorLab` do repositório original prepara o dado: uma foto inteira
 * subexposta é reescalada antes de normalizar.
 */
export function prepararEntrada(rgba: Uint8ClampedArray | Uint8Array): Float32Array {
  const pixels = LADO * LADO
  if (rgba.length < pixels * 4) {
    throw new Error(`Entrada precisa ter ${LADO}×${LADO} pixels em RGBA.`)
  }

  let maior = 0
  for (let i = 0; i < pixels; i += 1) {
    const base = i * 4
    if (rgba[base]! > maior) maior = rgba[base]!
    if (rgba[base + 1]! > maior) maior = rgba[base + 1]!
    if (rgba[base + 2]! > maior) maior = rgba[base + 2]!
  }
  if (maior === 0) maior = 1

  const tensor = new Float32Array(3 * pixels)
  for (let i = 0; i < pixels; i += 1) {
    const base = i * 4
    for (let canal = 0; canal < 3; canal += 1) {
      tensor[canal * pixels + i] = (rgba[base + canal]! / maior - MEDIA[canal]!) / DESVIO[canal]!
    }
  }
  return tensor
}

/**
 * Saída bruta da rede para máscara de 0 a 1.
 *
 * A normalização min-max é obrigatória: a U²-Net entrega logits com faixa
 * variável por imagem, e usar o valor cru como alfa deixa a peça translúcida.
 */
export function normalizarMascara(saida: Float32Array | number[]): Float32Array {
  let min = Infinity
  let max = -Infinity
  for (const valor of saida) {
    if (valor < min) min = valor
    if (valor > max) max = valor
  }

  const faixa = max - min
  const mascara = new Float32Array(saida.length)
  if (faixa <= 1e-6) return mascara

  for (let i = 0; i < saida.length; i += 1) mascara[i] = (saida[i]! - min) / faixa
  return mascara
}

/**
 * Endurece a borda da máscara.
 *
 * A U²-Netp entrega transição larga, e alfa largo sobre o campo claro do cartão
 * vira um halo cinza em volta da peça. A rampa corta o rastro sem chegar a
 * limiar duro, que serrilharia a silhueta.
 */
export function endurecer(mascara: Float32Array, piso = 0.14, teto = 0.72): Float32Array {
  const saida = new Float32Array(mascara.length)
  const faixa = Math.max(teto - piso, 1e-6)

  for (let i = 0; i < mascara.length; i += 1) {
    const t = Math.min(1, Math.max(0, (mascara[i]! - piso) / faixa))
    saida[i] = t * t * (3 - 2 * t)
  }
  return saida
}

export interface Caixa { x: number, y: number, largura: number, altura: number }

/**
 * Menor retângulo que contém a peça, com folga proporcional.
 *
 * Sem isso a foto recortada guarda o enquadramento do celular, e uma camiseta
 * fotografada de longe vira um selo pequeno no meio do cartão. Cortar na peça é
 * o que faz o resultado ler como prancha técnica.
 */
export function caixaDaMascara(
  mascara: Float32Array,
  largura: number,
  altura: number,
  limiar = 0.5,
  folga = 0.04
): Caixa | null {
  let esquerda = largura
  let direita = -1
  let topo = altura
  let base = -1

  for (let y = 0; y < altura; y += 1) {
    for (let x = 0; x < largura; x += 1) {
      if (mascara[y * largura + x]! < limiar) continue
      if (x < esquerda) esquerda = x
      if (x > direita) direita = x
      if (y < topo) topo = y
      if (y > base) base = y
    }
  }

  if (direita < esquerda || base < topo) return null

  const margem = Math.round(Math.max(largura, altura) * folga)
  esquerda = Math.max(0, esquerda - margem)
  topo = Math.max(0, topo - margem)
  direita = Math.min(largura - 1, direita + margem)
  base = Math.min(altura - 1, base + margem)

  return {
    x: esquerda,
    y: topo,
    largura: direita - esquerda + 1,
    altura: base - topo + 1
  }
}

/**
 * Quanto da imagem a peça ocupa.
 *
 * Serve de guarda: máscara que cobre quase tudo ou quase nada significa que a
 * rede não achou peça nenhuma, e nesse caso vale mais salvar a foto original do
 * que entregar um recorte errado.
 */
export function cobertura(mascara: Float32Array, limiar = 0.5): number {
  let dentro = 0
  for (const valor of mascara) if (valor >= limiar) dentro += 1
  return dentro / mascara.length
}
