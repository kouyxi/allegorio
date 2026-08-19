/**
 * Porteiro das rotas. Roda só no cliente porque a sessão vive no cliente: o
 * plugin do Supabase é `.client.ts` e o servidor não tem como saber quem é.
 *
 * O plugin resolve a sessão com `await` antes de qualquer rota, então quando
 * este middleware executa `ready` já é verdadeiro e não existe piscada de tela
 * protegida antes do redirecionamento.
 */
export default defineNuxtRouteMiddleware(to => {
  if (import.meta.server) return

  const { configured, signedIn } = useAuth()
  if (!configured.value) return

  if (!signedIn.value && to.path !== '/entrar') return navigateTo('/entrar')
  if (signedIn.value && to.path === '/entrar') return navigateTo('/')
})
