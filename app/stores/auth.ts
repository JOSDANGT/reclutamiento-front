
import { defineStore } from 'pinia'
import type { Usuario } from '../types/auth'

export const useAuthStore = defineStore('auth', () => {
    const usuario = ref<Usuario | null>(null)
    const roles = ref<string[]>([])
    const permisos = ref<string[]>([])

    const cargando = ref(false)
    const inicializado = ref(false)

    const autenticado = computed(() => usuario.value !== null)

    function tieneRol(rol: string): boolean {
        return roles.value.includes(rol)
    }

    function tienePermiso(permiso: string): boolean {
        return permisos.value.includes(permiso)
    }

    function limpiarSesion() {
        usuario.value = null
        roles.value = []
        permisos.value = []
        inicializado.value = false
    }

    async function cargarUsuario() {
        cargando.value = true

        try {
            const { get } = useClienteRequest()

            const respuesta = await get('/api/auth/me')

            usuario.value = respuesta.data.user
            roles.value = respuesta.data.roles
            permisos.value = respuesta.data.permisos

            return true
        }
        catch {
            limpiarSesion()
            return false
        }
        finally {
            cargando.value = false
            inicializado.value = true
        }
    }

    return {
        usuario,
        roles,
        permisos,
        cargando,
        inicializado,
        autenticado,
        tieneRol,
        tienePermiso,
        cargarUsuario,
        limpiarSesion,
    }
})
