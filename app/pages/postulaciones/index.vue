<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
})

const { get, put } = useClienteRequest()

const postulaciones = ref<any[]>([])
const estados = ref<any[]>([])
const detalle = ref<any>(null)

const cargando = ref(false)
const guardando = ref(false)
const cargandoDetalle = ref(false)

const error = ref('')
const mensaje = ref('')

const busqueda = ref('')
const estadoFiltro = ref<number | null>(null)

const pagina = ref(1)
const totalPaginas = ref(1)
const total = ref(0)

const dialogo = ref(false)
const estadoId = ref<number | null>(null)
const observaciones = ref('')

function obtenerContenido(respuesta: any) {
  return respuesta?.data?.data ?? respuesta?.data ?? respuesta
}

function formatearFecha(fecha: string | null) {
  if (!fecha) return '-'

  const [anio, mes, dia] = String(fecha)
      .substring(0, 10)
      .split('-')

  return `${dia}/${mes}/${anio}`
}

async function cargarEstados() {
  try {
    const respuesta = await get('/api/postulaciones/estados')
    const datos = obtenerContenido(respuesta)

    estados.value = Array.isArray(datos) ? datos : []
  }
  catch (e: any) {
    error.value = e.response?.data?.message
        || 'No se pudieron consultar los estados.'
  }
}

async function cargarPostulaciones() {
  cargando.value = true
  error.value = ''

  try {
    const params = new URLSearchParams({
      page: String(pagina.value),
      per_page: '15',
    })

    if (busqueda.value.trim()) {
      params.set('search', busqueda.value.trim())
    }

    if (estadoFiltro.value !== null) {
      params.set('estado_id', String(estadoFiltro.value))
    }

    const respuesta = await get(
        `/api/postulaciones?${params.toString()}`,
    )

    const datos = obtenerContenido(respuesta)

    postulaciones.value = Array.isArray(datos?.data)
        ? datos.data
        : Array.isArray(datos) ? datos : []

    totalPaginas.value = Number(datos?.last_page ?? 1)
    total.value = Number(datos?.total ?? postulaciones.value.length)
  }
  catch (e: any) {
    error.value = e.response?.data?.message
        || 'No se pudieron consultar las postulaciones.'
  }
  finally {
    cargando.value = false
  }
}

async function abrirDetalle(id: number) {
  cargandoDetalle.value = true
  error.value = ''

  try {
    const respuesta = await get(`/api/postulaciones/${id}`)

    detalle.value = obtenerContenido(respuesta)
    estadoId.value = detalle.value?.estado_id ?? null
    observaciones.value = detalle.value?.observaciones ?? ''

    dialogo.value = true
  }
  catch (e: any) {
    error.value = e.response?.data?.message
        || 'No se pudo consultar la postulación.'
  }
  finally {
    cargandoDetalle.value = false
  }
}

async function actualizarEstado() {
  if (!detalle.value || !estadoId.value || guardando.value) {
    return
  }

  guardando.value = true
  error.value = ''
  mensaje.value = ''

  try {
    await put(`/api/postulaciones/estado/${detalle.value.id}`, {
      estado_id: estadoId.value,
      observaciones: observaciones.value.trim() || null,
    })

    dialogo.value = false
    detalle.value = null

    await cargarPostulaciones()

    mensaje.value = 'Estado actualizado correctamente.'
  }
  catch (e: any) {
    const errores = e.response?.data?.errors

    error.value = errores
        ? Object.values(errores).flat().join(' ')
        : e.response?.data?.message
        || 'No se pudo actualizar el estado.'
  }
  finally {
    guardando.value = false
  }
}

function buscar() {
  if (pagina.value !== 1) {
    pagina.value = 1
  }
  else {
    cargarPostulaciones()
  }
}

function normalizarEstado(estado: string | null | undefined) {
  return String(estado ?? '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[_-]/g, ' ')
      .trim()
      .toUpperCase()
}

function obtenerAccionPostulacion(postulacion: any) {
  const estado = normalizarEstado(postulacion.estado?.nombre)

  if (estado === 'ENTREVISTA') {
    return {
      titulo: 'Gestionar agenda',
      icono: 'mdi-calendar-month',
      ruta: `/postulaciones/agenda/${postulacion.id}`,
      color: 'primary',
    }
  }

  return null
}

watch(pagina, cargarPostulaciones)
watch(estadoFiltro, buscar)

onMounted(async () => {
  await Promise.all([
    cargarEstados(),
    cargarPostulaciones(),
  ])
})
</script>

<template>
  <VContainer fluid class="pa-6">
    <div class="d-flex justify-space-between align-center mb-5">
      <div>
        <h1 class="text-h5 font-weight-bold">
          Gestión de postulaciones
        </h1>
        <p class="text-body-2 text-medium-emphasis">
          Revisa y administra las postulaciones recibidas.
        </p>
      </div>
    </div>

    <VAlert
        v-if="error"
        type="error"
        variant="tonal"
        class="mb-4"
        closable
        @click:close="error = ''"
    >
      {{ error }}
    </VAlert>

    <VAlert
        v-if="mensaje"
        type="success"
        variant="tonal"
        class="mb-4"
        closable
        @click:close="mensaje = ''"
    >
      {{ mensaje }}
    </VAlert>

    <VCard rounded="lg" elevation="1">
      <VCardText>
        <VRow align="center">
          <VCol cols="12" md="6">
            <VTextField
                v-model="busqueda"
                label="Buscar postulación"
                prepend-inner-icon="mdi-magnify"
                variant="outlined"
                density="comfortable"
                hide-details
                clearable
                @keydown.enter="buscar"
                @click:clear="busqueda = ''; buscar()"
            />
          </VCol>

          <VCol cols="12" md="4">
            <VSelect
                v-model="estadoFiltro"
                :items="estados"
                item-title="nombre"
                item-value="id"
                label="Estado"
                variant="outlined"
                density="comfortable"
                hide-details
                clearable
            />
          </VCol>

          <VCol cols="12" md="2">
            <VBtn
                color="primary"
                block
                :loading="cargando"
                @click="buscar"
            >
              Buscar
            </VBtn>
          </VCol>
        </VRow>
      </VCardText>

      <VDivider />

      <VTable>
        <thead>
        <tr>
          <th>ID</th>
          <th>Vacante</th>
          <th>Candidato</th>
          <th>Fecha</th>
          <th>Estado</th>
          <th class="text-end">Acciones</th>
        </tr>
        </thead>

        <tbody>
        <tr
            v-for="postulacion in postulaciones"
            :key="postulacion.id"
        >
          <td>{{ postulacion.id }}</td>
          <td>
            {{ postulacion.vacante?.titulo ?? '-' }}
          </td>
          <td>
            Candidato #{{ postulacion.candidato_id }}
          </td>
          <td>
            {{ formatearFecha(postulacion.fecha_postulacion) }}
          </td>
          <td>
            <VChip size="small" variant="tonal" color="primary">
              {{ postulacion.estado?.nombre ?? '-' }}
            </VChip>
          </td>
          <td class="text-end">
            <div class="d-flex align-center justify-end ga-2">
              <!-- Expediente disponible en cualquier estado -->
              <VTooltip text="Ver expediente" location="top">
                <template #activator="{ props: tooltipProps }">
                  <VBtn
                      v-bind="tooltipProps"
                      :to="`/postulaciones/${postulacion.id}`"
                      icon="mdi-eye-outline"
                      variant="text"
                      color="primary"
                      size="small"
                  />
                </template>
              </VTooltip>

              <!-- Gestión específica de la etapa -->
              <VTooltip
                  v-if="obtenerAccionPostulacion(postulacion)"
                  :text="obtenerAccionPostulacion(postulacion)?.titulo"
                  location="top"
              >
                <template #activator="{ props: tooltipProps }">
                  <VBtn
                      v-bind="tooltipProps"
                      :to="obtenerAccionPostulacion(postulacion)?.ruta"
                      :icon="obtenerAccionPostulacion(postulacion)?.icono"
                      :color="obtenerAccionPostulacion(postulacion)?.color"
                      variant="tonal"
                      size="small"
                  />
                </template>
              </VTooltip>
            </div>
          </td>
        </tr>

        <tr v-if="!cargando && !postulaciones.length">
          <td colspan="6" class="text-center py-6">
            No se encontraron postulaciones.
          </td>
        </tr>
        </tbody>
      </VTable>

      <VProgressLinear
          v-if="cargando"
          indeterminate
          color="primary"
      />

      <VCardActions class="justify-space-between pa-4">
        <span class="text-caption text-medium-emphasis">
          {{ total }} postulaciones
        </span>

        <VPagination
            v-if="totalPaginas > 1"
            v-model="pagina"
            :length="totalPaginas"
            :total-visible="5"
        />
      </VCardActions>
    </VCard>
  </VContainer>
</template>
