
<script setup lang="ts">
import VacanteFormulario from '../../../../components/vacante/VacanteFormulario.vue'

definePageMeta({
  middleware: 'auth',
})

const route = useRoute()
const { get, put } = useClienteRequest()

const vacanteId = route.params.id

const vacante = ref<any>(null)
const cargando = ref(true)
const guardando = ref(false)
const error = ref('')

async function obtenerVacante() {
  cargando.value = true
  error.value = ''

  try {
    const respuesta = await get(`/api/vacantes/${vacanteId}`)

    vacante.value = respuesta.data
  }
  catch (exception: any) {
    error.value = exception.response?.data?.message
        || 'No fue posible obtener la vacante.'
  }
  finally {
    cargando.value = false
  }
}

async function actualizarVacante(datos: any) {
  if (guardando.value) return

  guardando.value = true
  error.value = ''

  try {
    await put(`/api/vacantes/${vacanteId}`, datos)

    await navigateTo('/vacantes')
  }
  catch (exception: any) {
    const errores = exception.response?.data?.errors

    error.value = errores
        ? Object.values(errores).flat().join(' ')
        : exception.response?.data?.message
        || 'No fue posible actualizar la vacante.'
  }
  finally {
    guardando.value = false
  }
}

onMounted(obtenerVacante)
</script>

<template>
  <VContainer fluid class="pa-6">
    <div class="d-flex align-center ga-3 mb-6">
      <VBtn
          icon="mdi-arrow-left"
          variant="text"
          to="/vacantes"
      />

      <div>
        <h1 class="text-h5 font-weight-bold">
          Editar vacante
        </h1>

        <p class="text-body-2 text-medium-emphasis">
          Actualiza la información de la vacante #{{ vacanteId }}.
        </p>
      </div>
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
        Cargando información de la vacante...
      </p>
    </div>

    <VacanteFormulario
        v-else-if="vacante"
        :vacante="vacante"
        :guardando="guardando"
        @guardar="actualizarVacante"
    />
  </VContainer>
</template>
