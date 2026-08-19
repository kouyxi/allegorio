import type { Category, CollectionItem, SavedOutfit } from '~/types/domain'

export interface Backup {
  format: 'allegorio.backup'
  version: 1
  exportedAt: string
  categories: Category[]
  items: CollectionItem[]
  outfits: SavedOutfit[]
}

export const BACKUP_FORMAT = 'allegorio.backup'
export const BACKUP_VERSION = 1

export function buildBackup(
  items: CollectionItem[],
  categories: Category[],
  outfits: SavedOutfit[],
  now = new Date()
): Backup {
  return {
    format: BACKUP_FORMAT,
    version: BACKUP_VERSION,
    exportedAt: now.toISOString(),
    categories,
    items,
    outfits
  }
}

/**
 * Erra alto e cedo. Importar substitui o acervo inteiro, então um arquivo
 * errado que passasse daqui apagaria tudo sem volta.
 */
export function parseBackup(raw: string): Backup {
  let data: unknown
  try {
    data = JSON.parse(raw)
  } catch {
    throw new Error('O arquivo não é JSON válido.')
  }

  const backup = data as Partial<Backup> | null
  if (backup?.format !== BACKUP_FORMAT) {
    throw new Error('Este arquivo não é um backup do Allegorio.')
  }
  if (backup.version !== BACKUP_VERSION) {
    throw new Error(`Backup na versão ${backup.version}, e este aplicativo lê a versão ${BACKUP_VERSION}.`)
  }
  if (!Array.isArray(backup.items) || !Array.isArray(backup.categories)) {
    throw new Error('O backup está incompleto: faltam itens ou categorias.')
  }

  const categoryIds = new Set(backup.categories.map(entry => entry.id))
  const orphan = backup.items.find(item => !categoryIds.has(item.categoryId))
  if (orphan) {
    throw new Error(`"${orphan.name}" aponta para uma categoria que não está no arquivo.`)
  }

  return {
    format: BACKUP_FORMAT,
    version: BACKUP_VERSION,
    exportedAt: backup.exportedAt ?? '',
    categories: backup.categories,
    items: backup.items,
    outfits: Array.isArray(backup.outfits) ? backup.outfits : []
  }
}
