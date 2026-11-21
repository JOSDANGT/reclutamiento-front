import {
    createError,
    defineEventHandler,
    readBody,
    setCookie,
} from 'h3'

import type { FetchError } from 'ofetch'

interface LoginResponse {
    success: boolean
    message: string
    data: {
        access_token: string
        token_type: string
        expires_in: number
    }
}

interface LoginRequest {
    usuario_dominio: string
    password: string
}

interface ErrorResponse {
    message?: string
    errors?: Record<string, string[]>
}

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig(event)

    const data = await readBody<LoginRequest>(event)

    if (
        !data
        || typeof data.usuario_dominio !== 'string'
        || !data.usuario_dominio.trim()
        || typeof data.password !== 'string'
        || !data.password
    ) {
        throw createError({
            statusCode: 422,
            statusMessage: 'Datos de autenticación inválidos.',
        })
    }

    let respuesta: LoginResponse

    try {
        respuesta = await $fetch<LoginResponse>(
            `${config.apiBase}/auth/login`,
            {
                method: 'POST',
                body: {
                    usuario_dominio: data.usuario_dominio.trim(),
                    password: data.password,
                },
                headers: {
                    Accept: 'application/json',
                },
            },
        )
    }
    catch (error: unknown) {
        const exception = error as FetchError<ErrorResponse>

        const statusCode = exception.response?.status || 502

        // Evitar exponer detalles internos del backend.
        const mensaje = [401, 422].includes(statusCode)
            ? exception.data?.message || 'Credenciales incorrectas.'
            : 'No fue posible iniciar sesión. Intenta nuevamente.'

        throw createError({
            statusCode: [401, 422].includes(statusCode)
                ? statusCode
                : 502,
            statusMessage: mensaje,
            data: {
                message: mensaje,
                ...([401, 422].includes(statusCode)
                    ? { errors: exception.data?.errors }
                    : {}),
            },
        })
    }

    if (
        !respuesta.success
        || !respuesta.data?.access_token
        || respuesta.data.token_type !== 'Bearer'
    ) {
        throw createError({
            statusCode: 502,
            statusMessage: 'Respuesta de autenticación inválida.',
        })
    }

    const duracion = Math.min(
        Math.max(respuesta.data.expires_in || 28800, 1),
        28800,
    )

    setCookie(event, 'talenthub_token', respuesta.data.access_token, {
        httpOnly: true,
        secure: !import.meta.dev,
        sameSite: 'strict',
        path: '/',
        maxAge: duracion,
    })

    return {
        success: true,
        message: respuesta.message,
    }
})