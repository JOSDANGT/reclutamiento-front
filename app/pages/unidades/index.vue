
<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
})

const auth = useAuthStore()
const { get } = useClienteRequest()

const unidades = ref<any[]>([])
const cargando = ref(false)
const error = ref('')
const busqueda = ref('')

const headers = [
  { title: 'ID', key: 'id', width: '80px' },
  { title: 'Nombre', key: 'nombre' },
  { title: 'Descripción', key: 'descripcion' },
  { title: 'Estado', key: 'estado', align: 'center' as const },
  { title: 'Acciones', key: 'acciones', align: 'center' as const, sortable: false },
]

const puedeCrear = computed(() => auth.tienePermiso('Crear unidades'))
const puedeEditar = computed(() => auth.tienePermiso('Editar unidades'))

async function obtenerUnidades() {
  cargando.value = true
  error.value = ''

  try {
    const respuesta = await get('/api/unidades')

    unidades.value = respuesta.data
  }
  catch (exception: any) {
    error.value = exception.response?.data?.message
        || 'No fue posible obtener las unidades.'
  }
  finally {
    cargando.value = false
  }
}

onMounted(() => {
  obtenerUnidades()
})
</script>

<template>
  <VContainer fluid class="pa-6">
    <div class="d-flex align-center justify-space-between flex-wrap ga-3 mb-6">
      <div>
        <h1 class="text-h5 font-weight-bold">
          Unidades
        </h1>

        <p class="text-body-2 text-medium-emphasis mt-1">
          Administración de unidades organizacionales.
        </p>
      </div>

      <VBtn
          v-if="puedeCrear"
          color="primary"
          prepend-icon="mdi-plus"
          disabled
      >
        Nueva unidad
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
          <span class="text-subtitle-1 font-weight-medium">
            Listado de unidades
          </span>

          <VTextField
              v-model="busqueda"
              label="Buscar unidad"
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="compact"
              hide-details
              clearable
              width="280"
          />
        </div>
      </VCardTitle>

      <VDivider />

      <VDataTable
          :headers="headers"
          :items="unidades"
          :search="busqueda"
          :loading="cargando"
          item-value="id"
          no-data-text="No hay unidades registradas."
          loading-text="Cargando unidades..."
      >
        <template #item.estado="{ item }">
          <VChip
              :color="item.estado ? 'success' : 'error'"
              size="small"
              variant="tonal"
          >
            {{ item.estado ? 'Activa' : 'Inactiva' }}
          </VChip>
        </template>

        <template #item.acciones="{ item }">
          <VBtn
              v-if="puedeEditar"
              icon="mdi-pencil-outline"
              variant="text"
              color="primary"
              size="small"
              disabled
          />

          <VBtn
              v-if="puedeEditar"
              :icon="item.estado ? 'mdi-toggle-switch' : 'mdi-toggle-switch-off-outline'"
              variant="text"
              :color="item.estado ? 'success' : 'grey'"
              size="small"
              disabled
          />
        </template>
      </VDataTable>
    </VCard>
  </VContainer>
</template>
