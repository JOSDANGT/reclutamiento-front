<script setup lang="ts">
const {get, post, del} = useClienteRequest()

const documentos = ref<any[]>([])
const archivo = ref<File | File[] | null>(null)

const tipoDocumento = ref('CV')
const esPrincipal = ref(true)

const cargando = ref(false)
const guardando = ref(false)
const eliminandoId = ref<number | null>(null)

const error = ref('')
const mensaje = ref('')

const tiposDocumento = [
  {title: 'Currículum vitae', value: 'CV'},
  {title: 'Certificado', value: 'CERTIFICADO'},
  {title: 'Constancia', value: 'CONSTANCIA'},
  {title: 'Otro documento', value: 'OTRO'},
]

function formatearTamanio(bytes: number) {
  if (!bytes) return '0 KB'

  return `${(bytes / 1024 / 1024).toFixed(2)} MB`
}

async function obtenerDocumentos() {
  cargando.value = true
  error.value = ''

  try {
    const respuesta = await get(
        '/api/candidatos/mi-perfil/documentos',
    )

    const contenido = respuesta.data?.data ?? respuesta.data

    documentos.value = Array.isArray(contenido)
        ? contenido
        : []
  } catch (exception: any) {
    error.value = exception.response?.data?.message
        || 'No fue posible consultar los documentos.'
  } finally {
    cargando.value = false
  }
}

async function subirDocumento() {
  const seleccionado = Array.isArray(archivo.value)
      ? archivo.value[0]
      : archivo.value

  if (!seleccionado || guardando.value) return

  error.value = ''
  mensaje.value = ''

  const datos = new FormData()

  datos.append('archivo', seleccionado)
  datos.append('tipo_documento', tipoDocumento.value)
  datos.append('es_principal', esPrincipal.value ? '1' : '0')

  guardando.value = true

  try {
    await post(
        '/api/candidatos/mi-perfil/documentos',
        datos,
    )

    mensaje.value = 'Documento cargado correctamente.'

    archivo.value = null
    tipoDocumento.value = 'CV'
    esPrincipal.value = true

    await obtenerDocumentos()
  } catch (exception: any) {
    const errores = exception.response?.data?.errors

    error.value = errores
        ? Object.values(errores).flat().join(' ')
        : exception.response?.data?.message
        || 'No fue posible cargar el documento.'
  } finally {
    guardando.value = false
  }
}

async function eliminarDocumento(documento: any) {
  if (eliminandoId.value !== null) return

  eliminandoId.value = documento.id
  error.value = ''
  mensaje.value = ''

  try {
    await del(
        `/api/candidatos/mi-perfil/documentos/${documento.id}`,
    )

    mensaje.value = 'Documento eliminado correctamente.'

    await obtenerDocumentos()
  } catch (exception: any) {
    error.value = exception.response?.data?.message
        || 'No fue posible eliminar el documento.'
  } finally {
    eliminandoId.value = null
  }
}

onMounted(obtenerDocumentos)
</script>

<template>
  <VCard rounded="lg" elevation="1" class="mb-5">
    <VCardTitle class="pa-5">
      <VIcon
          icon="mdi-file-document-multiple-outline"
          color="primary"
          class="mr-2"
      />
      Documentos
    </VCardTitle>

    <VDivider/>

    <VCardText class="pa-5">
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

      <VRow>
        <VCol cols="12" md="5">
          <VFileInput
              v-model="archivo"
              label="Seleccionar documento"
              accept=".pdf,.jpg,.jpeg,.png"
              variant="outlined"
              density="comfortable"
              prepend-icon=""
              prepend-inner-icon="mdi-paperclip"
              show-size
              clearable
              :disabled="guardando"
              hint="PDF, JPG o PNG. Máximo 10 MB."
              persistent-hint
          />
        </VCol>

        <VCol cols="12" md="4">
          <VSelect
              v-model="tipoDocumento"
              :items="tiposDocumento"
              label="Tipo de documento"
              variant="outlined"
              density="comfortable"
              :disabled="guardando"
          />
        </VCol>

        <VCol cols="12" md="3">
          <VCheckbox
              v-model="esPrincipal"
              label="Documento principal"
              color="primary"
              :disabled="guardando"
              hide-details
          />
        </VCol>

        <VCol cols="12" class="d-flex justify-end">
          <VBtn
              color="primary"
              prepend-icon="mdi-cloud-upload-outline"
              :loading="guardando"
              :disabled="!archivo"
              @click="subirDocumento"
          >
            Subir documento
          </VBtn>
        </VCol>
      </VRow>

      <VDivider class="my-5"/>

      <div class="text-subtitle-1 font-weight-medium mb-4">
        Documentos registrados
      </div>

      <VProgressLinear
          v-if="cargando"
          indeterminate
          color="primary"
          class="mb-4"
      />

      <VAlert
          v-if="!cargando && !documentos.length"
          type="info"
          variant="tonal"
      >
        Todavía no has cargado documentos.
      </VAlert>

      <VList v-else lines="two">
        <template
            v-for="(documento, index) in documentos"
            :key="documento.id"
        >
          <VListItem>
            <template #prepend>
              <VAvatar
                  color="primary"
                  variant="tonal"
              >
                <VIcon
                    :icon="documento.mime_type === 'application/pdf'
                    ? 'mdi-file-pdf-box'
                    : 'mdi-file-image-outline'"
                />
              </VAvatar>
            </template>

            <VListItemTitle>
              {{ documento.nombre_original }}
            </VListItemTitle>

            <VListItemSubtitle>
              {{ documento.tipo_documento }}
              · {{ formatearTamanio(documento.tamanio_bytes) }}
            </VListItemSubtitle>

            <template #append>
              <VChip
                  v-if="documento.es_principal"
                  color="success"
                  variant="tonal"
                  size="small"
                  class="mr-2"
              >
                Principal
              </VChip>

              <VBtn
                  icon="mdi-delete-outline"
                  color="error"
                  variant="text"
                  size="small"
                  :loading="eliminandoId === documento.id"
                  @click="eliminarDocumento(documento)"
              />
            </template>
          </VListItem>

          <VDivider
              v-if="index < documentos.length - 1"
          />
        </template>
      </VList>
    </VCardText>
  </VCard>
</template>
