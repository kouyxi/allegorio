import { appendFile, mkdir } from 'node:fs/promises'
import { dirname } from 'node:path'

// ponytail: grava em arquivo local (uma linha JSON por inscrito).
// Trocar por Phoenix ou provedor de e-mail quando existir backend.
const FILE = '.data/subscribers.jsonl'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ email?: unknown }>(event)
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''

  if (email.length > 254 || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    throw createError({ statusCode: 400, statusMessage: 'E-mail inválido' })
  }

  await mkdir(dirname(FILE), { recursive: true })
  await appendFile(FILE, JSON.stringify({ email, at: new Date().toISOString() }) + '\n')

  return { ok: true }
})
