export interface Usuario {
    id: number
    primer_nombre: string
    segundo_nombre?: string | null
    primer_apellido: string
    segundo_apellido?: string | null
    email: string
    estado: boolean
}

export interface RespuestaApi<T> {
    success: boolean
    message?: string
    data: T
}

export interface DatosAutenticacion {
    user: Usuario
    roles: string[]
    permisos: string[]
}