
<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
})

const { get } = useClienteRequest()

const vacantes = ref<any[]>([])
const cargando = ref(false)
const error = ref('')

const busqueda = ref('')
const pagina = ref(1)
const totalPaginas = ref(1)
const totalRegistros = ref(0)

const perPage = 9


async function obtenerOportunidades() {
  cargando.value = true
  error.value = ''

  try {
    const parametros = new URLSearchParams({
      per_page: String(perPage),
      page: String(pagina.value),
    })

    if (busqueda.value.trim()) {
      parametros.set('search', busqueda.value.trim())
    }

    const respuesta = await get(
        `/api/oportunidades?${parametros.toString()}`,
    )

    const contenido = respuesta.data ?? respuesta

    const paginacion = Array.isArray(contenido?.data)
        ? contenido
        : contenido?.data ?? contenido

    vacantes.value = Array.isArray(paginacion?.data)
        ? paginacion.data
        : []

    totalPaginas.value = Number(paginacion?.last_page ?? 1)
    totalRegistros.value = Number(paginacion?.total ?? 0)
  }
  catch (exception: any) {
    error.value = exception.response?.data?.message
        || 'No fue posible consultar las oportunidades laborales.'

    vacantes.value = []
    totalPaginas.value = 1
    totalRegistros.value = 0
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

  obtenerOportunidades()
}

watch(pagina, obtenerOportunidades)

onMounted(obtenerOportunidades)
</script>

<template>
  <VContainer fluid class="pa-6">
    <div class="mb-6">
      <h1 class="text-h5 font-weight-bold">
        Oportunidades laborales
      </h1>

      <p class="text-body-2 text-medium-emphasis mt-2">
        Explora las vacantes disponibles y encuentra una oportunidad
        acorde con tu experiencia y conocimientos.
      </p>
    </div>

    <VCard rounded="lg" elevation="1" class="mb-6">
      <VCardText>
        <VRow align="center">
          <VCol cols="12" md="10">
            <VTextField
                v-model="busqueda"
                label="Buscar oportunidades"
                placeholder="Ej. Analista de Créditos"
                prepend-inner-icon="mdi-magnify"
                variant="outlined"
                density="comfortable"
                hide-details
                clearable
                @keydown.enter="buscar"
                @click:clear="buscar"
            />
          </VCol>

          <VCol cols="12" md="2">
            <VBtn
                color="primary"
                block
                height="48"
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
        class="mb-5"
    >
      {{ error }}
    </VAlert>

    <VProgressLinear
        v-if="cargando"
        indeterminate
        color="primary"
        class="mb-5"
    />

    <div
        v-if="!cargando && !error"
        class="text-body-2 text-medium-emphasis mb-4"
    >
      {{ totalRegistros }}
      {{ totalRegistros === 1 ? 'oportunidad disponible' : 'oportunidades disponibles' }}
    </div>

    <VRow v-if="!cargando && vacantes.length">
      <VCol
          v-for="vacante in vacantes"
          :key="vacante.id"
          cols="12"
          md="6"
          lg="4"
      >
        <VCard
            rounded="lg"
            elevation="1"
            height="100%"
            class="d-flex flex-column"
        >
          <VCardText class="flex-grow-1 pa-5">
            <div class="d-flex justify-space-between align-center mb-3">
              <VChip
                  color="success"
                  variant="tonal"
                  size="small"
              >
                Disponible
              </VChip>

              <span class="text-caption text-medium-emphasis">
                {{ vacante.cantidad_plazas }}
                {{ Number(vacante.cantidad_plazas) === 1 ? 'plaza' : 'plazas' }}
              </span>
            </div>

            <div class="text-h6 font-weight-bold mb-2">
              {{ vacante.titulo }}
            </div>

            <div class="d-flex align-center ga-2 mb-2">
              <VIcon
                  icon="mdi-briefcase-outline"
                  size="18"
                  color="medium-emphasis"
              />
              <span class="text-body-2">
                {{ vacante.puesto?.nombre || 'Puesto no disponible' }}
              </span>
            </div>

            <div class="d-flex align-center ga-2 mb-3">
              <VIcon
                  icon="mdi-office-building-outline"
                  size="18"
                  color="medium-emphasis"
              />
              <span class="text-body-2">
                {{ vacante.puesto?.unidad?.nombre || 'Unidad no disponible' }}
              </span>
            </div>

            <div class="d-flex ga-2 flex-wrap mb-4">
              <VChip size="small" variant="outlined">
                {{ vacante.modalidad?.replaceAll('_', ' ') }}
              </VChip>

              <VChip size="small" variant="outlined">
                {{ vacante.tipo_contrato?.replaceAll('_', ' ') }}
              </VChip>
            </div>

            <p class="text-body-2 text-medium-emphasis descripcion">
              {{ vacante.descripcion || 'Consulta los detalles de esta oportunidad laboral.' }}
            </p>
          </VCardText>

          <VDivider />

          <VCardActions class="pa-4">
            <VBtn
                color="primary"
                variant="flat"
                block
                :to="`/oportunidades/${vacante.id}`"
            >
              Ver oportunidad
              <VIcon icon="mdi-arrow-right" end />
            </VBtn>
          </VCardActions>
        </VCard>
      </VCol>
    </VRow>

    <VAlert
        v-if="!cargando && !error && !vacantes.length"
        type="info"
        variant="tonal"
    >
      No se encontraron oportunidades laborales disponibles.
    </VAlert>

    <div
        v-if="totalPaginas > 1"
        class="d-flex justify-center mt-6"
    >
      <VPagination
          v-model="pagina"
          :length="totalPaginas"
          :total-visible="5"
      />
    </div>
  </VContainer>
</template>

<style scoped>
.descripcion {
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
  white-space: pre-line;
}
</style>
