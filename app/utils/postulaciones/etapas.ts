export const ETAPAS_POSTULACION = [
    {
        codigo: 'RECIBIDA',
        nombre: 'Postulación recibida',
        descripcion: 'Tu postulación fue registrada correctamente.',
        icono: 'mdi-file-check-outline',
    },
    {
        codigo: 'EN REVISION',
        nombre: 'En revisión',
        descripcion: 'Recursos Humanos está evaluando tu perfil.',
        icono: 'mdi-clipboard-search-outline',
    },
    {
        codigo: 'ENTREVISTA',
        nombre: 'Entrevista',
        descripcion: 'Etapa del proceso de entrevistas.',
        icono: 'mdi-account-voice-outline',
    },
    {
        codigo: 'SELECCIONADA',
        nombre: 'Seleccionada',
        descripcion: 'Tu postulación fue seleccionada.',
        icono: 'mdi-trophy-outline',
    },
    {
        codigo: 'CONTRATADA',
        nombre: 'Contratada',
        descripcion: 'Tu contratación fue confirmada.',
        icono: 'mdi-account-check-outline',
    },
]

export const ESTADOS_FINALES_POSTULACION = [
    'RECHAZADA',
    'RETIRADA',
    'OFERTA RECHAZADA',
]