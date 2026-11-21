export default defineNuxtRouteMiddleware(async () => {
    // Ejecutar la verificación únicamente en el navegador
    if (import.meta.server) return

    const auth = useAuthStore()
    const token = useCookie<string | null>('talenthub_token')

    if (!token.value) {
        auth.limpiarSesion()
        return navigateTo('/login')
    }

    if (!auth.autenticado) {
        const autenticado = await auth.cargarUsuario()

        if (!autenticado) {
            return navigateTo('/login')
        }
    }
})