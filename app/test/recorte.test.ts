import { describe, expect, it } from 'vitest'
import {
  LADO, caixaDaMascara, cobertura, endurecer, normalizarMascara, prepararEntrada
} from '~/utils/recorte'

/** RGBA de 320×320 com um retângulo claro sobre fundo escuro. */
function quadro(caixa = { x: 100, y: 80, largura: 120, altura: 160 }) {
  const rgba = new Uint8ClampedArray(LADO * LADO * 4)
  for (let y = 0; y < LADO; y += 1) {
    for (let x = 0; x < LADO; x += 1) {
      const dentro = x >= caixa.x && x < caixa.x + caixa.largura
        && y >= caixa.y && y < caixa.y + caixa.altura
      const base = (y * LADO + x) * 4
      const valor = dentro ? 240 : 30
      rgba[base] = valor
      rgba[base + 1] = valor
      rgba[base + 2] = valor
      rgba[base + 3] = 255
    }
  }
  return rgba
}

function mascaraDe(caixa: { x: number, y: number, largura: number, altura: number }) {
  const mascara = new Float32Array(LADO * LADO)
  for (let y = caixa.y; y < caixa.y + caixa.altura; y += 1) {
    for (let x = caixa.x; x < caixa.x + caixa.largura; x += 1) mascara[y * LADO + x] = 1
  }
  return mascara
}

describe('prepararEntrada', () => {
  it('entrega NCHW com três canais', () => {
    expect(prepararEntrada(quadro()).length).toBe(3 * LADO * LADO)
  })

  it('normaliza pelo maior canal e não por 255', () => {
    // É assim que o `ToTensorLab` do repositório original prepara o dado. Uma
    // foto inteira subexposta é reescalada antes de normalizar, e trocar isso
    // por /255 muda a distribuição que a rede viu no treino.
    const escura = new Uint8ClampedArray(LADO * LADO * 4).fill(60)
    const clara = new Uint8ClampedArray(LADO * LADO * 4).fill(255)

    expect(prepararEntrada(escura)[0]).toBeCloseTo(prepararEntrada(clara)[0]!, 5)
  })

  it('recusa buffer menor que a caixa da rede', () => {
    expect(() => prepararEntrada(new Uint8ClampedArray(4))).toThrow()
  })
})

describe('normalizarMascara', () => {
  it('estica a saída para a faixa de 0 a 1', () => {
    const mascara = normalizarMascara([-3, 0, 1, 5])
    expect(mascara[0]).toBe(0)
    expect(mascara[3]).toBe(1)
  })

  it('devolve tudo zero quando a saída é constante', () => {
    // Sem esta guarda a divisão por faixa zero produziria NaN, e alfa NaN
    // apaga a imagem inteira em vez de manter o fundo
    expect([...normalizarMascara([2, 2, 2])]).toEqual([0, 0, 0])
  })
})

describe('endurecer', () => {
  it('mantém a faixa e leva os extremos ao limite', () => {
    const dura = endurecer(new Float32Array([0, 0.1, 0.5, 0.9, 1]))
    expect(dura[0]).toBe(0)
    expect(dura[4]).toBe(1)
    for (const valor of dura) expect(valor).toBeGreaterThanOrEqual(0)
  })

  it('empurra o meio-tom para longe do cinza', () => {
    // O rastro largo da U²-Netp vira halo em volta da peça sobre o campo claro
    const antes = 0.3
    const depois = endurecer(new Float32Array([antes]))[0]!
    expect(depois).toBeLessThan(antes)
  })
})

describe('caixaDaMascara', () => {
  it('encontra o retângulo da peça com folga', () => {
    const caixa = caixaDaMascara(mascaraDe({ x: 100, y: 80, largura: 120, altura: 160 }), LADO, LADO)

    expect(caixa).not.toBeNull()
    expect(caixa!.x).toBeLessThan(100)
    expect(caixa!.largura).toBeGreaterThan(120)
    expect(caixa!.x + caixa!.largura).toBeLessThanOrEqual(LADO)
    expect(caixa!.y + caixa!.altura).toBeLessThanOrEqual(LADO)
  })

  it('não estoura a borda quando a peça encosta nela', () => {
    const caixa = caixaDaMascara(mascaraDe({ x: 0, y: 0, largura: LADO, altura: LADO }), LADO, LADO)
    expect(caixa).toEqual({ x: 0, y: 0, largura: LADO, altura: LADO })
  })

  it('devolve nulo quando não há nada acima do limiar', () => {
    expect(caixaDaMascara(new Float32Array(LADO * LADO), LADO, LADO)).toBeNull()
  })
})

describe('cobertura', () => {
  it('mede a fração da imagem ocupada pela peça', () => {
    const mascara = mascaraDe({ x: 0, y: 0, largura: LADO, altura: LADO / 2 })
    expect(cobertura(mascara)).toBeCloseTo(0.5, 3)
  })

  it('é o que separa recorte bom de recorte que apagou a peça', () => {
    // A tela usa este número para decidir entre guardar o recorte e guardar a
    // foto inteira: quase zero é peça sumida, quase um é fundo não encontrado
    expect(cobertura(new Float32Array(LADO * LADO))).toBe(0)
    expect(cobertura(new Float32Array(LADO * LADO).fill(1))).toBe(1)
  })
})
