
<script setup lang="ts">
import VacanteBitacora from '../../../../components/vacante/VacanteBitacora.vue'

definePageMeta({
  middleware: 'auth',
})

const route = useRoute()
const { get } = useClienteRequest()

const vacanteId = route.params.id

const vacante = ref<any>(null)
const cargando = ref(true)
const error = ref('')

const coloresEstado: Record<string, string> = {
  BORRADOR: 'secondary',
  PUBLICADA: 'success',
  CERRADA: 'warning',
}

function formatoMoneda(valor: any) {
  if (valor === null || valor === undefined || valor === '') {
    return 'No especificado'
  }

  return new Intl.NumberFormat('es-GT', {
    style: 'currency',
    currency: 'GTQ',
  }).format(Number(valor))
}

function formatoFecha(fecha: string | null) {
  if (!fecha) return 'No especificada'

  return String(fecha).substring(0, 10)
}

function nombreValor(valor: string) {
  if (!valor) return 'No especificado'

  return valor
      .replaceAll('_', ' ')
      .toLowerCase()
      .replace(/(^|\s)\S/g, letra => letra.toUpperCase())
}

async function obtenerVacante() {
  cargando.value = true
  error.value = ''

  try {
    const respuesta = await get(`/api/vacantes/${vacanteId}`)

    vacante.value = respuesta.data
  }
  catch (exception: any) {
    error.value = exception.response?.data?.message
        || 'No fue posible obtener la información de la vacante.'
  }
  finally {
    cargando.value = false
  }
}

onMounted(obtenerVacante)
</script>

<template>
  <VContainer fluid class="pa-6">
    <div class="d-flex align-center justify-space-between flex-wrap ga-3 mb-6">
      <div class="d-flex align-center ga-3">
        <VBtn
            icon="mdi-arrow-left"
            variant="text"
            to="/vacantes"
        />

        <div>
          <h1 class="text-h5 font-weight-bold">
            Detalle de vacante
          </h1>

          <p class="text-body-2 text-medium-emphasis">
            Información e historial de movimientos.
          </p>
        </div>
      </div>

      <VBtn
          v-if="vacante"
          color="primary"
          prepend-icon="mdi-pencil-outline"
          :to="`/vacantes/acciones/edit/${vacanteId}`"
      >
        Editar vacante
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

    <div v-if="cargando" class="text-center py-12">
      <VProgressCircular
          indeterminate
          color="primary"
      />
      <p class="mt-4 text-medium-emphasis">
        Cargando vacante...
      </p>
    </div>

    <template v-else-if="vacante">
      <VCard rounded="lg" elevation="1" class="mb-5">
        <VCardTitle class="pa-5">
          <div class="d-flex align-center justify-space-between flex-wrap ga-3">
            <span class="text-h6">
              {{ vacante.titulo }}
            </span>

            <VChip
                :color="coloresEstado[vacante.estado] || 'secondary'"
                variant="tonal"
            >
              {{ vacante.estado }}
            </VChip>
          </div>
        </VCardTitle>

        <VDivider />


        <VCardText class="pa-5">
          <VRow>
            <!-- Unidad organizacional -->
            <VCol cols="12" sm="6" md="4">
              <div class="campo-detalle">
        <span class="text-caption text-medium-emphasis">
          Unidad organizacional
        </span>

                <div class="text-body-1 font-weight-medium mt-1">
                  {{ vacante.unidad?.nombre || 'Sin asignar' }}
                </div>
              </div>
            </VCol>

            <!-- Cantidad de plazas -->
            <VCol cols="12" sm="6" md="4">
              <div class="campo-detalle">
        <span class="text-caption text-medium-emphasis">
          Cantidad de plazas
        </span>

                <div class="text-body-1 font-weight-medium mt-1">
                  {{ vacante.cantidad_plazas }}
                </div>
              </div>
            </VCol>

            <!-- Modalidad -->
            <VCol cols="12" sm="6" md="4">
              <div class="campo-detalle">
        <span class="text-caption text-medium-emphasis">
          Modalidad
        </span>

                <div class="text-body-1 font-weight-medium mt-1">
                  {{ nombreValor(vacante.modalidad) }}
                </div>
              </div>
            </VCol>

            <!-- Tipo de contrato -->
            <VCol cols="12" sm="6" md="4">
              <div class="campo-detalle">
        <span class="text-caption text-medium-emphasis">
          Tipo de contrato
        </span>

                <div class="text-body-1 font-weight-medium mt-1">
                  {{ nombreValor(vacante.tipo_contrato) }}
                </div>
              </div>
            </VCol>

            <!-- Nivel de experiencia -->
            <VCol cols="12" sm="6" md="4">
              <div class="campo-detalle">
        <span class="text-caption text-medium-emphasis">
          Nivel de experiencia
        </span>

                <div class="text-body-1 font-weight-medium mt-1">
                  {{ nombreValor(vacante.nivel_experiencia) }}
                </div>
              </div>
            </VCol>

            <!-- Identificador -->
            <VCol cols="12" sm="6" md="4">
              <div class="campo-detalle">
        <span class="text-caption text-medium-emphasis">
          Identificador
        </span>

                <div class="text-body-1 font-weight-medium mt-1">
                  #{{ vacante.id }}
                </div>
              </div>
            </VCol>

            <!-- Salario mínimo -->
            <VCol cols="12" sm="6" md="6">
              <div class="campo-detalle">
        <span class="text-caption text-medium-emphasis">
          Salario mínimo
        </span>

                <div class="text-body-1 font-weight-medium mt-1">
                  {{ formatoMoneda(vacante.salario_minimo) }}
                </div>
              </div>
            </VCol>

            <!-- Salario máximo -->
            <VCol cols="12" sm="6" md="6">
              <div class="campo-detalle">
        <span class="text-caption text-medium-emphasis">
          Salario máximo
        </span>

                <div class="text-body-1 font-weight-medium mt-1">
                  {{ formatoMoneda(vacante.salario_maximo) }}
                </div>
              </div>
            </VCol>

            <!-- Fecha de inicio -->
            <VCol cols="12" sm="6" md="6">
              <div class="campo-detalle">
        <span class="text-caption text-medium-emphasis">
          Fecha de inicio
        </span>

                <div class="text-body-1 font-weight-medium mt-1">
                  {{ formatoFecha(vacante.fecha_inicio) }}
                </div>
              </div>
            </VCol>

            <!-- Fecha límite -->
            <VCol cols="12" sm="6" md="6">
              <div class="campo-detalle">
        <span class="text-caption text-medium-emphasis">
          Fecha límite
        </span>

                <div class="text-body-1 font-weight-medium mt-1">
                  {{ formatoFecha(vacante.fecha_limite) }}
                </div>
              </div>
            </VCol>

            <!-- Descripción del puesto -->
            <VCol cols="12">
              <div class="campo-detalle">
                <div class="d-flex align-center ga-2 mb-2">
                  <VIcon
                      icon="mdi-text-box-outline"
                      color="primary"
                      size="20"
                  />

                  <span class="text-subtitle-2 font-weight-medium">
            Descripción del puesto
          </span>
                </div>

                <div class="text-body-2 descripcion">
                  {{ vacante.descripcion || 'Sin descripción.' }}
                </div>
              </div>
            </VCol>
          </VRow>
        </VCardText>

      </VCard>

      <VacanteBitacora
          :bitacoras="vacante.bitacoras || []"
      />
    </template>
  </VContainer>
</template>

<style scoped>

.campo-detalle {
  height: 100%;
  padding: 16px;
  border: 1px solid rgba(var(--v-border-color), 0.18);
  border-radius: 10px;
  background-color: rgba(var(--v-theme-on-surface), 0.025);
  transition: border-color 0.2s ease;
}

.campo-detalle:hover {
  border-color: rgba(var(--v-theme-primary), 0.35);
}

.descripcion {
  white-space: pre-line;
  line-height: 1.7;
}


</style>
