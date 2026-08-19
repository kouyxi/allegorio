import type { LeituraClima } from '#shared/clima'
import type { Climate } from '~/types/domain'

const CHAVE = 'allegorio:clima:v1'
/* Meia hora. Abrir o aplicativo três vezes numa manhã não deveria render três
   pedidos, e a sensação térmica não vira outra coisa nesse intervalo. */
const VALIDADE_MS = 30 * 60 * 1000

interface Guardado extends LeituraClima { em: number }

/**
 * Clima de agora, buscado sozinho.
 *
 * Antes a temperatura era um botão que a pessoa apertava toda manhã, o que
 * contraria a promessa de não ter que decidir nada para receber a sugestão.
 *
 * A ordem é deliberada: primeiro o que está guardado, para a tela abrir sem
 * esperar rede; depois o palpite da borda, que não custa permissão nenhuma;
 * e o GPS só quando a pessoa pede precisão, apertando o botão de local.
 */
export function useClima() {
  const leitura = useState<LeituraClima | null>('clima-leitura', () => null)
  const carregando = useState('clima-carregando', () => false)
  /* Escolher clima na mão desliga o automático até a próxima sessão. Deixar o
     servidor sobrescrever a escolha manual seria ignorar a pessoa. */
  const manual = useState('clima-manual', () => false)

  function ler(): Guardado | null {
    try {
      const bruto = localStorage.getItem(CHAVE)
      if (!bruto) return null
      const guardado = JSON.parse(bruto) as Guardado
      return Date.now() - guardado.em < VALIDADE_MS ? guardado : null
    } catch {
      return null
    }
  }

  async function buscar(coordenadas?: { lat: number, lon: number }) {
    if (carregando.value) return
    carregando.value = true

    try {
      const resposta = await $fetch<LeituraClima>('/api/clima', {
        query: coordenadas ? { lat: coordenadas.lat, lon: coordenadas.lon } : undefined
      })

      leitura.value = resposta
      if (resposta.disponivel) {
        localStorage.setItem(CHAVE, JSON.stringify({ ...resposta, em: Date.now() }))
      }
    } catch {
      leitura.value = { disponivel: false, motivo: 'sem-resposta' }
    } finally {
      carregando.value = false
    }
  }

  /** Sobe para o GPS. Só a pedido: pedir permissão de localização sem que a
   *  pessoa tenha clicado em nada é o tipo de coisa que faz desinstalar. */
  function precisar() {
    if (!navigator.geolocation) return buscar()

    return new Promise<void>(resolve => {
      navigator.geolocation.getCurrentPosition(
        posicao => {
          buscar({ lat: posicao.coords.latitude, lon: posicao.coords.longitude }).finally(resolve)
        },
        () => { buscar().finally(resolve) },
        { timeout: 8000, maximumAge: 15 * 60 * 1000 }
      )
    })
  }

  function iniciar(aplicar: (clima: Climate) => void) {
    onMounted(async () => {
      const guardado = ler()
      if (guardado) {
        leitura.value = guardado
      } else {
        await buscar()
      }

      if (!manual.value && leitura.value?.disponivel && leitura.value.clima) {
        aplicar(leitura.value.clima)
      }
    })
  }

  return { leitura, carregando, manual, buscar, precisar, iniciar }
}
