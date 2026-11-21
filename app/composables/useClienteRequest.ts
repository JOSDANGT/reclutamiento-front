
import type {
    AxiosError,
    AxiosInstance,
    AxiosRequestConfig,
} from 'axios'

import axios from 'axios'

export const useClienteRequest = () => {
    const config = useRuntimeConfig()

    const tokenCookie = useCookie<string | null>('talenthub_token', {
        default: () => null,
        maxAge: 60 * 60 * 8,
        sameSite: 'strict',
        secure: !import.meta.dev,
        path: '/',
    })

    // Crear instancia de Axios
    const axiosInstance: AxiosInstance = axios.create({
        baseURL: config.public.apiBase,
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
        },
    })

    // Agregar el token a cada petición
    axiosInstance.interceptors.request.use((request) => {
        const token = useCookie<string | null>('talenthub_token').value

        if (token) {
            request.headers.Authorization = `Bearer ${token}`
        }

        return request
    })

    // Manejar respuestas y errores
    axiosInstance.interceptors.response.use(
        response => response,
        async (error: AxiosError) => {
            const status = error.response?.status
            const url = error.config?.url || ''

            const rutasPublicas = [
                '/api/auth/login',
                '/api/auth/register',
            ]

            if (
                status === 401
                && !rutasPublicas.includes(url)
            ) {
                eliminarToken()

                if (import.meta.client) {
                    const auth = useAuthStore()

                    auth.limpiarSesion()

                    if (window.location.pathname !== '/login') {
                        await navigateTo('/login')
                    }
                }
            }

            return Promise.reject(error)
        },
    )

    // Guardar token de Laravel Sanctum
    function guardarToken(token: string) {

        tokenCookie.value = token

    }

    // Eliminar token
    function eliminarToken() {
        tokenCookie.value = null
    }

    // Función genérica para peticiones HTTP
    async function request(
        method: string,
        url: string,
        data?: any,
        options: AxiosRequestConfig = {},
    ) {
        const isFormData = typeof FormData !== 'undefined'
            && data instanceof FormData

        const response = await axiosInstance.request({
            ...options,
            method,
            url,
            data,
            headers: {
                ...options.headers,
                ...(isFormData ? { 'Content-Type': undefined } : {}),
            },
        })

        // Conservar respuesta completa para descarga de archivos
        if (options.responseType === 'blob') {
            return response
        }

        return response.data
    }

    return {
        get(url: string, options: AxiosRequestConfig = {}) {
            return request('GET', url, undefined, options)
        },

        post(url: string, data?: any, options: AxiosRequestConfig = {}) {
            return request('POST', url, data, options)
        },

        put(url: string, data?: any, options: AxiosRequestConfig = {}) {
            return request('PUT', url, data, options)
        },

        patch(url: string, data?: any, options: AxiosRequestConfig = {}) {
            return request('PATCH', url, data, options)
        },

        deleted(url: string, options: AxiosRequestConfig = {}) {
            return request('DELETE', url, undefined, options)
        },

        guardarToken,
        eliminarToken,
    }
}
