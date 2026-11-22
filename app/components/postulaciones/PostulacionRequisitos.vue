
<script setup lang="ts">
const props = defineProps<{
  postulacionId: number
}>()

const { get, post } = useClienteRequest()

const requisitos = ref<any[]>([])
const cargando = ref(false)
const guardando = ref(false)
const error = ref('')
const mensaje = ref('')

const resumen = ref<any>(null)

const opciones = [
  { title: 'Pendiente', value: null },
  { title: 'Cumple', value: true },
  { title: 'No cumple', value: false },
]

async function cargarRequisitos() {
  cargando.value = true
  error.value = ''

  try {
    const respuesta = await get(
        `/api/postulaciones/requisitos/${props.postulacionId}`,
    )

    requisitos.value = respuesta.data.requisitos
    resumen.value = respuesta.data.resumen
  }
  catch (exception: any) {
    error.value = exception.response?.data?.message
        || 'No fue posible obtener los requisitos.'
  }
  finally {
    cargando.value = false
  }
}

async function guardarEvaluacion() {
  if (guardando.value || !requisitos.value.length) return

  guardando.value = true
  error.value = ''
  mensaje.value = ''

  try {
    await post(`/api/postulaciones/requisitos/${props.postulacionId}`, {
      requisitos: requisitos.value.map(item => ({
        id: item.id,
        cumple: item.cumple,
        observacion: item.observacion?.trim() || null,
      })),
    })

    await cargarRequisitos()

    mensaje.value = 'Evaluación guardada correctamente.'
  }
  catch (exception: any) {
    const errores = exception.response?.data?.errors

    error.value = errores
        ? Object.values(errores).flat().join(' ')
        : exception.response?.data?.message
        || 'No fue posible guardar la evaluación.'
  }
  finally {
    guardando.value = false
  }
}

watch(
    () => props.postulacionId,
    cargarRequisitos,
    { immediate: true },
)
</script>

<template>
  <VCard rounded="lg" elevation="1">
    <VCardTitle class="d-flex align-center ga-2 pa-4">
      <VIcon icon="mdi-clipboard-check-outline" color="primary" />
      Evaluación de requisitos
    </VCardTitle>

    <VDivider />

    <VCardText class="pa-4">
      <VAlert
          v-if="error"
          type="error"
          variant="tonal"
          class="mb-4"
      >
        {{ error }}
      </VAlert>

      <VAlert
          v-if="mensaje"
          type="success"
          variant="tonal"
          class="mb-4"
      >
        {{ mensaje }}
      </VAlert>

      <VProgressLinear
          v-if="cargando"
          indeterminate
          color="primary"
          class="mb-4"
      />

      <template v-else>
        <VAlert
            v-if="!requisitos.length"
            type="info"
            variant="tonal"
        >
          Esta vacante no tiene requisitos asignados.
        </VAlert>

        <div
            v-for="requisito in requisitos"
            :key="requisito.id"
            class="requisito-item mb-3"
        >
          <div class="d-flex align-center justify-space-between ga-2 mb-2">
            <span class="font-weight-medium">
              {{ requisito.nombre }}
            </span>

            <VChip
                size="x-small"
                :color="requisito.obligatorio ? 'warning' : 'secondary'"
                variant="tonal"
            >
              {{ requisito.obligatorio ? 'Obligatorio' : 'Opcional' }}
            </VChip>
          </div>

          <p
              v-if="requisito.descripcion"
              class="text-body-2 text-medium-emphasis mb-3"
          >
            {{ requisito.descripcion }}
          </p>

          <VSelect
              v-model="requisito.cumple"
              label="Evaluación"
              :items="opciones"
              variant="outlined"
              density="compact"
          />

          <VTextarea
              v-model="requisito.observacion"
              label="Observación"
              variant="outlined"
              density="compact"
              rows="2"
              auto-grow
              maxlength="500"
              hide-details
          />
        </div>

        <div
            v-if="resumen"
            class="d-flex align-center justify-space-between my-4"
        >
          <span class="text-body-2 font-weight-medium">
            Resultado de requisitos obligatorios
          </span>

          <VChip
              :color="resumen.resultado === 'CUMPLE'
              ? 'success'
              : resumen.resultado === 'NO_CUMPLE'
                ? 'error'
                : 'warning'"
              variant="tonal"
          >
            {{ resumen.resultado.replaceAll('_', ' ') }}
          </VChip>
        </div>

        <div class="d-flex justify-end">
          <VBtn
              v-if="requisitos.length"
              color="primary"
              prepend-icon="mdi-content-save-outline"
              :loading="guardando"
              @click="guardarEvaluacion"
          >
            Guardar evalua
          </VBtn>
        </div>
      </template>
    </VCardText>
  </VCard>
</template>

<style scoped>
.requisito-item {
  padding: 14px;
  border: 1px solid rgba(var(--v-border-color), 0.3);
  border-radius: 10px;
}
</style>
