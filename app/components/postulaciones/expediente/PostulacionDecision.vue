
<script setup lang="ts">
const props = defineProps<{
  postulacion: any
  estados: any[]
  evaluacionGuardada: boolean
  evaluacionAprobada: boolean
}>()

const emit = defineEmits<{
  actualizado: []
}>()

const { put } = useClienteRequest()

const nuevoEstadoId = ref<number | null>(null)
const observaciones = ref('')
const guardando = ref(false)
const error = ref('')
const confirmarDecision = ref(false)

const transicionesPermitidas: Record<string, string[]> = {
  RECIBIDA: ['EN REVISION', 'RECHAZADA'],
  'EN REVISION': ['ENTREVISTA', 'RECHAZADA'],
  ENTREVISTA: ['SELECCIONADA', 'RECHAZADA'],
  SELECCIONADA: ['CONTRATADA', 'RECHAZADA'],
  RECHAZADA: [],
  CONTRATADA: [],
  RETIRADA: [],
}

const acciones: Record<string, {
  titulo: string
  descripcion: string
  icono: string
  color: string
}> = {
  'EN REVISION': {
    titulo: 'Iniciar revisión',
    descripcion: 'Comenzar la evaluación del candidato.',
    icono: 'mdi-magnify',
    color: 'primary',
  },
  ENTREVISTA: {
    titulo: 'Avanzar a entrevista',
    descripcion: 'Continuar con el proceso de entrevistas.',
    icono: 'mdi-account-group-outline',
    color: 'primary',
  },
  SELECCIONADA: {
    titulo: 'Seleccionar candidato',
    descripcion: 'Aprobar al candidato para continuar el proceso.',
    icono: 'mdi-check-circle-outline',
    color: 'success',
  },
  CONTRATADA: {
    titulo: 'Confirmar contratación',
    descripcion: 'Registrar la contratación del candidato.',
    icono: 'mdi-account-check',
    color: 'success',
  },
  RECHAZADA: {
    titulo: 'Rechazar postulación',
    descripcion: 'Finalizar su participación en el proceso.',
    icono: 'mdi-close-circle-outline',
    color: 'error',
  },
}

function normalizar(valor: string | null | undefined) {
  return String(valor ?? '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[_-]/g, ' ')
      .trim()
      .toUpperCase()
}

const estadosDisponibles = computed(() => {
  const actual = normalizar(props.postulacion?.estado?.nombre)
  const permitidos = transicionesPermitidas[actual] ?? []

  return props.estados.filter(estado =>
      permitidos.includes(normalizar(estado.nombre)),
  )
})

const estadoElegido = computed(() =>
    estadosDisponibles.value.find(
        estado => Number(estado.id) === nuevoEstadoId.value,
    ),
)

const nombreEstadoElegido = computed(() =>
    normalizar(estadoElegido.value?.nombre),
)

const requiereEvaluacion = computed(() =>
    ['ENTREVISTA', 'SELECCIONADA'].includes(nombreEstadoElegido.value),
)

const esRechazo = computed(() =>
    nombreEstadoElegido.value === 'RECHAZADA',
)

const requiereJustificacion = computed(() =>
    esRechazo.value
    || (requiereEvaluacion.value && !props.evaluacionAprobada),
)

const puedeGuardar = computed(() => {
  if (!estadoElegido.value || guardando.value) {
    return false
  }

  // Para avanzar a entrevista o selección debe existir
  // una evaluación completa y guardada.
  if (requiereEvaluacion.value && !props.evaluacionGuardada) {
    return false
  }

  // Si el candidato no cumple todos los requisitos,
  // puede avanzar siempre que RR. HH. justifique.
  if (requiereJustificacion.value && !observaciones.value.trim()) {
    return false
  }

  return true
})

const requiereConfirmacion = computed(() =>
    esRechazo.value
    || nombreEstadoElegido.value === 'CONTRATADA'
    || (requiereEvaluacion.value && !props.evaluacionAprobada),
)

function obtenerAccion(nombre: string) {
  return acciones[normalizar(nombre)] ?? {
    titulo: nombre,
    descripcion: 'Continuar con el proceso.',
    icono: 'mdi-arrow-right-circle-outline',
    color: 'primary',
  }
}

function seleccionarEstado(id: number) {
  if (guardando.value) return

  nuevoEstadoId.value = id
  observaciones.value = ''
  error.value = ''
}

function inicializar() {
  nuevoEstadoId.value = null
  observaciones.value = ''
  error.value = ''
  confirmarDecision.value = false
}

watch(
    () => [props.postulacion?.id, props.postulacion?.estado_id],
    inicializar,
    { immediate: true },
)

async function guardar() {
  if (!puedeGuardar.value) return

  // Mostrar confirmación adicional para acciones importantes.
  if (requiereConfirmacion.value) {
    confirmarDecision.value = true
    return
  }

  await ejecutarCambioEstado()
}

async function ejecutarCambioEstado() {
  if (!puedeGuardar.value) return

  guardando.value = true
  error.value = ''

  try {
    await put(
        `/api/postulaciones/estado/${props.postulacion.id}/`,
        {
          estado_id: nuevoEstadoId.value,
          observaciones: observaciones.value.trim() || null,
        },
    )

    confirmarDecision.value = false
    inicializar()

    emit('actualizado')
  }
  catch (e: any) {
    const errores = e.response?.data?.errors

    error.value = errores
        ? Object.values(errores).flat().join(' ')
        : e.response?.data?.message
        ?? 'No se pudo actualizar el estado.'

    confirmarDecision.value = false
  }
  finally {
    guardando.value = false
  }
}
</script>

<template>
  <VCard rounded="lg">
    <VCardTitle class="d-flex align-center pa-5">
      <VIcon
          icon="mdi-clipboard-check-outline"
          color="primary"
          class="mr-2"
      />
      Decisión de Recursos Humanos
    </VCardTitle>

    <VDivider />

    <VCardText class="pa-5">
      <VAlert
          v-if="error"
          type="error"
          variant="tonal"
          closable
          class="mb-4"
          @click:close="error = ''"
      >
        {{ error }}
      </VAlert>

      <VAlert
          v-if="!estadosDisponibles.length"
          type="info"
          variant="tonal"
      >
        Esta postulación no tiene más acciones disponibles.
      </VAlert>

      <template v-else>
        <div class="text-subtitle-2 font-weight-medium mb-3">
          ¿Qué deseas hacer con esta postulación?
        </div>

        <VRadioGroup
            v-model="nuevoEstadoId"
            hide-details
            class="mb-4"
        >
          <div class="d-flex flex-column ga-3">
            <VSheet
                v-for="estado in estadosDisponibles"
                :key="estado.id"
                border
                rounded="lg"
                class="pa-3 cursor-pointer"
                :class="{
                'border-primary': nuevoEstadoId === Number(estado.id),
              }"
                @click="seleccionarEstado(Number(estado.id))"
            >
              <div class="d-flex align-center ga-3">
                <VRadio
                    :value="Number(estado.id)"
                    :disabled="guardando"
                    color="primary"
                    hide-details
                />

                <VAvatar
                    :color="obtenerAccion(estado.nombre).color"
                    variant="tonal"
                    size="42"
                >
                  <VIcon
                      :icon="obtenerAccion(estado.nombre).icono"
                      :color="obtenerAccion(estado.nombre).color"
                  />
                </VAvatar>

                <div class="flex-grow-1">
                  <div class="font-weight-medium">
                    {{ obtenerAccion(estado.nombre).titulo }}
                  </div>

                  <div class="text-body-2 text-medium-emphasis">
                    {{ obtenerAccion(estado.nombre).descripcion }}
                  </div>
                </div>
              </div>
            </VSheet>
          </div>
        </VRadioGroup>

        <!-- Evaluación pendiente -->
        <VAlert
            v-if="requiereEvaluacion && !evaluacionGuardada"
            type="warning"
            variant="tonal"
            density="comfortable"
            class="mb-4"
        >
          Debes completar y guardar la evaluación de requisitos
          antes de continuar con esta etapa.
        </VAlert>

        <!-- Evaluación desfavorable, pero se permite continuar -->
        <VAlert
            v-if="requiereEvaluacion && evaluacionGuardada && !evaluacionAprobada"
            type="warning"
            variant="tonal"
            density="comfortable"
            class="mb-4"
        >
          El candidato no cumple todos los requisitos evaluados.
          Puedes autorizar su continuidad, pero debes justificar
          la decisión en las observaciones.
        </VAlert>

        <VTextarea
            v-if="nuevoEstadoId !== null"
            v-model="observaciones"
            :label="requiereJustificacion
            ? 'Justificación de la decisión *'
            : 'Observaciones de la decisión'"
            variant="outlined"
            density="comfortable"
            rows="3"
            auto-grow
            :counter="5000"
            maxlength="5000"
            class="mt-4"
        />

        <div
            v-if="nuevoEstadoId !== null"
            class="d-flex justify-end mt-3"
        >
          <VBtn
              :color="esRechazo ? 'error' : 'primary'"
              :prepend-icon="esRechazo
              ? 'mdi-close-circle-outline'
              : 'mdi-check-circle-outline'"
              :loading="guardando"
              :disabled="!puedeGuardar"
              @click="guardar"
          >
            {{ esRechazo ? 'Confirmar rechazo' : 'Confirmar decisión' }}
          </VBtn>
        </div>
      </template>
    </VCardText>

    <!-- Confirmación de acciones importantes -->
    <VDialog
        v-model="confirmarDecision"
        max-width="460"
        persistent
    >
      <VCard>
        <VCardTitle class="d-flex align-center ga-2 pa-4">
          <VIcon
              :icon="esRechazo
              ? 'mdi-alert-circle-outline'
              : 'mdi-help-circle-outline'"
              :color="esRechazo ? 'error' : 'primary'"
          />

          Confirmar decisión
        </VCardTitle>

        <VCardText>
          <p>
            ¿Deseas continuar con la siguiente acción?
          </p>

          <p class="font-weight-medium mt-2">
            {{ obtenerAccion(estadoElegido?.nombre ?? '').titulo }}
          </p>

          <VAlert
              v-if="requiereEvaluacion && !evaluacionAprobada"
              type="warning"
              variant="tonal"
              density="comfortable"
              class="mt-3"
          >
            Estás autorizando la continuidad de un candidato que
            no cumple todos los requisitos evaluados.
          </VAlert>
        </VCardText>

        <VCardActions class="pa-4">
          <VSpacer />

          <VBtn
              variant="text"
              :disabled="guardando"
              @click="confirmarDecision = false"
          >
            Cancelar
          </VBtn>

          <VBtn
              :color="esRechazo ? 'error' : 'primary'"
              :loading="guardando"
              @click="ejecutarCambioEstado"
          >
            Confirmar
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </VCard>
</template>
