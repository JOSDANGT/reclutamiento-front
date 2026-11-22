<script setup lang="ts">
const { get, post, put, deleted } = useClienteRequest()
const emit = defineEmits<{ cambio: [cantidad: number] }>()

const habilidades = ref<any[]>([])
const catalogo = ref<any[]>([])
const niveles = ref<any[]>([])
const habilidadId = ref<number | null>(null)
const nivelId = ref<number | null>(null)
const aniosExperiencia = ref(0)
const cargando = ref(false)
const guardando = ref(false)
const eliminando = ref<number | null>(null)
const error = ref('')
const mensaje = ref('')

function extraerLista(respuesta: any): any[] {
  let valor = respuesta
  for (let i = 0; i < 4 && valor && !Array.isArray(valor); i++) valor = valor.data
  return Array.isArray(valor) ? valor : []
}

const disponibles = computed(() => catalogo.value.filter(h =>
    !habilidades.value.some(actual => Number(actual.id) === Number(h.id)),
))

function nombreNivel(id: number | null) {
  return niveles.value.find(n => Number(n.id) === Number(id))?.nombre ?? 'Sin nivel'
}

async function cargar() {
  cargando.value = true
  error.value = ''
  try {
    const [misHabilidades, todas, nivelesRespuesta] = await Promise.all([
      get('/api/candidatos/mi-perfil/habilidades'),
      get('/api/habilidades'),
      get('/api/niveles-habilidad'),
    ])
    habilidades.value = extraerLista(misHabilidades)
    catalogo.value = extraerLista(todas)
    niveles.value = extraerLista(nivelesRespuesta)
    emit('cambio', habilidades.value.length)
  } catch (e: any) {
    error.value = e.response?.data?.message ?? 'No se pudieron consultar las habilidades y sus catálogos.'
  } finally {
    cargando.value = false
  }
}

async function agregar() {
  if (!habilidadId.value || !nivelId.value || guardando.value) return
  if (!Number.isInteger(Number(aniosExperiencia.value)) || Number(aniosExperiencia.value) < 0) {
    error.value = 'Los años de experiencia deben ser un entero positivo o cero.'
    return
  }
  guardando.value = true
  error.value = ''
  mensaje.value = ''
  try {
    await post('/api/candidatos/mi-perfil/habilidades', {
      habilidad_id: habilidadId.value,
      nivel_habilidad_id: nivelId.value,
      anios_experiencia: Number(aniosExperiencia.value),
    })
    habilidadId.value = null
    nivelId.value = null
    aniosExperiencia.value = 0
    await cargar()
    mensaje.value = 'Habilidad agregada correctamente.'
  } catch (e: any) {
    const errores = e.response?.data?.errors
    error.value = errores ? Object.values(errores).flat().join(' ') : e.response?.data?.message ?? 'No se pudo agregar la habilidad.'
  } finally {
    guardando.value = false
  }
}

async function eliminar(id: number) {
  if (eliminando.value !== null) return
  eliminando.value = id
  error.value = ''
  mensaje.value = ''
  try {
    await deleted(`/api/candidatos/mi-perfil/habilidades/${id}`)
    await cargar()
    mensaje.value = 'Habilidad eliminada correctamente.'
  } catch (e: any) {
    error.value = e.response?.data?.message ?? 'No se pudo eliminar la habilidad.'
  } finally {
    eliminando.value = null
  }
}

onMounted(cargar)
</script>

<template>
  <div>
    <VAlert v-if="error" type="error" variant="tonal" closable class="mb-4" @click:close="error = ''">{{
        error
      }}
    </VAlert>
    <VAlert v-if="mensaje" type="success" variant="tonal" closable class="mb-4" @click:close="mensaje = ''">{{
        mensaje
      }}
    </VAlert>
    <VProgressLinear v-if="cargando" indeterminate color="primary" class="mb-4"/>

    <VRow v-if="!cargando" align="start">
      <VCol cols="12" md="5">
        <VAutocomplete v-model="habilidadId" :items="disponibles" item-title="nombre" item-value="id"
                       label="Selecciona una habilidad" placeholder="Buscar habilidad..." clearable variant="outlined"
                       density="comfortable" no-data-text="Sin habilidades disponibles"/>
      </VCol>
      <VCol cols="12" md="4">
        <VSelect v-model="nivelId" :items="niveles" item-title="nombre" item-value="id" label="Nivel de habilidad"
                 clearable variant="outlined" density="comfortable"/>
      </VCol>
      <VCol cols="12" md="3">
        <VTextField v-model.number="aniosExperiencia" type="number" min="0" step="1" label="Años de experiencia"
                    variant="outlined" density="comfortable"/>
      </VCol>
      <VCol cols="12" class="d-flex justify-end">
        <VBtn color="primary" prepend-icon="mdi-plus" :loading="guardando" :disabled="!habilidadId || !nivelId"
              @click="agregar">Agregar habilidad
        </VBtn>
      </VCol>
    </VRow>

    <VDivider class="my-4"/>
    <div class="d-flex align-center justify-space-between mb-3">
      <div class="text-subtitle-1 font-weight-medium">Mis habilidades</div>
      <VChip size="small" color="primary" variant="tonal">{{ habilidades.length }} registradas</VChip>
    </div>
    <VAlert v-if="!cargando && !habilidades.length" type="info" variant="tonal">Agrega tus conocimientos y habilidades
      para destacar en las oportunidades laborales.
    </VAlert>
    <VList v-else lines="two" class="pa-0">
      <VListItem v-for="habilidad in habilidades" :key="habilidad.id" :title="habilidad.nombre"
                 :subtitle="`${nombreNivel(habilidad.pivot?.nivel_habilidad_id ?? habilidad.nivel_habilidad_id)} · ${habilidad.pivot?.anios_experiencia ?? habilidad.anios_experiencia ?? 0} años de experiencia`">
        <template #prepend>
          <VAvatar color="primary" variant="tonal" class="mr-3">
            <VIcon icon="mdi-check-decagram-outline"/>
          </VAvatar>
        </template>
        <template #append>
          <VBtn icon="mdi-delete-outline" variant="text" color="error" size="small"
                :loading="eliminando === habilidad.id" @click="eliminar(habilidad.id)"/>
        </template>
      </VListItem>
    </VList>
  </div>
</template>
