
<script setup lang="ts">
import VacanteFormulario from '../../components/vacante/VacanteFormulario.vue'

definePageMeta({
  middleware: 'auth',
})

const { post } = useClienteRequest()

const guardando = ref(false)
const error = ref('')

async function guardarVacante(datos: any) {
  if (guardando.value) return

  guardando.value = true
  error.value = ''

  try {
    await post('/api/vacantes', datos)

    await navigateTo('/vacantes')
  }
  catch (exception: any) {
    const errores = exception.response?.data?.errors

    error.value = errores
        ? Object.values(errores).flat().join(' ')
        : exception.response?.data?.message
        || 'No fue posible registrar la vacante.'
  }
  finally {
    guardando.value = false
  }
}
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
          Nueva vacante
        </h1>

        <p class="text-body-2 text-medium-emphasis">
          Registra una nueva oportunidad laboral.
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

    <VacanteFormulario
        :guardando="guardando"
        @guardar="guardarVacante"
    />
  </VContainer>
</template>
