import { buildBackup, parseBackup, type Backup } from '~/utils/backup'

/**
 * Arquivo de backup do acervo.
 *
 * Com o Supabase ligado ele deixa de ser a única durabilidade e passa a ser a
 * cópia que é do usuário: o plano gratuito pausa projeto inativo e não oferece
 * recuperação em ponto no tempo.
 *
 * O formato é o mesmo contrato que a restauração consome, então exportar
 * também serve de ensaio da importação.
 */
export function useBackup() {
  const { items, categories, replaceAll } = useCollection()
  const { outfits, replaceOutfits } = useOutfits()

  function build(): Backup {
    return buildBackup(toRaw(items.value), toRaw(categories.value), toRaw(outfits.value))
  }

  function download() {
    const stamp = new Date().toISOString().slice(0, 10)
    const blob = new Blob([JSON.stringify(build(), null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = url
    link.download = `allegorio-${stamp}.json`
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }

  /** Substitui, não mescla: restaurar backup é voltar a um estado, não somar.
   *  As combinações entram no estado primeiro porque `replaceAll` grava o
   *  instantâneo inteiro, e ele precisa já enxergar a lista nova. */
  function restore(backup: Backup) {
    replaceOutfits(backup.outfits)
    replaceAll(backup.items, backup.categories)
  }

  return { build, download, parse: parseBackup, restore }
}
