
<script setup lang="ts">
const props = defineProps<{
  bitacoras: any[]
}>()

const acciones: Record<string, any> = {
  CREACION: {
    titulo: 'Vacante creada',
    icono: 'mdi-plus-circle-outline',
    color: 'success',
  },
  ACTUALIZACION: {
    titulo: 'Información actualizada',
    icono: 'mdi-pencil-outline',
    color: 'info',
  },
  CAMBIO_ESTADO: {
    titulo: 'Cambio de estado',
    icono: 'mdi-swap-horizontal',
    color: 'warning',
  },
  ELIMINACION: {
    titulo: 'Vacante eliminada',
    icono: 'mdi-delete-outline',
    color: 'error',
  },
}

const historial = computed(() =>
    [...(props.bitacoras || [])].sort(
        (a, b) =>
            new Date(b.created_at).getTime()
            - new Date(a.created_at).getTime()
            || Number(b.id) - Number(a.id),
    ),
)

function configuracion(accion: string) {
  return acciones[accion] || {
    titulo: accion,
    icono: 'mdi-history',
    color: 'secondary',
  }
}

function formatoFecha(fecha: string) {
  if (!fecha) return 'Sin fecha'

  const valor = new Date(fecha)

  if (Number.isNaN(valor.getTime())) return fecha

  return valor.toLocaleString('es-GT', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function obtenerDatos(valor: any) {
  if (!valor) return null

  if (typeof valor === 'string') {
    try {
      return JSON.parse(valor)
    }
    catch {
      return valor
    }
  }

  return valor
}

function mostrarDatos(valor: any) {
  const datos = obtenerDatos(valor)

  return datos === null
      ? 'Sin información'
      : JSON.stringify(datos, null, 2)
}
</script>

<template>
  <VCard rounded="lg" elevation="1">
    <VCardTitle class="d-flex align-center ga-2 pa-5">
      <VIcon icon="mdi-history" color="primary" />

      Historial de movimientos

      <VSpacer />

      <VChip
          color="primary"
          size="small"
          variant="tonal"
      >
        {{ historial.length }} registros
      </VChip>
    </VCardTitle>

    <VDivider />

    <VCardText class="pa-5">
      <VAlert
          v-if="!historial.length"
          type="info"
          variant="tonal"
      >
        Esta vacante todavía no tiene movimientos registrados.
      </VAlert>

      <div v-else class="historial">
        <div
            v-for="registro in historial"
            :key="registro.id"
            class="historial-item"
        >
          <div class="historial-icono">
            <VAvatar
                :color="configuracion(registro.accion).color"
                size="34"
            >
              <VIcon
                  :icon="configuracion(registro.accion).icono"
                  size="20"
                  color="white"
              />
            </VAvatar>
          </div>

          <div class="historial-contenido">
            <div class="d-flex align-center flex-wrap ga-2 mb-2">
              <span class="text-subtitle-1 font-weight-bold">
                {{ configuracion(registro.accion).titulo }}
              </span>

              <VChip
                  :color="configuracion(registro.accion).color"
                  size="x-small"
                  variant="tonal"
              >
                {{ registro.accion }}
              </VChip>
            </div>

            <p class="text-body-2 text-medium-emphasis mb-2">
              {{ formatoFecha(registro.created_at) }}
            </p>

            <p class="text-body-2 mb-2">
              {{ registro.descripcion }}
            </p>

            <div class="d-flex align-center ga-2 mb-4">
              <VIcon
                  icon="mdi-account-outline"
                  size="small"
                  color="medium-emphasis"
              />

              <span class="text-caption text-medium-emphasis">
                {{
                  registro.usuario_id
                      ? `Usuario #${registro.usuario_id}`
                      : 'Usuario no identificado'
                }}
              </span>
            </div>

            <VExpansionPanels
                v-if="registro.datos_anteriores || registro.datos_nuevos"
                variant="accordion"
                class="mb-4"
            >
              <VExpansionPanel elevation="0" rounded="lg">
                <VExpansionPanelTitle>
                  <VIcon
                      icon="mdi-file-compare"
                      size="small"
                      class="mr-2"
                  />

                  Ver detalles del movimiento
                </VExpansionPanelTitle>

                <VExpansionPanelText>
                  <VRow>
                    <VCol
                        v-if="registro.datos_anteriores"
                        cols="12"
                        :md="registro.datos_nuevos ? 6 : 12"
                    >
                      <p class="text-subtitle-2 mb-2">
                        Datos anteriores
                      </p>

                      <pre class="datos-bitacora">{{ mostrarDatos(registro.datos_anteriores) }}</pre>
                    </VCol>

                    <VCol
                        v-if="registro.datos_nuevos"
                        cols="12"
                        :md="registro.datos_anteriores ? 6 : 12"
                    >
                      <p class="text-subtitle-2 mb-2">
                        Datos nuevos
                      </p>

                      <pre class="datos-bitacora">{{ mostrarDatos(registro.datos_nuevos) }}</pre>
                    </VCol>
                  </VRow>
                </VExpansionPanelText>
              </VExpansionPanel>
            </VExpansionPanels>
          </div>
        </div>
      </div>
    </VCardText>
  </VCard>
</template>

<style scoped>
.historial {
  width: 100%;
}

.historial-item {
  display: flex;
  gap: 16px;
  position: relative;
  width: 100%;
}

.historial-item:not(:last-child)::before {
  content: '';
  position: absolute;
  left: 16px;
  top: 38px;
  bottom: 0;
  width: 2px;
  background: rgba(128, 128, 128, 0.22);
}

.historial-icono {
  position: relative;
  z-index: 1;
  flex-shrink: 0;
}

.historial-contenido {
  flex: 1;
  min-width: 0;
  padding-bottom: 20px;
}

.datos-bitacora {
  display: block;
  width: 100%;
  min-width: 0;
  max-height: 350px;
  overflow: auto;
  padding: 16px;
  border-radius: 8px;
  background: rgba(128, 128, 128, 0.08);
  font-size: 12px;
  line-height: 1.6;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  overscroll-behavior: contain;
}
</style>
