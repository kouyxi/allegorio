export const NICKNAME_MAX_LENGTH = 40

/** Mantém o nickname legível mesmo quando veio com espaços duplicados. */
export function normalizeNickname(value: string) {
  return value.trim().replace(/\s+/g, ' ')
}

/** Nickname vazio é válido: nesse caso a pessoa está removendo o apelido. */
export function validateNickname(value: string) {
  const nickname = normalizeNickname(value)
  if (nickname.length > NICKNAME_MAX_LENGTH) {
    return `Use no máximo ${NICKNAME_MAX_LENGTH} caracteres.`
  }
  return ''
}
