
<script setup lang="ts">
import PostulacionTracking from '@/components/postulaciones/PostulacionTracking.vue'
import {
  ETAPAS_POSTULACION,
  ESTADOS_FINALES_POSTULACION,
} from '@/utils/postulaciones/etapas'

definePageMeta({
  middleware: 'auth',
})

const { get, put } = useClienteRequest()

const postulaciones = ref<any[]>([])
const cargando = ref(false)
const retirando = ref(false)

const error = ref('')
const mensaje = ref('')

const busqueda = ref('')
const estadoFiltro = ref<string | null>(null)

const pagina = ref(1)
const totalPaginas = ref(1)
const totalRegistros = ref(0)
const perPage = 9

const dialogoRetirar = ref(false)
const postulacionSeleccionada = ref<any>(null)

const estados = [
  { title: 'Todos los estados', value: null },
  { title: 'Recibida', value: 'RECIBIDA' },
  { title: 'En revisión', value: 'EN REVISION' },
  { title: 'Entrevista', value: 'ENTREVISTA' },
  { title: 'Seleccionada', value: 'SELECCIONADA' },
  { title: 'Rechazada', value: 'RECHAZADA' },
  { title: 'Retirada', value: 'RETIRADA' },
]

function extraerPaginacion(respuesta: any) {
  let contenido = respuesta

  for (let i = 0; i < 4; i++) {
    if (Array.isArray(contenido?.data)) {
      return contenido
    }

    contenido = contenido?.data
  }

  return null
}

function normalizarEstado(estado: string | null | undefined) {
  return String(estado ?? '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[_-]/g, ' ')
      .trim()
      .toUpperCase()
}

function estadoNombre(postulacion: any) {
  return postulacion.estado?.nombre ?? 'Sin estado'
}

function colorEstado(estado: string) {
  switch (normalizarEstado(estado)) {
    case 'RECIBIDA':
      return 'info'
    case 'EN REVISION':
      return 'primary'
    case 'ENTREVISTA':
      return 'warning'
    case 'SELECCIONADA':
      return 'success'
    case 'RECHAZADA':
      return 'error'
    case 'RETIRADA':
      return 'secondary'
    default:
      return 'grey'
  }
}

function puedeRetirar(postulacion: any) {
  const estado = normalizarEstado(estadoNombre(postulacion))

  return ![
    'RETIRADA',
    'OFERTA RECHAZADA',
    'RECHAZADA',
    'SELECCIONADA',
    'SIN ESTADO',
  ].includes(estado)
}

function formatearFecha(fecha: string | null) {
  if (!fecha) return 'No especificada'

  const [anio, mes, dia] = String(fecha)
      .substring(0, 10)
      .split('-')

  return anio && mes && dia
      ? `${dia}/${mes}/${anio}`
      : String(fecha)
}

async function obtenerPostulaciones() {
  cargando.value = true
  error.value = ''

  try {
    const parametros = new URLSearchParams({
      page: String(pagina.value),
      per_page: String(perPage),
    })

    if (busqueda.value.trim()) {
      parametros.set('search', busqueda.value.trim())
    }

    if (estadoFiltro.value) {
      parametros.set('estado', estadoFiltro.value)
    }

    const respuesta = await get(
        `/api/candidatos/mi-perfil/postulaciones?${parametros.toString()}`,
    )

    const datos = extraerPaginacion(respuesta)

    postulaciones.value = datos?.data ?? []
    totalPaginas.value = Number(datos?.last_page ?? 1)
    totalRegistros.value = Number(datos?.total ?? 0)
  }
  catch (exception: any) {
    error.value = exception.response?.data?.message
        || 'No fue posible consultar tus postulaciones.'
  }
  finally {
    cargando.value = false
  }
}

function buscar() {
  if (pagina.value !== 1) {
    pagina.value = 1
    return
  }

  obtenerPostulaciones()
}

function confirmarRetiro(postulacion: any) {
  if (!puedeRetirar(postulacion)) return

  postulacionSeleccionada.value = postulacion
  dialogoRetirar.value = true
}

function cerrarRetiro() {
  if (retirando.value) return

  dialogoRetirar.value = false
  postulacionSeleccionada.value = null
}

async function retirarPostulacion() {
  if (!postulacionSeleccionada.value || retirando.value) return

  retirando.value = true
  error.value = ''
  mensaje.value = ''

  try {
    await put(
        `/api/candidatos/mi-perfil/postulaciones/${postulacionSeleccionada.value.id}/retirar`,
        {},
    )

    dialogoRetirar.value = false
    postulacionSeleccionada.value = null

    mensaje.value = 'Tu postulación fue retirada correctamente.'

    await obtenerPostulaciones()

    if (!postulaciones.value.length && pagina.value > 1) {
      pagina.value = Math.max(1, totalPaginas.value)
    }
  }
  catch (exception: any) {
    const errores = exception.response?.data?.errors

    error.value = errores
        ? Object.values(errores).flat().join(' ')
        : exception.response?.data?.message
        || 'No fue posible retirar tu postulación.'
  }
  finally {
    retirando.value = false
  }
}

watch(pagina, obtenerPostulaciones)
watch(estadoFiltro, buscar)

onMounted(obtenerPostulaciones)
</script>

<template>
  <VContainer fluid class="pa-6">
    <div class="d-flex justify-space-between align-center flex-wrap ga-3 mb-6">
      <div>
        <h1 class="text-h5 font-weight-bold">
          Mis postulaciones
        </h1>

        <p class="text-body-2 text-medium-emphasis mt-2">
          Consulta el avance de tus procesos de selección.
        </p>
      </div>

      <VBtn
          color="primary"
          prepend-icon="mdi-briefcase-search-outline"
          to="/oportunidades"
      >
        Explorar oportunidades
      </VBtn>
    </div>

    <VCard
        rounded="lg"
        elevation="1"
        class="mb-5"
    >
      <VCardText class="pa-5">
        <VRow align="center">
          <VCol cols="12" md="7">
            <VTextField
                v-model="busqueda"
                label="Buscar vacante"
                placeholder="Nombre de la oportunidad..."
                prepend-inner-icon="mdi-magnify"
                variant="outlined"
                density="comfortable"
                hide-details
                clearable
                @keydown.enter="buscar"
                @click:clear="busqueda = ''; buscar()"
            />
          </VCol>

          <VCol cols="12" md="3">
            <VSelect
                v-model="estadoFiltro"
                :items="estados"
                label="Estado"
                variant="outlined"
                density="comfortable"
                hide-details
            />
          </VCol>

          <VCol cols="12" md="2">
            <VBtn
                color="primary"
                block
                height="40"
                prepend-icon="mdi-magnify"
                :loading="cargando"
                @click="buscar"
            >
              Buscar
            </VBtn>
          </VCol>
        </VRow>
      </VCardText>
    </VCard>

    <VAlert
        v-if="error"
        type="error"
        variant="tonal"
        closable
        class="mb-5"
        @click:close="error = ''"
    >
      {{ error }}
    </VAlert>

    <VAlert
        v-if="mensaje"
        type="success"
        variant="tonal"
        closable
        class="mb-5"
        @click:close="mensaje = ''"
    >
      {{ mensaje }}
    </VAlert>

    <VProgressLinear
        v-if="cargando"
        indeterminate
        color="primary"
        class="mb-5"
    />

    <div
        v-if="!cargando"
        class="d-flex align-center justify-space-between mb-4"
    >
      <div class="text-subtitle-1 font-weight-medium">
        Postulaciones registradas
      </div>

      <VChip
          color="primary"
          variant="tonal"
          size="small"
      >
        {{ totalRegistros }} resultados
      </VChip>
    </div>

    <VAlert
        v-if="!cargando && !postulaciones.length"
        type="info"
        variant="tonal"
        class="mb-5"
    >
      No se encontraron postulaciones con los filtros seleccionados.
    </VAlert>

    <div
        v-if="!cargando && postulaciones.length"
        class="d-flex flex-column ga-4"
    >
      <VCard
          v-for="postulacion in postulaciones"
          :key="postulacion.id"
          rounded="lg"
          elevation="1"
      >
        <VCardText class="pa-5">
          <div class="d-flex justify-space-between align-start flex-wrap ga-3">
            <div class="flex-grow-1">
              <div class="d-flex align-center flex-wrap ga-2 mb-3">
                <VChip
                    :color="colorEstado(estadoNombre(postulacion))"
                    variant="tonal"
                    size="small"
                >
                  {{ estadoNombre(postulacion) }}
                </VChip>

                <span class="text-caption text-medium-emphasis">
                  Postulación #{{ postulacion.id }}
                </span>
              </div>

              <div class="text-h6 font-weight-bold mb-2">
                {{ postulacion.vacante?.titulo ?? 'Vacante no disponible' }}
              </div>

              <div class="d-flex flex-wrap ga-4 text-body-2 text-medium-emphasis">
                <span v-if="postulacion.vacante?.puesto?.nombre">
                  <VIcon
                      icon="mdi-briefcase-outline"
                      size="18"
                      class="mr-1"
                  />
                  {{ postulacion.vacante.puesto.nombre }}
                </span>

                <span v-if="postulacion.vacante?.puesto?.unidad?.nombre">
                  <VIcon
                      icon="mdi-office-building-outline"
                      size="18"
                      class="mr-1"
                  />
                  {{ postulacion.vacante.puesto.unidad.nombre }}
                </span>

                <span>
                  <VIcon
                      icon="mdi-calendar-outline"
                      size="18"
                      class="mr-1"
                  />
                  {{ formatearFecha(postulacion.fecha_postulacion) }}
                </span>
              </div>
            </div>

            <VBtn
                v-if="postulacion.vacante?.id"
                :to="`/oportunidades/${postulacion.vacante.id}`"
                variant="outlined"
                color="primary"
                prepend-icon="mdi-open-in-new"
            >
              Ver vacante
            </VBtn>
          </div>

          <VDivider class="my-4" />

          <VExpansionPanels
              variant="accordion"
              elevation="0"
          >
            <VExpansionPanel rounded="lg">
              <VExpansionPanelTitle>
                <div class="d-flex align-center ga-2">
                  <VIcon
                      icon="mdi-timeline-check-outline"
                      color="primary"
                  />
                  <span class="font-weight-medium">
                    Ver seguimiento
                  </span>
                </div>
              </VExpansionPanelTitle>

              <VExpansionPanelText>
                <PostulacionTracking
                    :estado="postulacion.estado?.nombre ?? null"
                    :fecha-postulacion="postulacion.fecha_postulacion"
                    :etapas="ETAPAS_POSTULACION"
                    :estados-finales="ESTADOS_FINALES_POSTULACION"
                />

                <VCard
                    v-if="postulacion.carta_presentacion"
                    variant="tonal"
                    class="mt-4"
                >
                  <VCardText>
                    <div class="text-subtitle-2 font-weight-medium mb-2">
                      Carta de presentación
                    </div>

                    <div class="text-body-2 carta">
                      {{ postulacion.carta_presentacion }}
                    </div>
                  </VCardText>
                </VCard>

                <div
                    v-if="puedeRetirar(postulacion)"
                    class="d-flex justify-end mt-4"
                >
                  <VBtn
                      color="error"
                      variant="outlined"
                      prepend-icon="mdi-close-circle-outline"
                      @click="confirmarRetiro(postulacion)"
                  >
                    Retirar postulación
                  </VBtn>
                </div>
              </VExpansionPanelText>
            </VExpansionPanel>
          </VExpansionPanels>
        </VCardText>
      </VCard>
    </div>

    <div
        v-if="!cargando && totalPaginas > 1"
        class="d-flex justify-center mt-6"
    >
      <VPagination
          v-model="pagina"
          :length="totalPaginas"
          :total-visible="5"
      />
    </div>

    <VDialog
        v-model="dialogoRetirar"
        max-width="500"
        persistent
    >
      <VCard rounded="lg">
        <VCardTitle class="pa-5">
          <VIcon
              icon="mdi-alert-circle-outline"
              color="warning"
              class="mr-2"
          />
          Retirar postulación
        </VCardTitle>

        <VDivider />

        <VCardText class="pa-5">
          <p class="mb-3">
            ¿Deseas retirar tu postulación de esta oportunidad laboral?
          </p>

          <div class="font-weight-medium">
            {{ postulacionSeleccionada?.vacante?.titulo }}
          </div>

          <VAlert
              type="warning"
              variant="tonal"
              density="comfortable"
              class="mt-4"
          >
            Dejarás de participar en este proceso de selección.
          </VAlert>
        </VCardText>

        <VCardActions class="pa-4">
          <VSpacer />

          <VBtn
              variant="text"
              :disabled="retirando"
              @click="cerrarRetiro"
          >
            Cancelar
          </VBtn>

          <VBtn
              color="error"
              :loading="retirando"
              @click="retirarPostulacion"
          >
            Confirmar retiro
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </VContainer>
</template>

<style scoped>
.carta {
  white-space: pre-line;
  overflow-wrap: anywhere;
}
</style>
