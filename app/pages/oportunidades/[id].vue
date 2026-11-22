
<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
})

const route = useRoute()
const router = useRouter()
const { get, post } = useClienteRequest()

const vacante = ref<any>(null)

const cargando = ref(false)
const postulando = ref(false)

const error = ref('')
const errorPostulacion = ref('')
const postulacionExitosa = ref(false)

const dialogoPostular = ref(false)
const cartaPresentacion = ref('')

const disponible = computed(() =>
    vacante.value?.estado === 'PUBLICADA',
)

const requisitos = computed(() =>
    [...(vacante.value?.requisitos ?? [])].sort(
        (a: any, b: any) =>
            Number(a.pivot?.orden ?? 0) - Number(b.pivot?.orden ?? 0),
    ),
)

const requisitosObligatorios = computed(() =>
    requisitos.value.filter(
        (requisito: any) => [true, 1, '1'].includes(
            requisito.pivot?.obligatorio,
        ),
    ),
)

function formatearFecha(fecha: string | null) {
  if (!fecha) return 'No especificada'

  const valor = String(fecha).substring(0, 10)
  const [anio, mes, dia] = valor.split('-')

  if (!anio || !mes || !dia) return valor

  return `${dia}/${mes}/${anio}`
}

function formatearMoneda(valor: any) {
  if (valor === null || valor === undefined || valor === '') {
    return 'No especificado'
  }

  return new Intl.NumberFormat('es-GT', {
    style: 'currency',
    currency: 'GTQ',
  }).format(Number(valor))
}

async function obtenerVacante() {
  cargando.value = true
  error.value = ''

  try {
    const respuesta = await get(
        `/api/oportunidades/${route.params.id}`,
    )

    vacante.value = respuesta.data?.data ?? respuesta.data
  }
  catch (exception: any) {
    error.value = exception.response?.data?.message
        || 'No fue posible consultar la oportunidad laboral.'
  }
  finally {
    cargando.value = false
  }
}

function abrirPostulacion() {
  if (!disponible.value || postulacionExitosa.value) return

  errorPostulacion.value = ''
  dialogoPostular.value = true
}

async function registrarPostulacion() {
  if (postulando.value || !disponible.value) return

  postulando.value = true
  errorPostulacion.value = ''

  try {
    await post('/api/postulaciones', {
      vacante_id: vacante.value.id,
      carta_presentacion: cartaPresentacion.value.trim() || null,
    })

    postulacionExitosa.value = true
    dialogoPostular.value = false
  }
  catch (exception: any) {
    const errores = exception.response?.data?.errors

    errorPostulacion.value = errores
        ? Object.values(errores).flat().join(' ')
        : exception.response?.data?.message
        || 'No fue posible registrar la postulación.'
  }
  finally {
    postulando.value = false
  }
}

onMounted(obtenerVacante)
</script>

<template>
  <VContainer fluid class="pa-6">
    <VBtn
        variant="text"
        prepend-icon="mdi-arrow-left"
        class="mb-5"
        @click="router.push('/oportunidades')"
    >
      Regresar a oportunidades
    </VBtn>

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
    >
      {{ error }}
    </VAlert>

    <template v-if="vacante && !cargando">
      <VAlert
          v-if="postulacionExitosa"
          type="success"
          variant="tonal"
          class="mb-5"
      >
        Tu postulación fue registrada correctamente.
        Recursos Humanos podrá revisar tu perfil y los requisitos
        de esta vacante.
      </VAlert>

      <VAlert
          v-else-if="!disponible"
          type="warning"
          variant="tonal"
          class="mb-5"
      >
        Esta vacante ya no se encuentra disponible para recibir postulaciones.
      </VAlert>

      <VRow>
        <VCol cols="12" md="8">
          <VCard rounded="lg" elevation="1" class="mb-5">
            <VCardText class="pa-5">
              <div class="d-flex align-center ga-3 mb-4">
                <VChip
                    :color="disponible ? 'success' : 'warning'"
                    variant="tonal"
                >
                  {{ disponible ? 'Vacante publicada' : 'Vacante no disponible' }}
                </VChip>
              </div>

              <h1 class="text-h5 font-weight-bold mb-3">
                {{ vacante.titulo }}
              </h1>

              <div class="d-flex flex-wrap ga-3 text-body-2 text-medium-emphasis">
                <span>
                  <VIcon icon="mdi-briefcase-outline" size="18" class="mr-1" />
                  {{ vacante.puesto?.nombre }}
                </span>

                <span>
                  <VIcon icon="mdi-office-building-outline" size="18" class="mr-1" />
                  {{ vacante.puesto?.unidad?.nombre }}
                </span>
              </div>
            </VCardText>
          </VCard>

          <VCard rounded="lg" elevation="1" class="mb-5">
            <VCardTitle class="pa-5">
              <VIcon icon="mdi-text-box-outline" color="primary" class="mr-2" />
              Descripción del puesto
            </VCardTitle>

            <VDivider />

            <VCardText class="pa-5">
              <p class="text-body-1 descripcion">
                {{ vacante.descripcion || 'Sin descripción registrada.' }}
              </p>
            </VCardText>
          </VCard>

          <VCard rounded="lg" elevation="1" class="mb-5">
            <VCardTitle class="pa-5">
              <VIcon icon="mdi-clipboard-check-outline" color="primary" class="mr-2" />
              Requisitos de la vacante
            </VCardTitle>

            <VDivider />

            <VCardText class="pa-5">
              <VAlert
                  v-if="!requisitos.length"
                  type="info"
                  variant="tonal"
              >
                No se han registrado requisitos específicos.
              </VAlert>

              <div
                  v-for="(requisito, index) in requisitos"
                  :key="requisito.id"
                  class="mb-4"
              >
                <div class="d-flex align-start ga-3">
                  <VAvatar
                      color="primary"
                      variant="tonal"
                      size="30"
                  >
                    {{ index + 1 }}
                  </VAvatar>

                  <div class="flex-grow-1">
                    <div class="d-flex align-center flex-wrap ga-2 mb-1">
                      <span class="font-weight-medium">
                        {{ requisito.nombre }}
                      </span>

                      <VChip
                          :color="[true, 1, '1'].includes(requisito.pivot?.obligatorio)
                          ? 'warning'
                          : 'secondary'"
                          size="x-small"
                          variant="tonal"
                      >
                        {{ [true, 1, '1'].includes(requisito.pivot?.obligatorio)
                          ? 'Obligatorio'
                          : 'Opcional' }}
                      </VChip>
                    </div>

                    <p
                        v-if="requisito.descripcion"
                        class="text-body-2 text-medium-emphasis"
                    >
                      {{ requisito.descripcion }}
                    </p>

                    <div
                        v-if="requisito.tipo_requisito?.nombre"
                        class="text-caption text-medium-emphasis mt-1"
                    >
                      {{ requisito.tipo_requisito.nombre }}
                    </div>
                  </div>
                </div>

                <VDivider
                    v-if="index < requisitos.length - 1"
                    class="mt-4"
                />
              </div>
            </VCardText>
          </VCard>
        </VCol>

        <VCol cols="12" md="4">
          <VCard rounded="lg" elevation="1">
            <VCardTitle class="pa-5">
              Información de la oportunidad
            </VCardTitle>

            <VDivider />

            <VCardText class="pa-5">
              <div class="mb-4">
                <div class="text-caption text-medium-emphasis">
                  Cantidad de plazas
                </div>
                <div class="font-weight-medium">
                  {{ vacante.cantidad_plazas }}
                </div>
              </div>

              <div class="mb-4">
                <div class="text-caption text-medium-emphasis">
                  Modalidad
                </div>
                <div class="font-weight-medium">
                  {{ vacante.modalidad?.replaceAll('_', ' ') }}
                </div>
              </div>

              <div class="mb-4">
                <div class="text-caption text-medium-emphasis">
                  Tipo de contrato
                </div>
                <div class="font-weight-medium">
                  {{ vacante.tipo_contrato?.replaceAll('_', ' ') }}
                </div>
              </div>

              <div class="mb-4">
                <div class="text-caption text-medium-emphasis">
                  Nivel de experiencia
                </div>
                <div class="font-weight-medium">
                  {{ vacante.nivel_experiencia }}
                </div>
              </div>

              <div class="mb-4">
                <div class="text-caption text-medium-emphasis">
                  Salario
                </div>
                <div class="font-weight-medium">
                  {{ formatearMoneda(vacante.salario_minimo) }}
                  —
                  {{ formatearMoneda(vacante.salario_maximo) }}
                </div>
              </div>

              <div class="mb-4">
                <div class="text-caption text-medium-emphasis">
                  Fecha de inicio
                </div>
                <div class="font-weight-medium">
                  {{ formatearFecha(vacante.fecha_inicio) }}
                </div>
              </div>

              <div class="mb-4">
                <div class="text-caption text-medium-emphasis">
                  Fecha límite
                </div>
                <div class="font-weight-medium">
                  {{ formatearFecha(vacante.fecha_limite) }}
                </div>
              </div>

              <VDivider class="mb-4" />

              <div class="text-body-2 text-medium-emphasis mb-4">
                {{ requisitosObligatorios.length }}
                requisitos obligatorios.
              </div>

              <VBtn
                  color="primary"
                  block
                  size="large"
                  prepend-icon="mdi-send-outline"
                  :disabled="!disponible || postulacionExitosa"
                  @click="abrirPostulacion"
              >
                {{ postulacionExitosa ? 'Postulación enviada' : 'Postularme' }}
              </VBtn>
            </VCardText>
          </VCard>
        </VCol>
      </VRow>
    </template>

    <!-- Confirmación de postulación -->
    <VDialog
        v-model="dialogoPostular"
        max-width="600"
        persistent
    >
      <VCard rounded="lg">
        <VCardTitle class="pa-5">
          <VIcon icon="mdi-send-outline" color="primary" class="mr-2" />
          Postularme a la vacante
        </VCardTitle>

        <VDivider />

        <VCardText class="pa-5">
          <div class="text-body-1 mb-4">
            Estás por postularte a:
            <strong>{{ vacante?.titulo }}</strong>
          </div>

          <VAlert
              v-if="errorPostulacion"
              type="error"
              variant="tonal"
              class="mb-4"
          >
            {{ errorPostulacion }}
          </VAlert>

          <VTextarea
              v-model="cartaPresentacion"
              label="Carta de presentación (opcional)"
              placeholder="Cuéntanos brevemente por qué te interesa esta oportunidad..."
              variant="outlined"
              density="comfortable"
              rows="5"
              auto-grow
              counter="4000"
              maxlength="4000"
          />
        </VCardText>

        <VDivider />

        <VCardActions class="pa-4">
          <VSpacer />

          <VBtn
              variant="text"
              :disabled="postulando"
              @click="dialogoPostular = false"
          >
            Cancelar
          </VBtn>

          <VBtn
              color="primary"
              prepend-icon="mdi-send-outline"
              :loading="postulando"
              @click="registrarPostulacion"
          >
            Confirmar postulación
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </VContainer>
</template>

<style scoped>
.descripcion {
  white-space: pre-line;
  overflow-wrap: anywhere;
}
</style>
