/**
 * Baixa e posiciona os arquivos do recorte de fundo.
 *
 * Os dois são binários grandes e não entram no repositório: 4,4 MB da rede e
 * 13 MB do runtime WebAssembly. Guardá-los no Git deixaria o clone pesado para
 * sempre e por uma coisa que se refaz com um comando.
 *
 * O script é idempotente e não derruba o build quando falha. Sem os arquivos, o
 * aplicativo esconde a opção de recorte e continua guardando a foto inteira, que
 * já resolve o problema principal de distinguir duas peças parecidas.
 */

import { createHash } from 'node:crypto'
import { copyFile, mkdir, readFile, stat, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const requerer = createRequire(import.meta.url)

const MODELO = {
  destino: join(raiz, 'public/modelos/u2netp.onnx'),
  url: 'https://github.com/danielgatis/rembg/releases/download/v0.0.0/u2netp.onnx',
  /* U²-Netp, a variante pequena da U²-Net. Código e pesos sob Apache-2.0, o que
     permite uso comercial — ao contrário do RMBG e do BiRefNet general-use, que
     são não comerciais e inviabilizariam o aplicativo mais tarde. */
  sha256: '309c8469258dda742793dce0ebea8e6dd393174f89934733ecc8b14c76f4ddd8'
}

const RUNTIME = {
  destino: join(raiz, 'public/ort/ort-wasm-simd-threaded.wasm'),
  pacote: 'onnxruntime-web/ort-wasm-simd-threaded.wasm'
}

async function existe(caminho) {
  try {
    return (await stat(caminho)).size > 0
  } catch {
    return false
  }
}

async function conferir(caminho, sha) {
  const digest = createHash('sha256').update(await readFile(caminho)).digest('hex')
  if (digest === sha) return true
  console.warn(`[recorte] ${caminho} não bate com o hash esperado; baixando de novo.`)
  return false
}

async function baixarModelo() {
  if (await existe(MODELO.destino) && await conferir(MODELO.destino, MODELO.sha256)) {
    return 'já estava'
  }

  const resposta = await fetch(MODELO.url, { redirect: 'follow' })
  if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`)

  const bytes = Buffer.from(await resposta.arrayBuffer())
  const digest = createHash('sha256').update(bytes).digest('hex')
  if (digest !== MODELO.sha256) {
    throw new Error(`hash inesperado: ${digest}`)
  }

  await mkdir(dirname(MODELO.destino), { recursive: true })
  await writeFile(MODELO.destino, bytes)
  return `${(bytes.length / 1e6).toFixed(1)} MB baixados`
}

async function copiarRuntime() {
  const origem = requerer.resolve(RUNTIME.pacote)
  await mkdir(dirname(RUNTIME.destino), { recursive: true })
  await copyFile(origem, RUNTIME.destino)
  return `${((await stat(RUNTIME.destino)).size / 1e6).toFixed(1)} MB copiados`
}

let falhou = false

for (const [nome, tarefa] of [['rede', baixarModelo], ['runtime', copiarRuntime]]) {
  try {
    console.log(`[recorte] ${nome}: ${await tarefa()}`)
  } catch (causa) {
    falhou = true
    console.warn(`[recorte] ${nome} indisponível (${causa.message}).`)
  }
}

if (falhou) {
  console.warn('[recorte] O aplicativo sobe sem recorte de fundo; a foto é guardada inteira.')
}
