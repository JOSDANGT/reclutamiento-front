
<script setup lang="ts">
import Agenda from '@/components/postulaciones/gestion/Agenda.vue'

definePageMeta({
  middleware: 'auth',
})

const route = useRoute()
const { get } = useClienteRequest()

const postulacion = ref<any>(null)
const cargando = ref(false)
const error = ref('')

const postulacionId = computed(() => Number(route.params.id))

const estadoActual = computed(() =>
    String(postulacion.value?.estado?.nombre ?? '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[_-]/g, ' ')
        .trim()
        .toUpperCase(),
)

const puedeGestionar = computed(() =>
    estadoActual.value === 'ENTREVISTA',
)

function obtenerContenido(respuesta: any) {
  return respuesta?.data?.data ?? respuesta?.data ?? respuesta
}

async function cargar() {
  if (!Number.isInteger(postulacionId.value) || postulacionId.value <= 0) {
    error.value = 'El identificador de la postulación no es válido.'
    postulacion.value = null
    return
  }

  cargando.value = true
  error.value = ''
  postulacion.value = null

  try {
    const respuesta = await get(
        `/api/postulaciones/${postulacionId.value}`,
    )

    postulacion.value = obtenerContenido(respuesta)
  }
  catch (e: any) {
    error.value = e.response?.data?.message
        ?? 'No fue posible consultar la postulación.'
  }
  finally {
    cargando.value = false
  }
}

watch(postulacionId, cargar, { immediate: true })
</script>

<template>
  <VContainer fluid class="pa-6">
    <div class="d-flex align-center justify-space-between flex-wrap ga-3 mb-5">
      <div>
        <VBtn
            to="/postulaciones"
            variant="text"
            prepend-icon="mdi-arrow-left"
            class="mb-3"
        >
          Regresar a postulaciones
        </VBtn>

        <h1 class="text-h5 font-weight-bold">
          Gestión de agenda
        </h1>

        <p class="text-body-2 text-medium-emphasis mt-1">
          Programa y administra las actividades del proceso de selección.
        </p>
      </div>

      <VBtn
          v-if="postulacion"
          :to="`/postulaciones/${postulacion.id}`"
          variant="outlined"
          prepend-icon="mdi-file-document-outline"
      >
        Ver expediente
      </VBtn>
    </div>

    <VProgressLinear
        v-if="cargando"
        indeterminate
        color="primary"
        class="mb-4"
    />

    <VAlert
        v-if="error"
        type="error"
        variant="tonal"
        class="mb-4"
    >
      {{ error }}
    </VAlert>

    <template v-if="postulacion && !cargando">
      <VCard rounded="lg" class="mb-4">
        <VCardText>
          <div class="d-flex align-center justify-space-between flex-wrap ga-3">
            <div>
              <div class="text-caption text-medium-emphasis">
                Postulación #{{ postulacion.id }}
              </div>

              <div class="text-h6 font-weight-medium mt-1">
                {{ postulacion.vacante?.titulo ?? 'Sin título' }}
              </div>

              <div class="text-body-2 text-medium-emphasis mt-2">
                Candidato #{{ postulacion.candidato_id }}
              </div>

              <div class="text-body-2 text-medium-emphasis mt-1">
                Puesto:
                {{ postulacion.vacante?.puesto?.nombre ?? '-' }}
              </div>

              <div class="text-body-2 text-medium-emphasis mt-1">
                Unidad:
                {{ postulacion.vacante?.puesto?.unidad?.nombre ?? '-' }}
              </div>
            </div>

            <VChip
                color="primary"
                variant="tonal"
            >
              {{ postulacion.estado?.nombre ?? 'Sin estado' }}
            </VChip>
          </div>
        </VCardText>
      </VCard>

      <VAlert
          v-if="!puedeGestionar"
          type="info"
          variant="tonal"
          class="mb-4"
      >
        Esta postulación no se encuentra en la etapa de entrevista.
        Puedes consultar las actividades registradas, pero no modificarlas.
      </VAlert>

      <Agenda
          :postulacion-id="postulacionId"
          :estado="estadoActual"
      />
    </template>
  </VContainer>
</template>
