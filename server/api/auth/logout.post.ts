import {
    defineEventHandler,
    getCookie,
    deleteCookie,
} from 'h3'

export default defineEventHandler(async (event) => {
    const token = getCookie(event, 'talenthub_token')
    const config = useRuntimeConfig(event)

    if (token) {
        try {
            await $fetch(`${config.apiBase}/auth/logout`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                },
            })
        } catch {
            // Continuar con el cierre de sesión local.
        }
    }

    deleteCookie(event, 'talenthub_token', {
        path: '/',
    })

    return {
        success: true,
        message: 'Sesión local cerrada.',
    }
})