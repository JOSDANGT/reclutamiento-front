<script setup lang="ts">
const props = defineProps<{
  ruta: string
  nombre: string
  mimeType: string
}>()

const { get } = useClienteRequest()

const dialogo = ref(false)
const cargando = ref(false)
const error = ref('')
const urlArchivo = ref('')
const tipoArchivo = ref('')

let solicitudActual = 0

function limpiarArchivo() {
  if (urlArchivo.value) {
    URL.revokeObjectURL(urlArchivo.value)
    urlArchivo.value = ''
  }
}

function cerrar() {
  solicitudActual++
  dialogo.value = false
  cargando.value = false
  limpiarArchivo()
}

async function abrir() {
  if (cargando.value) return

  const solicitud = ++solicitudActual

  limpiarArchivo()
  error.value = ''
  tipoArchivo.value = ''
  dialogo.value = true
  cargando.value = true

  try {
    const respuesta = await get(props.ruta, {
      responseType: 'blob',
    })

    const archivo = respuesta instanceof Blob ? respuesta : respuesta?.data

    if (!(archivo instanceof Blob) || archivo.size === 0) {
      throw new Error('La respuesta no contiene el archivo.')
    }

    const tipo = archivo.type.split(';')[0].trim().toLowerCase()
    const mime = !tipo || tipo === 'application/octet-stream'
        ? props.mimeType
        : tipo

    if (!['application/pdf', 'image/jpeg', 'image/png'].includes(mime)) {
      throw new Error('Formato no compatible.')
    }

    // Si cerraron el diálogo mientras se descargaba, descarta la respuesta.
    if (solicitud !== solicitudActual) return

    tipoArchivo.value = mime
    urlArchivo.value = URL.createObjectURL(
        archivo.type === mime ? archivo : archivo.slice(0, archivo.size, mime),
    )
  }
  catch (e: any) {
    if (solicitud !== solicitudActual) return

    const status = e.response?.status ?? e.statusCode

    if (status === 404) {
      error.value = 'El archivo ya no está disponible.'
    }
    else if (status === 403) {
      error.value = 'No tienes permiso para consultar este documento.'
    }
    else {
      error.value = 'No fue posible abrir el documento.'
    }
  }
  finally {
    if (solicitud === solicitudActual) cargando.value = false
  }
}

onBeforeUnmount(cerrar)
</script>

<template>
  <VBtn
      icon="mdi-eye-outline"
      color="primary"
      variant="text"
      size="small"
      :title="`Ver ${nombre}`"
      :aria-label="`Ver ${nombre}`"
      @click="abrir"
  />

  <VDialog
      :model-value="dialogo"
      max-width="1000"
      scrollable
      @update:model-value="valor => { if (!valor) cerrar() }"
  >
    <VCard rounded="lg">
      <VCardTitle class="d-flex align-center justify-space-between ga-3">
        <span class="text-truncate">{{ nombre }}</span>

        <VBtn
            icon="mdi-close"
            variant="text"
            aria-label="Cerrar documento"
            @click="cerrar"
        />
      </VCardTitle>

      <VDivider />

      <VCardText>
        <VProgressLinear v-if="cargando" indeterminate color="primary" />

        <VAlert v-else-if="error" type="error" variant="tonal">
          {{ error }}
        </VAlert>

        <iframe
            v-else-if="urlArchivo && tipoArchivo === 'application/pdf'"
            :src="urlArchivo"
            :title="nombre"
            class="visor-pdf"
        />

        <VImg
            v-else-if="urlArchivo"
            :src="urlArchivo"
            :alt="nombre"
            max-height="70vh"
        />
      </VCardText>
    </VCard>
  </VDialog>
</template>

<style scoped>
.visor-pdf {
  display: block;
  width: 100%;
  height: 70vh;
  border: 0;
}
</style>