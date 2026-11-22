<script setup lang="ts">
const props = defineProps<{
  postulacionId: number
  editable: boolean
}>()
const emit = defineEmits<{
  evaluada: [guardada: boolean, aprobada: boolean]
}>()
const {get, post} = useClienteRequest()

const evaluaciones = ref<any[]>([])
const cargando = ref(false)
const guardando = ref(false)
const error = ref('')
const mensaje = ref('')
const cambiosSinGuardar = ref(false)

const evaluados = computed(() => evaluaciones.value.filter(r => r.cumple !== null).length)
const total = computed(() => evaluaciones.value.length)
const completa = computed(() => total.value > 0 && evaluados.value === total.value)
const cumpleObligatorios = computed(() => evaluaciones.value.filter(r => r.obligatorio).every(r => r.cumple === true))

function extraer(respuesta: any) {
  return respuesta?.data?.data ?? respuesta?.data ?? respuesta
}

function preparar(lista: any[]) {
  evaluaciones.value = lista.map(item => {
    const requisito = item.requisito ?? item
    const valor = item.cumple
    return {
      requisito_id: item.requisito_id ?? requisito.id,
      nombre: requisito.nombre ?? 'Requisito',
      descripcion: requisito.descripcion ?? '',
      obligatorio: [true, 1, '1'].includes(item.obligatorio ?? requisito.pivot?.obligatorio),
      cumple: valor === null || valor === undefined ? null : [true, 1, '1'].includes(valor),
      observacion: item.observacion ?? item.observaciones ?? '',
    }
  })
  cambiosSinGuardar.value = false
  emit(
      'evaluada',
      completa.value,
      completa.value && cumpleObligatorios.value,
  )
}

async function cargar() {
  cargando.value = true
  error.value = ''
  try {
    const respuesta = await get(`/api/postulaciones/requisitos/${props.postulacionId}`)
    const datos = extraer(respuesta)
    const lista = Array.isArray(datos) ? datos : datos?.requisitos ?? []
    preparar(lista)
  } catch (e: any) {
    emit('evaluada', false, false)
    error.value = e.response?.data?.message ?? 'No fue posible consultar los requisitos.'
  } finally {
    cargando.value = false
  }
}

function marcarCambios() {
  if (!props.editable || cargando.value || guardando.value) return

  cambiosSinGuardar.value = true
  mensaje.value = ''
  emit('evaluada', false, false)
}

async function guardar() {
  if (
      !props.editable
      || cargando.value
      || guardando.value
      || !total.value
      || !cambiosSinGuardar.value
  ) return

  guardando.value = true
  error.value = ''
  mensaje.value = ''

  try {
    await post(`/api/postulaciones/requisitos/${props.postulacionId}`, {
      requisitos: evaluaciones.value.map(item => ({
        id: item.requisito_id,
        cumple: item.cumple,
        observacion: item.observacion?.trim() || null,
      })),
    })

    await cargar()

    mensaje.value = 'Evaluación guardada correctamente.'
  } catch (e: any) {
    const errores = e.response?.data?.errors

    error.value = errores
        ? Object.values(errores).flat().join(' ')
        : e.response?.data?.message
        ?? 'No se pudo guardar la evaluación.'
  } finally {
    guardando.value = false
  }
}

watch(() => props.postulacionId, cargar)
onMounted(cargar)
</script>

<template>
  <VCard>
    <VCardTitle class="d-flex justify-space-between align-center">
      Evaluación de requisitos
      <VChip size="small" color="primary" variant="tonal">{{ evaluados }} / {{ total }}</VChip>
    </VCardTitle>
    <VDivider/>
    <VCardText>
      <VAlert v-if="error" type="error" variant="tonal" class="mb-3">{{ error }}</VAlert>
      <VAlert v-if="mensaje" type="success" variant="tonal" class="mb-3">{{ mensaje }}</VAlert>
      <VProgressLinear v-if="cargando" indeterminate color="primary" class="mb-3"/>
      <VAlert v-if="!cargando && !evaluaciones.length" type="info" variant="tonal">No se encontraron requisitos para
        evaluar.
      </VAlert>
      <div v-for="(item, index) in evaluaciones" :key="item.requisito_id" class="mb-4">
        <div class="d-flex align-center ga-2 mb-3">
          <strong>{{ item.nombre }}</strong>
          <VChip v-if="item.obligatorio" color="warning" size="x-small" variant="tonal">Obligatorio</VChip>
        </div>
        <p v-if="item.descripcion" class="text-body-2 text-medium-emphasis mb-3">{{ item.descripcion }}</p>
        <VRow v-if="editable">
          <VCol cols="12" md="4">
            <VSelect
                v-model="item.cumple"
                :items="[
        { title: 'Pendiente', value: null },
        { title: 'Cumple', value: true },
        { title: 'No cumple', value: false },
      ]"
                label="Cumplimiento"
                variant="outlined"
                density="comfortable"
                :disabled="cargando || guardando"
                @update:model-value="marcarCambios"
            />
          </VCol>

          <VCol cols="12" md="8">
            <VTextField
                v-model="item.observacion"
                label="Observaciones"
                variant="outlined"
                density="comfortable"
                :disabled="cargando || guardando"
                @update:model-value="marcarCambios"
            />
          </VCol>
        </VRow>

        <VRow v-else dense>
          <VCol cols="12" md="4">
            <div class="text-caption text-medium-emphasis">Cumplimiento</div>
            <span>
              {{ item.cumple === null ? 'Pendiente' : item.cumple ? 'Cumple' : 'No cumple' }}
            </span>
          </VCol>

          <VCol cols="12" md="8">
            <div class="text-caption text-medium-emphasis">Observaciones</div>
            <span>{{ item.observacion || 'Sin observaciones' }}</span>
          </VCol>
        </VRow>
        <VDivider v-if="index < evaluaciones.length - 1" class="mt-2"/>
      </div>
      <div class="d-flex justify-end">
        <VBtn color="primary" prepend-icon="mdi-content-save-outline" :loading="guardando"
              :disabled="cargando || !evaluaciones.length || !cambiosSinGuardar" @click="guardar">Guardar evaluación
        </VBtn>
      </div>
    </VCardText>
  </VCard>
</template>
