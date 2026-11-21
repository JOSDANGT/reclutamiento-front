type Parametro = string | number | boolean | null | undefined

interface OpcionesGet {
    params?: Record<string, Parametro>
}

export function useApi() {
    const get = <T = unknown>(
        url: string,
        options?: OpcionesGet,
    ): Promise<T> => {
        return $fetch<T>(url, {
            method: 'GET',
            query: options?.params,
            credentials: 'same-origin',
        })
    }

    const post = <T = unknown>(
        url: string,
        data?: Record<string, unknown>,
    ): Promise<T> => {
        return $fetch<T>(url, {
            method: 'POST',
            body: data,
            credentials: 'same-origin',
        })
    }

    const put = <T = unknown>(
        url: string,
        data?: Record<string, unknown>,
    ): Promise<T> => {
        return $fetch<T>(url, {
            method: 'PUT',
            body: data,
            credentials: 'same-origin',
        })
    }

    const patch = <T = unknown>(
        url: string,
        data?: Record<string, unknown>,
    ): Promise<T> => {
        return $fetch<T>(url, {
            method: 'PATCH',
            body: data,
            credentials: 'same-origin',
        })
    }

    const del = <T = unknown>(
        url: string,
    ): Promise<T> => {
        return $fetch<T>(url, {
            method: 'DELETE',
            credentials: 'same-origin',
        })
    }

    return {
        get,
        post,
        put,
        patch,
        del,
    }
}