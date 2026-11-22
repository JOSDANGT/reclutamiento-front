
import { defineEventHandler, proxyRequest, createError } from 'h3'

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig(event)

    const backendUrl = config.apiBaseUrl.replace(/\/$/, '')

    const targetPath = event.path.replace(/^\/services/, '')

    if (!targetPath.startsWith('/api/')) {
        throw createError({
            statusCode: 404,
            statusMessage: 'Ruta no disponible',
        })
    }

    return proxyRequest(event, `${backendUrl}${targetPath}`, {
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            Accept: 'application/json',
        },
        fetchOptions: {
            ignoreResponseError: true,
        },
    })
})
