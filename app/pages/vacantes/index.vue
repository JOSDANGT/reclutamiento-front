
<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
})

const auth = useAuthStore()
const { get, patch } = useClienteRequest()

const vacantes = ref<any[]>([])
const cargando = ref(false)
const guardandoEstado = ref(false)

const busqueda = ref('')
const error = ref('')
const mensaje = ref('')

const dialogoEstado = ref(false)
const vacanteSeleccionada = ref<any>(null)
const nuevoEstado = ref('')

const puedeCrear = computed(() =>
    auth.tienePermiso('Crear vacantes'),
)

const puedeEditar = computed(() =>
    auth.tienePermiso('Editar vacantes'),
)

const puedeCambiarEstado = computed(() =>
    auth.tienePermiso('Cambiar estado vacantes'),
)

const headers = [
  { title: 'ID', key: 'id', width: '75px' },
  { title: 'Título', key: 'titulo' },
  { title: 'Plazas', key: 'cantidad_plazas', align: 'center' as const },
  { title: 'Modalidad', key: 'modalidad' },
  { title: 'Estado', key: 'estado' },
  {
    title: 'Acciones',
    key: 'acciones',
    sortable: false,
    align: 'end' as const,
  },
]

const configuracionEstados: Record<string, any> = {
  BORRADOR: {
    color: 'secondary',
    texto: 'Borrador',
  },
  PUBLICADA: {
    color: 'success',
    texto: 'Publicada',
  },
  CERRADA: {
    color: 'warning',
    texto: 'Cerrada',
  },
}

const accionEstado = computed(() =>
    nuevoEstado.value === 'PUBLICADA' ? 'Publicar' : 'Cerrar',
)

async function obtenerVacantes() {
  cargando.value = true
  error.value = ''

  try {
    const respuesta = await get('/api/vacantes')

    // VacanteService::listar() devuelve un paginador Laravel.
    vacantes.value = respuesta.data.data
  }
  catch (exception: any) {
    error.value = exception.response?.data?.message
        || 'No fue posible obtener las vacantes.'
  }
  finally {
    cargando.value = false
  }
}

function solicitarCambioEstado(vacante: any, estado: string) {
  if (!puedeCambiarEstado.value) return

  const transiciones: Record<string, string> = {
    BORRADOR: 'PUBLICADA',
    PUBLICADA: 'CERRADA',
  }

  if (transiciones[vacante.estado] !== estado) return

  vacanteSeleccionada.value = vacante
  nuevoEstado.value = estado
  dialogoEstado.value = true
}

function cerrarDialogo() {
  if (guardandoEstado.value) return

  dialogoEstado.value = false
  vacanteSeleccionada.value = null
  nuevoEstado.value = ''
}

async function confirmarCambioEstado() {
  if (
      guardandoEstado.value
      || !puedeCambiarEstado.value
      || !vacanteSeleccionada.value
  ) return

  guardandoEstado.value = true
  error.value = ''
  mensaje.value = ''

  try {
    await patch(
        `/api/vacantes/estado/${vacanteSeleccionada.value.id}`,
        { estado: nuevoEstado.value },
    )

    mensaje.value = nuevoEstado.value === 'PUBLICADA'
        ? 'Vacante publicada correctamente.'
        : 'Vacante cerrada correctamente.'

    cerrarDialogoDespuesDeGuardar()

    await obtenerVacantes()
  }
  catch (exception: any) {
    const errores = exception.response?.data?.errors

    error.value = errores
        ? Object.values(errores).flat().join(' ')
        : exception.response?.data?.message
        || 'No fue posible actualizar el estado de la vacante.'
  }
  finally {
    guardandoEstado.value = false
  }
}

function cerrarDialogoDespuesDeGuardar() {
  dialogoEstado.value = false
  vacanteSeleccionada.value = null
  nuevoEstado.value = ''
}

onMounted(obtenerVacantes)
</script>

<template>
  <VContainer fluid class="pa-6">
    <div class="d-flex align-center justify-space-between flex-wrap ga-3 mb-6">
      <div>
        <h1 class="text-h5 font-weight-bold">
          Gestión de vacantes
        </h1>

        <p class="text-body-2 text-medium-emphasis mt-1">
          Administración y publicación de oportunidades laborales.
        </p>
      </div>

      <VBtn
          v-if="puedeCrear"
          color="primary"
          prepend-icon="mdi-plus"
          to="/vacantes/create"
      >
        Nueva vacante
      </VBtn>
    </div>

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
        v-if="mensaje"
        type="success"
        variant="tonal"
        closable
        class="mb-4"
        @click:close="mensaje = ''"
    >
      {{ mensaje }}
    </VAlert>

    <VCard rounded="lg" elevation="1">
      <VCardTitle class="d-flex align-center justify-space-between flex-wrap ga-3 pa-4">
        <span class="text-subtitle-1 font-weight-medium">
          Listado de vacantes
        </span>

        <VTextField
            v-model="busqueda"
            label="Buscar vacante"
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            density="compact"
            hide-details
            clearable
            style="max-width: 300px; width: 100%;"
        />
      </VCardTitle>

      <VDivider />

      <VDataTable
          :headers="headers"
          :items="vacantes"
          :search="busqueda"
          :loading="cargando"
          item-value="id"
          no-data-text="No hay vacantes registradas."
          loading-text="Cargando vacantes..."
      >
        <template #item.unidad.nombre="{ item }">
          {{ item.unidad?.nombre || 'Sin asignar' }}
        </template>

        <template #item.modalidad="{ item }">
          {{ item.modalidad?.replaceAll('_', ' ') }}
        </template>

        <template #item.estado="{ item }">
          <VChip
              :color="configuracionEstados[item.estado]?.color || 'secondary'"
              variant="tonal"
              size="small"
          >
            {{ configuracionEstados[item.estado]?.texto || item.estado }}
          </VChip>
        </template>

        <template #item.acciones="{ item }">
          <div class="d-flex justify-end align-center ga-1">
            <VTooltip text="Ver detalle">
              <template #activator="{ props: tooltipProps }">
                <VBtn
                    v-bind="tooltipProps"
                    icon="mdi-eye-outline"
                    variant="text"
                    color="info"
                    size="small"
                    :to="`/vacantes/acciones/show/${item.id}`"
                />
              </template>
            </VTooltip>

            <VTooltip v-if="puedeEditar" text="Editar">
              <template #activator="{ props: tooltipProps }">
                <VBtn
                    v-bind="tooltipProps"
                    icon="mdi-pencil-outline"
                    variant="text"
                    color="primary"
                    size="small"
                    :to="`/vacantes/acciones/edit/${item.id}`"
                />
              </template>
            </VTooltip>

            <VTooltip
                v-if="puedeCambiarEstado && item.estado === 'BORRADOR'"
                text="Publicar vacante"
            >
              <template #activator="{ props: tooltipProps }">
                <VBtn
                    v-bind="tooltipProps"
                    icon="mdi-send-outline"
                    variant="text"
                    color="success"
                    size="small"
                    @click="solicitarCambioEstado(item, 'PUBLICADA')"
                />
              </template>
            </VTooltip>

            <VTooltip
                v-if="puedeCambiarEstado && item.estado === 'PUBLICADA'"
                text="Cerrar vacante"
            >
              <template #activator="{ props: tooltipProps }">
                <VBtn
                    v-bind="tooltipProps"
                    icon="mdi-lock-outline"
                    variant="text"
                    color="warning"
                    size="small"
                    @click="solicitarCambioEstado(item, 'CERRADA')"
                />
              </template>
            </VTooltip>
          </div>
        </template>
      </VDataTable>
    </VCard>

    <!-- Confirmación de publicación o cierre -->
    <VDialog
        v-model="dialogoEstado"
        max-width="480"
        persistent
    >
      <VCard rounded="lg">
        <VCardTitle class="d-flex align-center ga-3 pa-5">
          <VIcon
              :icon="nuevoEstado === 'PUBLICADA'
              ? 'mdi-send-outline'
              : 'mdi-lock-outline'"
              :color="nuevoEstado === 'PUBLICADA'
              ? 'success'
              : 'warning'"
          />

          {{ accionEstado }} vacante
        </VCardTitle>

        <VDivider />

        <VCardText class="pa-5">
          <p class="text-body-1 mb-3">
            ¿Deseas {{ accionEstado.toLowerCase() }} la siguiente vacante?
          </p>

          <p class="font-weight-bold mb-3">
            {{ vacanteSeleccionada?.titulo }}
          </p>

          <VAlert
              :type="nuevoEstado === 'PUBLICADA' ? 'info' : 'warning'"
              variant="tonal"
          >
            <template v-if="nuevoEstado === 'PUBLICADA'">
              La vacante quedará disponible para recibir postulaciones.
            </template>

            <template v-else>
              La vacante dejará de recibir nuevas postulaciones.
              Las postulaciones existentes conservarán su estado.
            </template>
          </VAlert>
        </VCardText>

        <VDivider />

        <VCardActions class="pa-4">
          <VSpacer />

          <VBtn
              variant="text"
              :disabled="guardandoEstado"
              @click="cerrarDialogo"
          >
            Cancelar
          </VBtn>

          <VBtn
              :color="nuevoEstado === 'PUBLICADA' ? 'success' : 'warning'"
              :loading="guardandoEstado"
              @click="confirmarCambioEstado"
          >
            {{ accionEstado }} vacante
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </VContainer>
</template>
