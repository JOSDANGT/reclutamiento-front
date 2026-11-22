<script setup lang="ts">
import PostulacionTracking from '@/components/postulaciones/PostulacionTracking.vue'
import CandidatoInformacion from '../../components/postulaciones/expediente/CandidatoInformacion.vue'
import CandidatoHabilidadesConsulta from '../../components/postulaciones/expediente/CandidatoHabilidadesConsulta.vue'
import CandidatoExperienciasConsulta from '../../components/postulaciones/expediente/CandidatoExperienciasConsulta.vue'
import CandidatoFormacionesConsulta from '../../components/postulaciones/expediente/CandidatoFormacionesConsulta.vue'
import CandidatoDocumentosConsulta from '../../components/postulaciones/expediente/CandidatoDocumentosConsulta.vue'
import PostulacionEvaluacion from '../../components/postulaciones/expediente/PostulacionEvaluacion.vue'
import PostulacionDecision from '../../components/postulaciones/expediente/PostulacionDecision.vue'
import {ETAPAS_POSTULACION, ESTADOS_FINALES_POSTULACION} from '../../utils/postulaciones/etapas'

definePageMeta({middleware: 'auth'})

const route = useRoute()
const {get} = useClienteRequest()
const postulacion = ref<any>(null)
const estados = ref<any[]>([])
const evaluacionAprobada = ref(false)
const cargando = ref(false)
const error = ref('')
const mensaje = ref('')
const candidato = computed(() => postulacion.value?.candidato)

const evaluacionGuardada = ref(false)

function extraer(respuesta: any) {
  return respuesta?.data?.data ?? respuesta?.data ?? respuesta
}

function evaluacionActualizada(
    guardada: boolean,
    aprobada: boolean,
) {
  evaluacionGuardada.value = guardada
  evaluacionAprobada.value = aprobada
}

async function cargar() {
  cargando.value = true
  error.value = ''
  try {
    const [detalleRespuesta, estadosRespuesta] = await Promise.all([
      get(`/api/postulaciones/${route.params.id}`),
      get('/api/postulaciones/estados'),
    ])
    postulacion.value = extraer(detalleRespuesta)
    const listaEstados = extraer(estadosRespuesta)
    estados.value = Array.isArray(listaEstados) ? listaEstados : []
  } catch (e: any) {
    error.value = e.response?.data?.message ?? 'No se pudo cargar el expediente.'
  } finally {
    cargando.value = false
  }
}

async function estadoActualizado() {
  await cargar()
  if (!error.value) mensaje.value = 'Estado actualizado correctamente.'
}

onMounted(cargar)
</script>

<template>
  <VContainer fluid class="pa-6">
    <VBtn to="/postulaciones" prepend-icon="mdi-arrow-left" variant="text" class="mb-4">Regresar</VBtn>
    <VProgressLinear v-if="cargando" indeterminate color="primary" class="mb-4"/>
    <VAlert v-if="error" type="error" variant="tonal" class="mb-4">{{ error }}</VAlert>
    <VAlert v-if="mensaje" type="success" variant="tonal" class="mb-4">{{ mensaje }}</VAlert>
    <template v-if="postulacion && !cargando">
      <div class="d-flex align-center justify-space-between flex-wrap ga-3 mb-5">
        <div>
          <h1 class="text-h5 font-weight-bold">Evaluación de postulación #{{ postulacion.id }}</h1>
          <div class="text-medium-emphasis mt-1">{{ postulacion.vacante?.titulo }}</div>
        </div>
        <VChip color="primary" variant="tonal">{{ postulacion.estado?.nombre }}</VChip>
      </div>
      <VRow>
        <VCol cols="12" md="8">
          <div class="d-flex flex-column ga-4">
            <CandidatoInformacion
                :candidato="candidato"
            />
            <CandidatoHabilidadesConsulta
                :habilidades="candidato?.habilidades ?? []"
            />
            <CandidatoExperienciasConsulta
                :experiencias="candidato?.experiencias_laborales ?? []"
            />
            <CandidatoFormacionesConsulta
                :formaciones="candidato?.formaciones_academicas ?? []"
            />
            <CandidatoDocumentosConsulta
                :documentos="candidato?.documentos ?? []"
            />
            <PostulacionEvaluacion
                :postulacion-id="Number(postulacion.id)"
                @evaluada="evaluacionActualizada"
            />

            <PostulacionDecision
                :postulacion="postulacion"
                :estados="estados"
                :evaluacion-guardada="evaluacionGuardada"
                :evaluacion-aprobada="evaluacionAprobada"
                @actualizado="estadoActualizado"
            />
          </div>
        </VCol>
        <VCol cols="12" md="4">
          <PostulacionTracking :estado="postulacion.estado?.nombre ?? null"
                               :fecha-postulacion="postulacion.fecha_postulacion"
                               :etapas="ETAPAS_POSTULACION" :estados-finales="ESTADOS_FINALES_POSTULACION"/>
          <VCard class="mt-4">
            <VCardTitle>Vacante</VCardTitle>
            <VDivider/>
            <VCardText>
              <p><strong>Puesto:</strong> {{ postulacion.vacante?.puesto?.nombre ?? '-' }}</p>
              <p class="mt-2"><strong>Unidad:</strong> {{ postulacion.vacante?.puesto?.unidad?.nombre ?? '-' }}</p>
            </VCardText>
          </VCard>
        </VCol>
      </VRow>
    </template>
  </VContainer>
</template>
