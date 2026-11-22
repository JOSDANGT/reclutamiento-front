<script setup lang="ts">
import AgendaEtapas from './AgendaEtapas.vue'

const props = defineProps<{
  postulacionId: number
  estado: string
}>()

const emit = defineEmits<{
  actualizada: []
}>()

const { get, post, put } = useClienteRequest()

type Accion =
    | 'programar'
    | 'reprogramar'
    | 'resultado'
    | 'cancelar'
    | 'autorizar'
    | 'baja'

type SituacionEtapa =
    | 'Completada'
    | 'Programada'
    | 'Pendiente de decisión'
    | 'Pendiente'
    | 'Bloqueada'

type Usuario = {
  id: number
  nombre_completo: string
}

type Entrevista = {
  id: number
  postulacion_id: number
  etapa: number
  usuario_id: number | null
  responsable: { id: number; name: string } | null
  fecha_hora: string
  modalidad: string
  lugar_enlace: string | null
  estado: string
  resultado: string | null
  observaciones: string | null
  motivo_cancelacion: string | null
  continuidad_autorizada: boolean | number | string | null
  justificacion_continuidad: string | null
}

const etapas = [
  {
    id: 1,
    nombre: 'Recursos Humanos',
    descripcion: 'Evaluación inicial del candidato.',
  },
  {
    id: 2,
    nombre: 'Jefe inmediato',
    descripcion: 'Entrevista con el responsable del área.',
  },
  {
    id: 3,
    nombre: 'Entrevista técnica',
    descripcion: 'Evaluación de conocimientos y habilidades.',
  },
]

const modalidades = [
  { title: 'Presencial', value: 'PRESENCIAL' },
  { title: 'Virtual', value: 'VIRTUAL' },
  { title: 'Telefónica', value: 'TELEFONICA' },
]

const titulos: Record<Accion, string> = {
  programar: 'Programar entrevista',
  reprogramar: 'Reprogramar o cambiar responsable',
  resultado: 'Registrar resultado',
  cancelar: 'Cancelar entrevista',
  autorizar: 'Autorizar continuidad',
  baja: 'Dar de baja postulación',
}

const agendas = ref<Entrevista[]>([])
const usuarios = ref<Usuario[]>([])

const cargando = ref(false)
const cargandoUsuarios = ref(false)
const guardando = ref(false)
const dialogo = ref(false)

const error = ref('')
const errorFormulario = ref('')
const errorUsuarios = ref('')
const mensaje = ref('')

// Permite cerrar las acciones inmediatamente después de una baja,
// mientras el padre actualiza el estado de la postulación.
const bajaRegistrada = ref(false)


const accion = ref<Accion>('programar')
const seleccionada = ref<Entrevista | null>(null)

function formularioInicial() {
  return {
    usuario_id: null as number | null,
    fecha_hora: '',
    modalidad: 'PRESENCIAL',
    lugar_enlace: '',
    resultado: null as 'APROBADA' | 'NO_APROBADA' | null,
    observaciones: '',
    motivo_cancelacion: '',
    justificacion_continuidad: '',
    motivo_baja: '',
  }
}

const formulario = reactive(formularioInicial())

function extraer(respuesta: any) {
  return respuesta?.data?.data ?? respuesta?.data ?? respuesta
}

function mensajeError(excepcion: any, predeterminado: string) {
  const datos = excepcion?.response?.data ?? excepcion?.data

  if (datos?.errors) {
    const mensajes = Object.values(datos.errors).flat().join(' ')
    if (mensajes) return mensajes
  }

  return datos?.message ?? predeterminado
}

function nombreEtapa(id: number | null) {
  return etapas.find(etapa => etapa.id === Number(id))?.nombre ?? 'Entrevista'
}

function continuidadAutorizada(agenda: Entrevista) {
  return agenda.estado === 'REALIZADA'
      && agenda.resultado === 'NO_APROBADA'
      && Number(agenda.continuidad_autorizada) === 1
}

function permiteAvanzar(agenda: Entrevista) {
  return agenda.estado === 'REALIZADA'
      && (agenda.resultado === 'APROBADA' || continuidadAutorizada(agenda))
}

function requiereDecision(agenda: Entrevista) {
  return agenda.estado === 'REALIZADA'
      && agenda.resultado === 'NO_APROBADA'
      && !continuidadAutorizada(agenda)
}

const puedeGestionar = computed(() =>
    String(props.estado ?? '').trim().toUpperCase() === 'ENTREVISTA'
    && !bajaRegistrada.value,
)

const etapasCompletadas = computed(() =>
    new Set(
        agendas.value
            .filter(permiteAvanzar)
            .map(agenda => Number(agenda.etapa)),
    ),
)

const etapaActual = computed(() =>
    etapas.find(etapa => !etapasCompletadas.value.has(etapa.id))?.id ?? null,
)

const entrevistasEtapaActual = computed(() =>
    agendas.value.filter(agenda => Number(agenda.etapa) === etapaActual.value),
)

const hayProgramada = computed(() =>
    entrevistasEtapaActual.value.some(agenda => agenda.estado === 'PROGRAMADA'),
)

const hayDecisionPendiente = computed(() =>
    entrevistasEtapaActual.value.some(requiereDecision),
)

const puedeProgramar = computed(() =>
    puedeGestionar.value
    && !cargando.value
    && !error.value
    && etapaActual.value !== null
    && !hayProgramada.value
    && !hayDecisionPendiente.value,
)

const progreso = computed(() =>
    etapas.map(etapa => {
      let situacion: SituacionEtapa = 'Bloqueada'

      if (etapasCompletadas.value.has(etapa.id)) {
        situacion = 'Completada'
      }
      else if (etapa.id === etapaActual.value && puedeGestionar.value) {
        if (hayDecisionPendiente.value) situacion = 'Pendiente de decisión'
        else if (hayProgramada.value) situacion = 'Programada'
        else situacion = 'Pendiente'
      }

      return { ...etapa, situacion }
    }),
)

const esProgramacion = computed(() =>
    accion.value === 'programar' || accion.value === 'reprogramar',
)

const formularioValido = computed(() => {
  switch (accion.value) {
    case 'programar':
    case 'reprogramar':
      return formulario.usuario_id !== null
          && !!formulario.fecha_hora
          && !!formulario.modalidad
          && !cargandoUsuarios.value
          && !errorUsuarios.value

    case 'resultado':
      return !!formulario.resultado && !!formulario.observaciones.trim()

    case 'cancelar':
      return !!formulario.motivo_cancelacion.trim()

    case 'autorizar':
      return !!formulario.justificacion_continuidad.trim()

    case 'baja':
      return !!formulario.motivo_baja.trim()
  }
})

function puedeDecidir(agenda: Entrevista) {
  return puedeGestionar.value
      && Number(agenda.etapa) === etapaActual.value
      && requiereDecision(agenda)
}

// El controlador guarda las citas en UTC.
// El formulario debe mostrar y enviar la hora local de Guatemala.
function fechaDesdeApi(valor: string) {
  const iso = valor.trim().replace(' ', 'T')
  const tieneZona = /(?:Z|[+-]\d{2}:\d{2})$/i.test(iso)

  return new Date(tieneZona ? iso : `${iso}Z`)
}

function fechaParaInput(valor: string) {
  if (!valor) return ''

  const fecha = fechaDesdeApi(valor)
  if (Number.isNaN(fecha.getTime())) return ''

  const partes = new Intl.DateTimeFormat('es-GT', {
    timeZone: 'America/Guatemala',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(fecha)

  const obtener = (tipo: string) =>
      partes.find(parte => parte.type === tipo)?.value ?? ''

  return `${obtener('year')}-${obtener('month')}-${obtener('day')}T${obtener('hour')}:${obtener('minute')}`
}

function mostrarFecha(valor: string) {
  if (!valor) return 'Sin fecha'

  const fecha = fechaDesdeApi(valor)
  if (Number.isNaN(fecha.getTime())) return 'Sin fecha'

  return new Intl.DateTimeFormat('es-GT', {
    timeZone: 'America/Guatemala',
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(fecha)
}

let consultaAgenda = 0

async function cargarAgendas() {
  const consulta = ++consultaAgenda
  const id = props.postulacionId

  error.value = ''

  if (!id) {
    agendas.value = []
    cargando.value = false
    return
  }

  cargando.value = true

  try {
    const respuesta = await get(`/api/postulaciones/${id}/agenda`)
    const datos = extraer(respuesta)

    if (!Array.isArray(datos)) {
      throw new Error('Respuesta de agenda inválida.')
    }

    if (consulta === consultaAgenda) agendas.value = datos
  }
  catch (e) {
    if (consulta === consultaAgenda) {
      error.value = mensajeError(e, 'No fue posible consultar la agenda.')
    }
  }
  finally {
    if (consulta === consultaAgenda) cargando.value = false
  }
}

async function cargarUsuarios() {
  if (cargandoUsuarios.value) return

  cargandoUsuarios.value = true
  errorUsuarios.value = ''

  try {
    const respuesta = await get('/api/agendas/responsables')
    const datos = extraer(respuesta)

    if (!Array.isArray(datos)) {
      throw new Error('Respuesta de usuarios inválida.')
    }

    usuarios.value = datos
  }
  catch (e) {
    usuarios.value = []
    errorUsuarios.value = mensajeError(e, 'No fue posible cargar los responsables.')
  }
  finally {
    cargandoUsuarios.value = false
  }
}

function abrir(nuevaAccion: Accion, agenda: Entrevista | null = null) {
  if (!puedeGestionar.value || cargando.value || guardando.value) return

  if (nuevaAccion === 'programar') {
    if (!puedeProgramar.value) return
  }
  else {
    if (!agenda || Number(agenda.postulacion_id) !== Number(props.postulacionId)) {
      return
    }

    if (nuevaAccion === 'autorizar' || nuevaAccion === 'baja') {
      if (!puedeDecidir(agenda)) return
    }
    else if (agenda.estado !== 'PROGRAMADA') {
      return
    }
  }

  Object.assign(formulario, formularioInicial())
  accion.value = nuevaAccion
  seleccionada.value = agenda
  errorFormulario.value = ''

  if (agenda && nuevaAccion === 'reprogramar') {
    formulario.usuario_id = agenda.usuario_id == null ? null : Number(agenda.usuario_id)
    formulario.fecha_hora = fechaParaInput(agenda.fecha_hora)
    formulario.modalidad = agenda.modalidad
    formulario.lugar_enlace = agenda.lugar_enlace ?? ''
  }

  dialogo.value = true

  if (esProgramacion.value) {
    void cargarUsuarios()
  }
}

async function guardar() {
  if (!puedeGestionar.value || !formularioValido.value || guardando.value) return

  const postulacionId = props.postulacionId
  const base = `/api/postulaciones/${postulacionId}/agenda`
  const operacion = accion.value
  const agenda = seleccionada.value

  if (operacion !== 'programar' && !agenda) return

  guardando.value = true
  errorFormulario.value = ''
  mensaje.value = ''

  try {
    if (operacion === 'programar' || operacion === 'reprogramar') {
      const cita = {
        usuario_id: formulario.usuario_id,
        fecha_hora: formulario.fecha_hora,
        modalidad: formulario.modalidad,
        lugar_enlace: formulario.lugar_enlace.trim() || null,
      }

      if (operacion === 'programar') {
        await post(base, { ...cita, etapa: etapaActual.value })
      }
      else {
        await put(`${base}/${agenda!.id}/reprogramar`, cita)
      }
    }
    else if (operacion === 'resultado') {
      await put(`${base}/${agenda!.id}/resultado`, {
        resultado: formulario.resultado,
        observaciones: formulario.observaciones.trim(),
      })
    }
    else if (operacion === 'cancelar') {
      await put(`${base}/${agenda!.id}/cancelar`, {
        motivo_cancelacion: formulario.motivo_cancelacion.trim(),
      })
    }
    else if (operacion === 'autorizar') {
      await put(`${base}/${agenda!.id}/autorizar-continuidad`, {
        justificacion_continuidad: formulario.justificacion_continuidad.trim(),
      })
    }
    else if (operacion === 'baja') {
      await put(`${base}/${agenda!.id}/dar-de-baja`, {
        motivo_baja: formulario.motivo_baja.trim(),
      })
    }

    if (postulacionId !== props.postulacionId) return

    if (operacion === 'baja') bajaRegistrada.value = true

    dialogo.value = false
    mensaje.value = operacion === 'baja'
        ? 'Postulación dada de baja correctamente.'
        : 'Gestión registrada correctamente.'

    emit('actualizada')
    await cargarAgendas()
  }
  catch (e) {
    if (postulacionId === props.postulacionId) {
      errorFormulario.value = mensajeError(e, 'No fue posible guardar la gestión.')
    }
  }
  finally {
    guardando.value = false
  }
}

const seleccionRegistradaId = ref<number | null>(null)
const errorSeleccion = ref('')

async function seleccionarCandidato() {
  const id = props.postulacionId

  if (
      guardando.value
      || !puedeGestionar.value
      || etapaActual.value !== null
      || seleccionRegistradaId.value === id
  ) {
    return
  }

  guardando.value = true
  errorSeleccion.value = ''
  mensaje.value = ''

  try {
    const respuesta = await get('/api/postulaciones/estados')
    const estados = extraer(respuesta)

    const estadoSeleccionada = Array.isArray(estados)
        ? estados.find(estado =>
            String(estado.nombre ?? '').trim().toUpperCase() === 'SELECCIONADA',
        )
        : null

    if (!estadoSeleccionada) {
      errorSeleccion.value = 'No se encontró el estado Seleccionada en el catálogo.'
      return
    }

    if (props.postulacionId !== id) return

    await put(`/api/postulaciones/estado/${id}`, {
      estado_id: estadoSeleccionada.id,
      observaciones: 'Candidato seleccionado al completar las tres entrevistas.',
    })

    if (props.postulacionId !== id) return

    seleccionRegistradaId.value = id
    mensaje.value = 'La postulación quedó en estado Seleccionada.'
    emit('actualizada')
  }
  catch (e) {
    if (props.postulacionId === id) {
      errorSeleccion.value = mensajeError(e, 'No fue posible seleccionar al candidato.')
    }
  }
  finally {
    guardando.value = false
  }
}
watch(
    () => props.postulacionId,
    () => {
      agendas.value = []
      seleccionada.value = null
      dialogo.value = false
      bajaRegistrada.value = false
      seleccionRegistradaId.value = null
      errorSeleccion.value = ''
      mensaje.value = ''
      void cargarAgendas()
    },
    { immediate: true },
)
</script>

<template>
  <div class="d-flex flex-column ga-4">
    <AgendaEtapas
        v-if="!cargando && !error"
        :etapas="progreso"
    />

    <VCard rounded="lg">
      <VCardTitle class="d-flex align-center justify-space-between flex-wrap ga-3 pa-4">
        <span>Agenda de entrevistas</span>

        <VBtn
            v-if="puedeProgramar"
            color="primary"
            prepend-icon="mdi-calendar-plus"
            @click="abrir('programar')"
        >
          Programar entrevista
        </VBtn>
      </VCardTitle>

      <VDivider />

      <VCardText class="d-flex flex-column ga-4">
        <VAlert
            v-if="mensaje"
            type="success"
            variant="tonal"
            closable
            @click:close="mensaje = ''"
        >
          {{ mensaje }}
        </VAlert>

        <VProgressLinear v-if="cargando" indeterminate color="primary" />

        <VAlert v-else-if="error" type="error" variant="tonal">
          {{ error }}
          <VBtn variant="text" size="small" @click="cargarAgendas">
            Reintentar
          </VBtn>
        </VAlert>

        <template v-else>
          <div class="d-flex align-center justify-space-between flex-wrap ga-2">
            <span>
              Entrevistas completadas:
              <strong>{{ etapasCompletadas.size }} de {{ etapas.length }}</strong>
            </span>

            <VChip v-if="etapaActual === null" color="success">
              Entrevistas completadas
            </VChip>

            <VChip v-else-if="puedeGestionar" color="primary">
              Etapa actual: {{ nombreEtapa(etapaActual) }}
            </VChip>
          </div>
          <div
              v-if="etapaActual === null
                && puedeGestionar
                && seleccionRegistradaId !== props.postulacionId"
              class="d-flex justify-end"
          >
            <VBtn
                color="success"
                prepend-icon="mdi-account-check"
                :loading="guardando"
                :disabled="guardando"
                @click="seleccionarCandidato"
            >
              Seleccionar candidato
            </VBtn>
          </div>

          <VAlert v-if="errorSeleccion" type="error" variant="tonal">
            {{ errorSeleccion }}
          </VAlert>

          <VAlert v-if="!agendas.length" type="info" variant="tonal">
            No hay entrevistas registradas.
          </VAlert>

          <VCard
              v-for="agenda in agendas"
              :key="agenda.id"
              variant="outlined"
              rounded="lg"
          >
            <VCardText>
              <div class="d-flex align-center justify-space-between flex-wrap ga-2">
                <div>
                  <div class="text-subtitle-1 font-weight-bold">
                    {{ nombreEtapa(agenda.etapa) }}
                  </div>
                  <div>{{ mostrarFecha(agenda.fecha_hora) }}</div>
                </div>

                <div class="d-flex flex-wrap ga-2">
                  <VChip size="small" variant="tonal">
                    {{ agenda.estado }}
                  </VChip>

                  <VChip
                      v-if="agenda.resultado"
                      :color="agenda.resultado === 'APROBADA' ? 'success' : 'error'"
                      size="small"
                      variant="tonal"
                  >
                    {{ agenda.resultado.replaceAll('_', ' ') }}
                  </VChip>

                  <VChip
                      v-if="continuidadAutorizada(agenda)"
                      color="warning"
                      size="small"
                  >
                    Continuidad autorizada
                  </VChip>
                </div>
              </div>

              <VDivider class="my-3" />

              <VRow dense>
                <VCol cols="12" sm="6">
                  <strong>Responsable:</strong>
                  {{ agenda.responsable?.name ?? 'Sin responsable asignado' }}
                </VCol>

                <VCol cols="12" sm="6">
                  <strong>Modalidad:</strong> {{ agenda.modalidad }}
                </VCol>

                <VCol v-if="agenda.lugar_enlace" cols="12">
                  <strong>Lugar o enlace:</strong> {{ agenda.lugar_enlace }}
                </VCol>

                <VCol v-if="agenda.observaciones" cols="12">
                  <strong>Observaciones:</strong> {{ agenda.observaciones }}
                </VCol>

                <VCol v-if="agenda.motivo_cancelacion" cols="12">
                  <strong>Motivo de cancelación:</strong>
                  {{ agenda.motivo_cancelacion }}
                </VCol>

                <VCol
                    v-if="continuidadAutorizada(agenda) && agenda.justificacion_continuidad"
                    cols="12"
                >
                  <strong>Justificación de continuidad:</strong>
                  {{ agenda.justificacion_continuidad }}
                </VCol>
              </VRow>

              <div
                  v-if="puedeGestionar && agenda.estado === 'PROGRAMADA'"
                  class="d-flex flex-wrap ga-2 mt-4"
              >
                <VBtn
                    size="small"
                    color="primary"
                    @click="abrir('resultado', agenda)"
                >
                  Registrar resultado
                </VBtn>

                <VBtn
                    size="small"
                    variant="tonal"
                    @click="abrir('reprogramar', agenda)"
                >
                  Reprogramar o cambiar responsable
                </VBtn>

                <VBtn
                    size="small"
                    color="error"
                    variant="text"
                    @click="abrir('cancelar', agenda)"
                >
                  Cancelar entrevista
                </VBtn>
              </div>

              <VAlert
                  v-if="puedeDecidir(agenda)"
                  type="warning"
                  variant="tonal"
                  class="mt-4"
              >
                La entrevista no fue aprobada. Selecciona cómo proceder.

                <div class="d-flex flex-wrap ga-2 mt-3">
                  <VBtn
                      size="small"
                      color="warning"
                      @click="abrir('autorizar', agenda)"
                  >
                    Autorizar continuidad
                  </VBtn>

                  <VBtn
                      size="small"
                      color="error"
                      variant="outlined"
                      @click="abrir('baja', agenda)"
                  >
                    Dar de baja postulación
                  </VBtn>
                </div>
              </VAlert>
            </VCardText>
          </VCard>
        </template>
      </VCardText>
    </VCard>

    <VDialog v-model="dialogo" max-width="650" scrollable persistent>
      <VCard rounded="lg">
        <VCardTitle class="pa-4">{{ titulos[accion] }}</VCardTitle>
        <VDivider />

        <VCardText class="d-flex flex-column ga-4 pa-4">
          <VAlert v-if="errorFormulario" type="error" variant="tonal">
            {{ errorFormulario }}
          </VAlert>

          <VAlert type="info" variant="tonal">
            <strong>Entrevista:</strong>
            {{ nombreEtapa(seleccionada ? seleccionada.etapa : etapaActual) }}
          </VAlert>

          <template v-if="esProgramacion">
            <VAlert v-if="errorUsuarios" type="error" variant="tonal">
              {{ errorUsuarios }}
              <VBtn variant="text" size="small" @click="cargarUsuarios">
                Reintentar
              </VBtn>
            </VAlert>

            <VAutocomplete
                v-model="formulario.usuario_id"
                :items="usuarios"
                item-title="nombre_completo"
                item-value="id"
                :loading="cargandoUsuarios"
                label="Responsable de la entrevista *"
                placeholder="Buscar usuario"
                no-data-text="No hay usuarios disponibles"
                variant="outlined"
                density="comfortable"
                clearable
                hide-details="auto"
            />

            <VTextField
                v-model="formulario.fecha_hora"
                type="datetime-local"
                label="Fecha y hora de Guatemala *"
                variant="outlined"
                density="comfortable"
                hide-details="auto"
            />

            <VSelect
                v-model="formulario.modalidad"
                :items="modalidades"
                label="Modalidad *"
                variant="outlined"
                density="comfortable"
                hide-details="auto"
            />

            <VTextField
                v-model="formulario.lugar_enlace"
                label="Lugar o enlace"
                maxlength="500"
                variant="outlined"
                density="comfortable"
                hide-details="auto"
            />
          </template>

          <template v-else-if="accion === 'resultado'">
            <VRadioGroup
                v-model="formulario.resultado"
                label="Resultado de la entrevista *"
                inline
                hide-details="auto"
            >
              <VRadio label="Aprobada" value="APROBADA" />
              <VRadio label="No aprobada" value="NO_APROBADA" />
            </VRadioGroup>

            <VTextarea
                v-model="formulario.observaciones"
                label="Observaciones *"
                variant="outlined"
                rows="3"
                maxlength="5000"
                auto-grow
            />
          </template>

          <VTextarea
              v-else-if="accion === 'cancelar'"
              v-model="formulario.motivo_cancelacion"
              label="Motivo de cancelación de la cita *"
              variant="outlined"
              rows="3"
              maxlength="5000"
              auto-grow
          />

          <VTextarea
              v-else-if="accion === 'autorizar'"
              v-model="formulario.justificacion_continuidad"
              label="Justificación de continuidad *"
              hint="Indica por qué se autoriza avanzar pese al resultado."
              persistent-hint
              variant="outlined"
              rows="3"
              maxlength="5000"
              auto-grow
          />

          <template v-else-if="accion === 'baja'">
            <VAlert type="warning" variant="tonal">
              Al confirmar, se cerrará esta postulación y se registrará
              el motivo en la bitácora.
            </VAlert>

            <VTextarea
                v-model="formulario.motivo_baja"
                label="Motivo de baja de la postulación *"
                variant="outlined"
                rows="3"
                maxlength="5000"
                auto-grow
            />
          </template>
        </VCardText>

        <VDivider />

        <VCardActions class="pa-4">
          <VSpacer />

          <VBtn
              variant="text"
              :disabled="guardando"
              @click="dialogo = false"
          >
            Volver
          </VBtn>

          <VBtn
              :color="accion === 'baja' || accion === 'cancelar' ? 'error' : 'primary'"
              :disabled="!formularioValido"
              :loading="guardando"
              variant="flat"
              @click="guardar"
          >
            {{ accion === 'baja' ? 'Confirmar baja' : 'Guardar' }}
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>