import {
  decodificar, finalizar, recortar, reduzir, amostrarParaRede, type FotoPronta
} from '~/utils/imagem'
import { LADO, caixaDaMascara, cobertura, endurecer, normalizarMascara, prepararEntrada } from '~/utils/recorte'
import { PESO_APROXIMADO_MB, carregarRede, inferir, redeDisponivel } from '~/utils/rede'

export type EstadoFoto = 'ocioso' | 'lendo' | 'baixando' | 'recortando' | 'pronto' | 'erro'

/* Máscara que cobre quase nada ou quase tudo significa que a rede não encontrou
   peça: foto contra parede da mesma cor, mão na frente, peça fora do quadro. Nesse
   caso a foto original vale mais que um recorte que apagou metade da camisa. */
const COBERTURA_MINIMA = 0.015
const COBERTURA_MAXIMA = 0.97

/**
 * Ciclo de vida da foto do item, do arquivo escolhido ao blob pronto para subir.
 *
 * O recorte é opcional e falha para o lado seguro: qualquer erro na rede vira
 * foto reduzida com fundo, nunca item sem imagem. Perder o fundo é cosmético,
 * perder a foto é perder a única coisa que distingue duas camisetas pretas.
 */
export function useFoto() {
  const estado = ref<EstadoFoto>('ocioso')
  const progresso = ref(0)
  const aviso = ref('')
  const foto = ref<FotoPronta | null>(null)
  const recorteDisponivel = ref<boolean | null>(null)
  const pesoMb = PESO_APROXIMADO_MB

  onMounted(async () => { recorteDisponivel.value = await redeDisponivel() })

  function descartar() {
    if (foto.value) URL.revokeObjectURL(foto.value.previa)
    foto.value = null
    aviso.value = ''
    estado.value = 'ocioso'
    progresso.value = 0
  }

  async function comRecorte(bitmap: ImageBitmap): Promise<FotoPronta | null> {
    /* Carregar e inferir em passos separados para a barra dizer a verdade: a
       primeira vez baixa por dezenas de segundos e depois pensa por dois, e uma
       barra só cobrindo as duas coisas ficaria parada na hora errada. */
    estado.value = 'baixando'
    progresso.value = 0
    await carregarRede(fracao => { progresso.value = fracao })

    estado.value = 'recortando'
    const bruta = await inferir(prepararEntrada(amostrarParaRede(bitmap)))
    const mascara = endurecer(normalizarMascara(bruta))
    const area = cobertura(mascara)

    if (area < COBERTURA_MINIMA || area > COBERTURA_MAXIMA) {
      aviso.value = 'Não consegui separar a peça do fundo. Guardei a foto inteira.'
      return null
    }

    return finalizar(recortar(bitmap, mascara, caixaDaMascara(mascara, LADO, LADO)), true)
  }

  /**
   * Processa o arquivo escolhido.
   *
   * `bitmap` é fechado no fim porque uma foto de 12 megapixels ocupa perto de
   * 48 MB descomprimidos, e trocar de foto três vezes numa aba já é motivo de
   * o navegador derrubar a página no celular.
   */
  async function escolher(arquivo: File, tentarRecorte: boolean) {
    descartar()
    estado.value = 'lendo'

    let bitmap: ImageBitmap | null = null
    try {
      bitmap = await decodificar(arquivo)

      if (tentarRecorte && recorteDisponivel.value !== false) {
        try {
          const recortada = await comRecorte(bitmap)
          if (recortada) {
            foto.value = recortada
            estado.value = 'pronto'
            return
          }
        } catch (causa) {
          aviso.value = causa instanceof Error
            ? `Recorte indisponível: ${causa.message} Guardei a foto inteira.`
            : 'Recorte indisponível. Guardei a foto inteira.'
        }
      }

      foto.value = await finalizar(reduzir(bitmap), false)
      estado.value = 'pronto'
    } catch (causa) {
      estado.value = 'erro'
      aviso.value = causa instanceof Error ? causa.message : 'Não consegui ler essa imagem.'
    } finally {
      bitmap?.close()
    }
  }

  onScopeDispose(() => { if (foto.value) URL.revokeObjectURL(foto.value.previa) })

  return { estado, progresso, aviso, foto, recorteDisponivel, pesoMb, escolher, descartar }
}
