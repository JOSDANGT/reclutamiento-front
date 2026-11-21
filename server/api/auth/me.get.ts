import {createError, defineEventHandler, getCookie,} from 'h3'

export default defineEventHandler(async (event) => {
    const token = getCookie(event, 'talenthub_token')

    if (!token) {
        throw createError({
            statusCode: 401,
            statusMessage: 'No autenticado',
        })
    }

    const config = useRuntimeConfig(event)

    try {
        return await $fetch(`${config.apiBase}/auth/me`, {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/json',
            },
        })
    } catch {
        throw createError({
            statusCode: 401,
            statusMessage: 'No se pudo validar la sesión',
        })
    }
})