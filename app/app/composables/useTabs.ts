export interface Tab { to: string, label: string, icon: string }

/** Destinos do gesto lateral. Adicionar não entra: é ação, não destino, e
 *  chegar nele por deslize no meio de uma navegação seria acidente. */
export const TABS: Tab[] = [
  { to: '/', label: 'Hoje', icon: 'sun' },
  { to: '/acervo', label: 'Acervo', icon: 'hanger' },
  { to: '/desejos', label: 'Desejos', icon: 'heart' },
  { to: '/ajustes', label: 'Ajustes', icon: 'sliders' }
]

export const ADD_ROUTE = '/adicionar'

export function useTabs() {
  const route = useRoute()
  const router = useRouter()
  const direction = useState<'next' | 'prev' | 'none'>('nav-direction', () => 'none')

  function isActive(to: string) {
    return to === '/' ? route.path === '/' : route.path.startsWith(to)
  }

  /** -1 quando a rota atual não é aba, como a tela de adicionar. */
  const index = computed(() => TABS.findIndex(tab => isActive(tab.to)))

  /** A grade tem cinco fatias e o botão ocupa a do meio. */
  const slot = computed(() => (index.value < 2 ? Math.max(0, index.value) : index.value + 1))

  function goTo(target: number) {
    if (target < 0 || target >= TABS.length || target === index.value) return false
    direction.value = target > index.value ? 'next' : 'prev'
    router.push(TABS[target]!.to)
    return true
  }

  function step(delta: number) {
    if (index.value === -1) return false
    return goTo(index.value + delta)
  }

  return { tabs: TABS, index, slot, isActive, direction, goTo, step, addRoute: ADD_ROUTE }
}
