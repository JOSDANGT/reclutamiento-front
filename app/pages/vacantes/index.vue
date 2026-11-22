
<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
})

const auth = useAuthStore()
const { get } = useClienteRequest()

const router = useRouter()

const vacantes = ref<any[]>([])
const cargando = ref(false)
const busqueda = ref('')
const error = ref('')

const puedeCrear = computed(() =>
    auth.tienePermiso('Crear vacantes'),
)

const headers = [
  { title: 'ID', key: 'id', width: '80px' },
  { title: 'Título', key: 'titulo' },
  { title: 'Unidad', key: 'unidad.nombre' },
  { title: 'Estado', key: 'estado' },
  { title: 'Acciones', key: 'acciones', sortable: false, align: 'center' as const },
]

async function obtenerVacantes() {
  cargando.value = true
  error.value = ''

  try {
    const respuesta = await get('/api/vacantes')

    // Admite respuestas con data como arreglo o paginación Laravel
    vacantes.value = Array.isArray(respuesta.data)
        ? respuesta.data
        : respuesta.data?.data ?? []
  }
  catch (exception: any) {
    error.value = exception.response?.data?.message
        || 'No fue posible obtener las vacantes.'
  }
  finally {
    cargando.value = false
  }
}

function crearVacante() {
  router.push('/vacantes/create')
}

onMounted(() => {
  obtenerVacantes()
})
</script>

<template>
  <VContainer fluid class="pa-6">
    <div class="d-flex justify-space-between align-center flex-wrap ga-3 mb-6">
      <div>
        <h1 class="text-h5 font-weight-bold">
          Gestión de vacantes
        </h1>

        <p class="text-body-2 text-medium-emphasis mt-1">
          Administración de oportunidades laborales.
        </p>
      </div>

      <VBtn
          v-if="puedeCrear"
          color="primary"
          prepend-icon="mdi-plus"
          @click="crearVacante"
      >
        Nueva vacante
      </VBtn>
    </div>

    <VAlert
        v-if="error"
        type="error"
        variant="tonal"
        class="mb-4"
    >
      {{ error }}
    </VAlert>

    <VCard rounded="lg" elevation="1">
      <VCardTitle class="pa-4">
        <div class="d-flex align-center justify-space-between flex-wrap ga-3">
          <span class="text-subtitle-1">
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
        </div>
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

        <template #item.estado="{ item }">
          <VChip
              :color="
              ['PUBLICADA', 'ABIERTA', 'ACTIVA'].includes(String(item.estado).toUpperCase())
                ? 'success'
                : 'secondary'
            "
              variant="tonal"
              size="small"
          >
            {{ item.estado || 'Sin estado' }}
          </VChip>
        </template>

        <template #item.acciones="{ item }">
          <VBtn
              icon="mdi-eye-outline"
              variant="text"
              color="info"
              size="small"
              :to="`/vacantes/acciones/show/${item.id}`"
          />

          <VBtn
              v-if="auth.tienePermiso('Editar vacantes')"
              icon="mdi-pencil-outline"
              variant="text"
              color="primary"
              size="small"
              :to="`/vacantes/acciones/edit/${item.id}`"
          />
        </template>
      </VDataTable>
    </VCard>
  </VContainer>
</template>
