<script setup lang="ts">
const props = defineProps<{
  postulacionId: number
}>()

const emit = defineEmits<{
  actualizada: []
}>()

const { put } = useClienteRequest()

const dialogo = ref(false)
const guardando = ref(false)
const registrada = ref(false)
const error = ref('')

const decision = ref<'ACEPTADA' | 'RECHAZADA' | null>(null)
const fechaIngreso = ref('')
const observaciones = ref('')

const formularioValido = computed(() =>
    decision.value === 'RECHAZADA'
    || (decision.value === 'ACEPTADA' && !!fechaIngreso.value),
)

function abrir() {
  decision.value = null
  fechaIngreso.value = ''
  observaciones.value = ''
  error.value = ''
  dialogo.value = true
}

async function guardar() {
  if (!formularioValido.value || guardando.value || registrada.value) return

  guardando.value = true
  error.value = ''

  try {
    await put(`/api/postulaciones/${props.postulacionId}/oferta`, {
      decision: decision.value,
      fecha_ingreso: decision.value === 'ACEPTADA' ? fechaIngreso.value : null,
      observaciones: observaciones.value.trim() || null,
    })

    registrada.value = true
    dialogo.value = false
    emit('actualizada')
  }
  catch (e: any) {
    const datos = e.response?.data ?? e.data

    error.value = datos?.errors
        ? Object.values(datos.errors).flat().join(' ')
        : datos?.message ?? 'No fue posible registrar la decisión de oferta.'
  }
  finally {
    guardando.value = false
  }
}
</script>

<template>
  <VCard rounded="lg" variant="outlined">
    <VCardText class="d-flex align-center justify-space-between flex-wrap ga-3">
      <span>
        {{ registrada ? 'Decisión de oferta registrada.' : 'El candidato fue seleccionado.' }}
      </span>

      <VBtn
          v-if="!registrada"
          color="primary"
          @click="abrir"
      >
        Registrar decisión de oferta
      </VBtn>
    </VCardText>
  </VCard>

  <VDialog v-model="dialogo" max-width="520" persistent>
    <VCard rounded="lg">
      <VCardTitle class="pa-4">Decisión de oferta</VCardTitle>
      <VDivider />

      <VCardText class="d-flex flex-column ga-3">
        <VAlert v-if="error" type="error" variant="tonal">
          {{ error }}
        </VAlert>

        <VRadioGroup
            v-model="decision"
            label="¿Qué decidió el candidato?"
            hide-details
        >
          <VRadio
              label="Aceptó y se confirmó la contratación"
              value="ACEPTADA"
          />
          <VRadio
              label="Rechazó la oferta"
              value="RECHAZADA"
          />
        </VRadioGroup>

        <VTextField
            v-if="decision === 'ACEPTADA'"
            v-model="fechaIngreso"
            type="date"
            label="Fecha de ingreso *"
            variant="outlined"
            hide-details="auto"
        />

        <VTextarea
            v-model="observaciones"
            label="Observaciones (opcional)"
            variant="outlined"
            rows="2"
            maxlength="5000"
            auto-grow
            hide-details="auto"
        />
      </VCardText>

      <VCardActions class="pa-4">
        <VSpacer />

        <VBtn :disabled="guardando" @click="dialogo = false">
          Volver
        </VBtn>

        <VBtn
            color="primary"
            variant="flat"
            :disabled="!formularioValido || guardando"
            :loading="guardando"
            @click="guardar"
        >
          Confirmar decisión
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>