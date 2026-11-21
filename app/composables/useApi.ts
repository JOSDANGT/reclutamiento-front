import type { FetchOptions } from 'ofetch'

export function useApi() {
    const config = useRuntimeConfig()

    function request<T>(
        url: string,
        options: FetchOptions = {},
    ): Promise<T> {
        const token = import.meta.client
            ? sessionStorage.getItem('talenthub_token')
            : null

        return $fetch<T>(url, {
            baseURL: config.public.apiBase,
            ...options,
            headers: {
                Accept: 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                ...options.headers,
            },
        })
    }

    function get<T = unknown>(
        url: string,
        options?: { params?: Record<string, string | number | boolean> },
    ) {
        return request<T>(url, {
            method: 'GET',
            query: options?.params,
        })
    }

    function post<T = unknown>(url: string, datos?: unknown) {
        return request<T>(url, {
            method: 'POST',
            body: datos,
        })
    }

    function put<T = unknown>(url: string, datos?: unknown) {
        return request<T>(url, {
            method: 'PUT',
            body: datos,
        })
    }

    function patch<T = unknown>(url: string, datos?: unknown) {
        return request<T>(url, {
            method: 'PATCH',
            body: datos,
        })
    }

    function del<T = unknown>(url: string) {
        return request<T>(url, {
            method: 'DELETE',
        })
    }

    return { get, post, put, patch, del }
}