<script setup lang="ts">
import PerfilProfesional from '../../components/candidatos/PerfilProfesional.vue'
import PerfilContacto from '../../components/candidatos/PerfilContacto.vue'
import PerfilEnlaces from '../../components/candidatos/PerfilEnlaces.vue'
import CandidatoHabilidades from '../../components/candidatos/CandidatoHabilidades.vue'
import CandidatoDocumentos from '../../components/candidatos/CandidatoDocumentos.vue'

definePageMeta({middleware: 'auth'})

const router = useRouter()
const {get, post, put} = useClienteRequest()

const formulario = ref<any>(null)
const cargando = ref(true)
const guardando = ref(false)
const existePerfil = ref(false)
const error = ref('')
const mensaje = ref('')
const panelesGenerales = ref<string[]>(['profesional'])
const panelesComplementarios = ref<string[]>([])
const cantidadHabilidades = ref(0)

const datos = reactive({
  titulo_profesional: '',
  resumen_profesional: '',
  anios_experiencia: 0,
  nivel_academico: '',
  telefono_contacto: '',
  pais: 'Guatemala',
  departamento: '',
  municipio: '',
  disponibilidad: '',
  pretension_salarial: null as number | null,
  linkedin_url: '',
  github_url: '',
  portafolio_url: '',
})

const secciones = computed(() => [
  {
    id: 'profesional',
    completo: !!datos.titulo_profesional.trim() && !!datos.resumen_profesional.trim()
        && !!datos.nivel_academico,
  },
  {
    id: 'contacto',
    completo: !!datos.telefono_contacto.trim() && !!datos.pais.trim()
        && !!datos.departamento.trim() && !!datos.municipio.trim()
        && !!datos.disponibilidad,
  },
  {
    id: 'enlaces',
    // Estos enlaces no son obligatorios; esta sección es opcional.
    completo: !!(datos.linkedin_url.trim() || datos.github_url.trim() || datos.portafolio_url.trim()),
  },
])

const completadas = computed(() => secciones.value.filter(s => s.completo).length)
const progreso = computed(() => Math.round(completadas.value / secciones.value.length * 100))

function estaCompleta(seccion: string) {
  return secciones.value.some(s => s.id === seccion && s.completo)
}

function extraerPerfil(respuesta: any) {
  let valor = respuesta
  for (let i = 0; i < 4 && valor && !valor.id; i++) valor = valor.data
  return valor?.id ? valor : null
}

function cargarDatos(perfil: any) {
  for (const clave of Object.keys(datos) as (keyof typeof datos)[]) {
    const valor = perfil[clave]
    if (valor !== undefined && valor !== null) (datos as any)[clave] = valor
  }
  datos.anios_experiencia = Number(datos.anios_experiencia ?? 0)
  datos.pretension_salarial = datos.pretension_salarial == null
      ? null
      : Number(datos.pretension_salarial)
}

async function obtenerPerfil() {
  cargando.value = true
  error.value = ''
  try {
    const respuesta = await get('/api/candidatos/mi-perfil')
    const perfil = extraerPerfil(respuesta)
    existePerfil.value = !!perfil
    if (perfil) {
      cargarDatos(perfil)
      panelesGenerales.value = []
      panelesComplementarios.value = ['habilidades']
    }
  } catch (e: any) {
    if (e.response?.status === 404) existePerfil.value = false
    else error.value = e.response?.data?.message ?? 'No fue posible consultar el perfil.'
  } finally {
    cargando.value = false
  }
}

async function guardarPerfil() {
  if (guardando.value) return
  const validacion = await formulario.value?.validate()
  if (!validacion?.valid) return
  guardando.value = true
  error.value = ''
  mensaje.value = ''
  try {
    const payload = {
      titulo_profesional: datos.titulo_profesional.trim() || null,
      resumen_profesional: datos.resumen_profesional.trim() || null,
      anios_experiencia: Number(datos.anios_experiencia),
      nivel_academico: datos.nivel_academico || null,
      telefono_contacto: datos.telefono_contacto.trim() || null,
      pais: datos.pais.trim() || null,
      departamento: datos.departamento.trim() || null,
      municipio: datos.municipio.trim() || null,
      disponibilidad: datos.disponibilidad || null,
      pretension_salarial: datos.pretension_salarial == null || String(datos.pretension_salarial) === ''
          ? null : Number(datos.pretension_salarial),
      linkedin_url: datos.linkedin_url.trim() || null,
      github_url: datos.github_url.trim() || null,
      portafolio_url: datos.portafolio_url.trim() || null,
    }
    if (existePerfil.value) await put('/api/candidatos/mi-perfil', payload)
    else await post('/api/candidatos/perfil', payload)
    existePerfil.value = true
    mensaje.value = 'Perfil guardado correctamente. Ahora puedes completar habilidades y documentos.'
    panelesGenerales.value = []
    panelesComplementarios.value = ['habilidades']
  } catch (e: any) {
    const errores = e.response?.data?.errors
    error.value = errores ? Object.values(errores).flat().join(' ')
        : e.response?.data?.message ?? 'No fue posible guardar el perfil.'
  } finally {
    guardando.value = false
  }
}

onMounted(obtenerPerfil)
</script>

<template>
  <VContainer fluid class="pa-4 pa-md-6" style="max-width: 1200px">
    <div class="d-flex flex-wrap align-center justify-space-between ga-3 mb-6">
      <div>
        <div class="text-overline text-primary">TALENTHUB</div>
        <h1 class="text-h4 font-weight-bold">Mi perfil profesional</h1>
        <p class="text-body-2 text-medium-emphasis mt-1">Tu experiencia, habilidades y documentos en un solo lugar.</p>
      </div>
      <VBtn to="/oportunidades" prepend-icon="mdi-briefcase-search-outline" variant="outlined">Ver oportunidades</VBtn>
    </div>

    <VCard class="mb-5" rounded="xl" variant="tonal" color="primary">
      <VCardText class="pa-5">
        <div class="d-flex align-center justify-space-between ga-3 mb-2">
          <div>
            <div class="text-subtitle-1 font-weight-bold">Avance de datos generales</div>
            <div class="text-caption">{{ completadas }} de 3 secciones con información · Enlaces opcionales</div>
          </div>
          <div class="text-h5 font-weight-bold">{{ progreso }}%</div>
        </div>
        <VProgressLinear :model-value="progreso" rounded height="9" color="primary"/>
        <div class="d-flex flex-wrap ga-2 mt-4">
          <VChip size="small" :color="existePerfil ? 'success' : 'warning'" variant="flat"
                 :prepend-icon="existePerfil ? 'mdi-check-circle-outline' : 'mdi-account-clock-outline'">
            {{ existePerfil ? 'Perfil registrado' : 'Pendiente de registro' }}
          </VChip>
          <VChip v-if="existePerfil" size="small" variant="outlined" prepend-icon="mdi-check-decagram-outline">
            {{ cantidadHabilidades }} habilidades
          </VChip>
        </div>
      </VCardText>
    </VCard>

    <VProgressLinear v-if="cargando" indeterminate class="mb-4" color="primary"/>
    <VAlert v-if="error" type="error" variant="tonal" closable class="mb-4" @click:close="error = ''">{{
        error
      }}
    </VAlert>
    <VAlert v-if="mensaje" type="success" variant="tonal" closable class="mb-4" @click:close="mensaje = ''">{{
        mensaje
      }}
    </VAlert>

    <VForm v-if="!cargando" ref="formulario" @submit.prevent="guardarPerfil">
      <VExpansionPanels v-model="panelesGenerales" multiple variant="accordion" class="mb-5">
        <VExpansionPanel value="profesional" rounded="lg" elevation="1">
          <VExpansionPanelTitle>
            <VIcon icon="mdi-account-tie-outline" color="primary" class="mr-3"/>
            <div class="flex-grow-1">
              <div class="font-weight-medium">Información profesional</div>
              <div class="text-caption text-medium-emphasis">Título, trayectoria y preparación académica</div>
            </div>
            <VChip v-if="estaCompleta('profesional')" color="success" variant="tonal" size="small" class="mr-3">Con
              datos
            </VChip>
          </VExpansionPanelTitle>
          <VExpansionPanelText>
            <PerfilProfesional v-model="datos" class="pt-4"/>
          </VExpansionPanelText>
        </VExpansionPanel>

        <VExpansionPanel value="contacto" rounded="lg" elevation="1">
          <VExpansionPanelTitle>
            <VIcon icon="mdi-map-marker-outline" color="primary" class="mr-3"/>
            <div class="flex-grow-1">
              <div class="font-weight-medium">Contacto y disponibilidad</div>
              <div class="text-caption text-medium-emphasis">Cómo contactarte y cuándo puedes iniciar</div>
            </div>
            <VChip v-if="estaCompleta('contacto')" color="success" variant="tonal" size="small" class="mr-3">Con datos
            </VChip>
          </VExpansionPanelTitle>
          <VExpansionPanelText>
            <PerfilContacto v-model="datos" class="pt-4"/>
          </VExpansionPanelText>
        </VExpansionPanel>

        <VExpansionPanel value="enlaces" rounded="lg" elevation="1">
          <VExpansionPanelTitle>
            <VIcon icon="mdi-link-variant" color="primary" class="mr-3"/>
            <div class="flex-grow-1">
              <div class="font-weight-medium">Enlaces profesionales</div>
              <div class="text-caption text-medium-emphasis">LinkedIn, GitHub y portafolio (opcional)</div>
            </div>
            <VChip v-if="estaCompleta('enlaces')" color="success" variant="tonal" size="small" class="mr-3">Con datos
            </VChip>
          </VExpansionPanelTitle>
          <VExpansionPanelText>
            <PerfilEnlaces v-model="datos" class="pt-4"/>
          </VExpansionPanelText>
        </VExpansionPanel>
      </VExpansionPanels>

      <div class="d-flex justify-end ga-3 mb-6">
        <VBtn variant="outlined" :disabled="guardando" @click="router.push('/oportunidades')">Regresar</VBtn>
        <VBtn type="submit" color="primary" prepend-icon="mdi-content-save-outline" :loading="guardando">
          {{ existePerfil ? 'Guardar cambios' : 'Guardar perfil' }}
        </VBtn>
      </div>
    </VForm>

    <VExpansionPanels v-if="!cargando" v-model="panelesComplementarios" multiple variant="accordion">
      <VExpansionPanel value="habilidades" rounded="lg" elevation="1">
        <VExpansionPanelTitle>
          <VIcon icon="mdi-check-decagram-outline" color="primary" class="mr-3"/>
          <div class="flex-grow-1">
            <div class="font-weight-medium">Mis habilidades</div>
            <div class="text-caption text-medium-emphasis">Conocimientos, nivel y experiencia</div>
          </div>
          <VChip size="small" color="primary" variant="tonal" class="mr-3">{{ cantidadHabilidades }} registradas</VChip>
        </VExpansionPanelTitle>
        <VExpansionPanelText>
          <CandidatoHabilidades v-if="existePerfil" class="pt-4" @cambio="cantidadHabilidades = $event"/>
          <VAlert v-else type="info" variant="tonal" class="mt-4">Primero guarda tus datos generales para agregar
            habilidades.
          </VAlert>
        </VExpansionPanelText>
      </VExpansionPanel>

      <VExpansionPanel value="documentos" rounded="lg" elevation="1">
        <VExpansionPanelTitle>
          <VIcon icon="mdi-file-document-multiple-outline" color="primary" class="mr-3"/>
          <div class="flex-grow-1">
            <div class="font-weight-medium">Mis documentos</div>
            <div class="text-caption text-medium-emphasis">Currículum, certificados y constancias</div>
          </div>
        </VExpansionPanelTitle>
        <VExpansionPanelText>

          <CandidatoDocumentos v-if="existePerfil" class="pt-4"/>

          <VAlert v-else type="info" variant="tonal" class="mt-4">Guarda primero tu perfil para habilitar la carga de
            documentos.
          </VAlert>
        </VExpansionPanelText>
      </VExpansionPanel>
    </VExpansionPanels>
  </VContainer>
</template>
