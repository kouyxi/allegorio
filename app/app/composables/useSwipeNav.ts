/**
 * Gesto lateral para trocar de seção, no espírito de um feed: o conteúdo
 * acompanha o dedo, resiste na borda e só decide ao soltar.
 *
 * Duas regras evitam que o gesto roube o que não é dele:
 * o eixo é decidido nos primeiros pixels, e qualquer coisa marcada com
 * `data-hscroll` (o baralho de looks, as fileiras de chips) tem prioridade.
 */
export function useSwipeNav() {
  const { index, step, tabs } = useTabs()

  const offset = ref(0)
  const live = ref(false)

  let startX = 0
  let startY = 0
  let startTime = 0
  let axis: 'none' | 'x' | 'y' = 'none'
  let pointerId: number | null = null

  const LIMIT = 96
  const THRESHOLD = 8

  function onPointerDown(event: PointerEvent) {
    if (event.pointerType === 'mouse' && event.button !== 0) return
    if ((event.target as HTMLElement | null)?.closest('[data-hscroll]')) return

    pointerId = event.pointerId
    startX = event.clientX
    startY = event.clientY
    startTime = event.timeStamp
    axis = 'none'
  }

  function onPointerMove(event: PointerEvent) {
    if (pointerId === null || event.pointerId !== pointerId) return

    const dx = event.clientX - startX
    const dy = event.clientY - startY

    if (axis === 'none') {
      if (Math.abs(dx) < THRESHOLD && Math.abs(dy) < THRESHOLD) return
      axis = Math.abs(dx) > Math.abs(dy) * 1.3 ? 'x' : 'y'
      if (axis === 'y') { pointerId = null; return }
      live.value = true
    }

    /* na primeira e na última aba o arrasto fica elástico em vez de travado */
    const atEdge = (dx > 0 && index.value === 0) || (dx < 0 && index.value === tabs.length - 1)
    const raw = atEdge ? dx / 4 : dx
    offset.value = Math.max(-LIMIT, Math.min(LIMIT, raw))
  }

  function onPointerUp(event: PointerEvent) {
    if (pointerId === null || event.pointerId !== pointerId) return

    const dx = event.clientX - startX
    const elapsed = Math.max(1, event.timeStamp - startTime)
    const velocity = Math.abs(dx) / elapsed

    pointerId = null
    live.value = false

    if (axis === 'x' && (Math.abs(dx) > 64 || velocity > 0.5)) step(dx < 0 ? 1 : -1)
    offset.value = 0
    axis = 'none'
  }

  function onPointerCancel() {
    pointerId = null
    live.value = false
    offset.value = 0
    axis = 'none'
  }

  return {
    offset,
    live,
    /* `v-on="handlers"` prefixa `on` nas chaves, então elas vão sem prefixo */
    handlers: {
      pointerdown: onPointerDown,
      pointermove: onPointerMove,
      pointerup: onPointerUp,
      pointercancel: onPointerCancel
    }
  }
}
