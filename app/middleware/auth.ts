export default defineNuxtRouteMiddleware(async () => {
    const auth = useAuthStore()

    if (!auth.autenticado) {
        const valido = await auth.cargarUsuario()

        if (!valido) {
            return navigateTo('/login')
        }
    }
})