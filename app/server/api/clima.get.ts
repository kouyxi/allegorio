import { climaPorTemperatura, type LeituraClima } from '#shared/clima'

/**
 * Temperatura de agora, para a tela Hoje não precisar de um botão de clima.
 *
 * A promessa do aplicativo é não obrigar a pessoa a decidir de manhã, e um
 * seletor de clima que ela aperta todo dia contraria isso: a informação existe,
 * só não estava sendo buscada.
 *
 * A localização sai da própria borda da Cloudflare, que já conhece a cidade
 * aproximada de quem fez o pedido. É de graça, não precisa de permissão e não
 * acorda o GPS. Quando a pessoa quer precisão, a tela manda `lat` e `lon` do
 * navegador e esses valores ganham do palpite da borda.
 *
 * A coordenada é arredondada para duas casas, cerca de um quilômetro, antes de
 * sair daqui. O Open-Meteo não precisa de mais que isso para dizer a
 * temperatura, e mandar a posição cheia seria entregar mais do que o serviço
 * pede. Nada é gravado: a resposta é calculada e esquecida.
 */
export default defineEventHandler(async (event): Promise<LeituraClima> => {
  const consulta = getQuery(event)
  const borda = event.context.cf as { latitude?: string, longitude?: string, city?: string } | undefined

  let latitude = Number(consulta.lat)
  let longitude = Number(consulta.lon)
  let cidade: string | undefined
  let origem: 'rede' | 'aparelho' = 'aparelho'

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    latitude = Number(borda?.latitude)
    longitude = Number(borda?.longitude)
    cidade = borda?.city ?? getRequestHeader(event, 'cf-ipcity')
    origem = 'rede'
  }

  /* Em desenvolvimento não existe borda nenhuma, então a resposta é um "não
     sei" explícito. A tela trata isso mantendo o seletor manual, que continua
     sendo o caminho de quem recusa a localização. */
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return { disponivel: false, motivo: 'sem-local' }
  }

  const parametros = new URLSearchParams({
    latitude: (Math.round(latitude * 100) / 100).toString(),
    longitude: (Math.round(longitude * 100) / 100).toString(),
    current: 'apparent_temperature',
    timezone: 'auto'
  })

  try {
    const resposta = await $fetch<{ current?: { apparent_temperature?: number } }>(
      `https://api.open-meteo.com/v1/forecast?${parametros}`,
      { timeout: 4000 }
    )

    const sensacao = resposta.current?.apparent_temperature
    if (typeof sensacao !== 'number') return { disponivel: false, motivo: 'sem-resposta' }

    /* Quinze minutos de cache na borda. A temperatura não muda mais rápido que
       isso e o Open-Meteo é um serviço gratuito que não merece um pedido por
       abertura de aplicativo. */
    setResponseHeader(event, 'cache-control', 'public, max-age=900, s-maxage=900')

    return {
      disponivel: true,
      temperatura: Math.round(sensacao),
      clima: climaPorTemperatura(sensacao),
      cidade: cidade || undefined,
      origem
    }
  } catch {
    return { disponivel: false, motivo: 'sem-resposta' }
  }
})
