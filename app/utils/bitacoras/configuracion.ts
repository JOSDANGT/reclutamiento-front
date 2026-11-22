
export const accionesBitacora: Record<string, any> = {
    CREACION: {
        titulo: 'Registro creado',
        icono: 'mdi-plus-circle-outline',
        color: 'success',
    },
    ACTUALIZACION: {
        titulo: 'Información actualizada',
        icono: 'mdi-pencil-outline',
        color: 'info',
    },
    CAMBIO_ESTADO: {
        titulo: 'Cambio de estado',
        icono: 'mdi-swap-horizontal',
        color: 'warning',
    },
    ELIMINACION: {
        titulo: 'Registro eliminado',
        icono: 'mdi-delete-outline',
        color: 'error',
    },
}

export const configuracionesBitacora: Record<string, any> = {
    vacante: {
        titulo: 'Historial de la vacante',
        campos: {
            titulo: 'Título',
            descripcion: 'Descripción',
            unidad_id: 'Unidad organizacional',
            cantidad_plazas: 'Cantidad de plazas',
            salario_minimo: 'Salario mínimo',
            salario_maximo: 'Salario máximo',
            modalidad: 'Modalidad',
            tipo_contrato: 'Tipo de contrato',
            nivel_experiencia: 'Nivel de experiencia',
            estado: 'Estado',
            fecha_inicio: 'Fecha de inicio',
            fecha_limite: 'Fecha límite',
            requisitos: 'Requisitos',
        },
        monedas: ['salario_minimo', 'salario_maximo'],
        fechas: ['fecha_inicio', 'fecha_limite'],
    },

    postulacion: {
        titulo: 'Historial de la postulación',
        campos: {
            estado: 'Estado de la postulación',
            observaciones: 'Observaciones',
        },
    },

    entrevista: {
        titulo: 'Historial de la entrevista',
        campos: {
            fecha: 'Fecha',
            resultado: 'Resultado',
            observaciones: 'Observaciones',
        },
        fechas: ['fecha'],
    },
}

export function configuracionAccion(accion: string) {
    return accionesBitacora[accion] || {
        titulo: accion.replaceAll('_', ' '),
        icono: 'mdi-history',
        color: 'secondary',
    }
}

export function obtenerConfiguracionBitacora(tipo: string) {
    return configuracionesBitacora[tipo] || {
        titulo: 'Historial de movimientos',
        campos: {},
    }
}

export function interpretarDatos(valor: any) {
    if (valor === null || valor === undefined) return null

    if (typeof valor !== 'string') return valor

    try {
        return JSON.parse(valor)
    }
    catch {
        return valor
    }
}

export function nombreCampo(campo: string, tipo: string) {
    const config = obtenerConfiguracionBitacora(tipo)

    return config.campos?.[campo]
        || campo.replaceAll('_', ' ')
            .replace(/(^|\s)\S/g, letra => letra.toUpperCase())
}

export function formatearValor(valor: any, campo: string, tipo: string): string {
    if (valor === null || valor === undefined || valor === '') {
        return 'Sin información'
    }

    const config = obtenerConfiguracionBitacora(tipo)

    if (config.monedas?.includes(campo)) {
        const numero = Number(valor)

        return Number.isFinite(numero)
            ? new Intl.NumberFormat('es-GT', {
                style: 'currency',
                currency: 'GTQ',
            }).format(numero)
            : String(valor)
    }

    if (config.fechas?.includes(campo)) {
        const fecha = String(valor)

        // Evita cambios de día por conversión de zona horaria.
        if (/^\d{4}-\d{2}-\d{2}$/.test(fecha.substring(0, 10))) {
            const [anio, mes, dia] = fecha.substring(0, 10).split('-')

            return `${dia}/${mes}/${anio}`
        }

        return fecha
    }

    if (typeof valor === 'boolean') {
        return valor ? 'Sí' : 'No'
    }

    if (typeof valor === 'object') {
        return JSON.stringify(valor, null, 2)
    }

    if (campo === 'estado' || campo === 'modalidad'
        || campo === 'tipo_contrato' || campo === 'nivel_experiencia') {
        return String(valor)
            .replaceAll('_', ' ')
            .toLowerCase()
            .replace(/(^|\s)\S/g, letra => letra.toUpperCase())
    }

    return String(valor)
}

export function formatearFechaBitacora(fecha: string) {
    if (!fecha) return 'Sin fecha'

    const valor = new Date(fecha)

    if (Number.isNaN(valor.getTime())) return fecha

    return valor.toLocaleString('es-GT', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })
}
