
<script setup lang="ts">
interface Etapa {
  codigo: string
  nombre: string
  descripcion?: string
  icono?: string
}

const props = withDefaults(defineProps<{
  estado: string | null
  etapas: Etapa[]
  fechaPostulacion?: string | null
  estadosFinales?: string[]
  compacto?: boolean
}>(), {
  fechaPostulacion: null,
  estadosFinales: () => [],
  compacto: false,
})

function normalizar(valor: string | null | undefined) {
  return String(valor ?? '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[_-]/g, ' ')
      .trim()
      .toUpperCase()
}

const indiceActual = computed(() =>
    props.etapas.findIndex(
        etapa => normalizar(etapa.codigo) === normalizar(props.estado),
    ),
)

const esEstadoFinal = computed(() =>
    props.estadosFinales.some(
        estado => normalizar(estado) === normalizar(props.estado),
    ),
)

const etapaActual = computed(() =>
    indiceActual.value >= 0
        ? props.etapas[indiceActual.value]
        : null,
)

const progreso = computed(() => {
  if (indiceActual.value < 0 || !props.etapas.length) return 0

  return Math.round(
      ((indiceActual.value + 1) / props.etapas.length) * 100,
  )
})

function estadoEtapa(index: number) {
  if (esEstadoFinal.value || indiceActual.value < 0) {
    return 'pendiente'
  }

  if (index < indiceActual.value) return 'completado'
  if (index === indiceActual.value) return 'actual'

  return 'pendiente'
}

function colorEtapa(index: number) {
  const estado = estadoEtapa(index)

  if (estado === 'completado') return 'success'
  if (estado === 'actual') return 'primary'

  return 'grey'
}

function iconoEtapa(etapa: Etapa, index: number) {
  if (estadoEtapa(index) === 'completado') {
    return 'mdi-check'
  }

  return etapa.icono || 'mdi-circle-small'
}

function formatearFecha(fecha?: string | null) {
  if (!fecha) return ''

  const [anio, mes, dia] = fecha.substring(0, 10).split('-')

  return anio && mes && dia
      ? `${dia}/${mes}/${anio}`
      : fecha
}
</script>

<template>
  <VCard
      rounded="lg"
      variant="outlined"
  >
    <VCardText :class="compacto ? 'pa-4' : 'pa-5'">
      <div class="d-flex justify-space-between align-center flex-wrap ga-3 mb-3">
        <div>
          <div class="text-subtitle-1 font-weight-bold">
            Seguimiento de postulación
          </div>

          <div
              v-if="fechaPostulacion"
              class="text-caption text-medium-emphasis mt-1"
          >
            Postulado el {{ formatearFecha(fechaPostulacion) }}
          </div>
        </div>

        <VChip
            :color="esEstadoFinal ? 'warning' : 'primary'"
            size="small"
            variant="tonal"
        >
          {{ etapaActual?.nombre ?? estado ?? 'Sin estado' }}
        </VChip>
      </div>

      <template v-if="!esEstadoFinal && indiceActual >= 0">
        <VProgressLinear
            :model-value="progreso"
            color="primary"
            rounded
            height="6"
            class="mb-5"
        />

        <div class="d-flex justify-space-between mb-4">
          <span class="text-caption text-medium-emphasis">
            Etapa {{ indiceActual + 1 }} de {{ etapas.length }}
          </span>

          <span class="text-caption font-weight-medium">
            {{ progreso }}%
          </span>
        </div>
      </template>

      <VAlert
          v-if="esEstadoFinal"
          type="info"
          variant="tonal"
          density="compact"
          class="mb-4"
      >
        Tu postulación tiene el estado:
        <strong>{{ estado }}</strong>.
      </VAlert>

      <VAlert
          v-else-if="indiceActual === -1"
          type="info"
          variant="tonal"
          density="compact"
          class="mb-4"
      >
        Estado actual:
        <strong>{{ estado || 'No disponible' }}</strong>.
        No se encuentra configurado entre las etapas del seguimiento.
      </VAlert>

      <div class="tracking-list">
        <div
            v-for="(etapa, index) in etapas"
            :key="etapa.codigo"
            class="tracking-item"
        >
          <div class="tracking-indicator">
            <VAvatar
                :color="colorEtapa(index)"
                :variant="estadoEtapa(index) === 'pendiente'
                ? 'tonal'
                : 'flat'"
                size="34"
            >
              <VIcon
                  :icon="iconoEtapa(etapa, index)"
                  size="20"
              />
            </VAvatar>

            <div
                v-if="index < etapas.length - 1"
                class="tracking-line"
                :class="{
                'tracking-line-completed':
                  estadoEtapa(index) === 'completado',
              }"
            />
          </div>

          <div class="flex-grow-1 pb-6">
            <div class="d-flex align-center flex-wrap ga-2">
              <span
                  class="text-body-2 font-weight-medium"
                  :class="{
                  'text-medium-emphasis':
                    estadoEtapa(index) === 'pendiente',
                }"
              >
                {{ etapa.nombre }}
              </span>

              <VChip
                  v-if="estadoEtapa(index) === 'actual'"
                  color="primary"
                  size="x-small"
                  variant="tonal"
              >
                Actual
              </VChip>

              <VIcon
                  v-if="estadoEtapa(index) === 'completado'"
                  icon="mdi-check-circle"
                  color="success"
                  size="small"
              />
            </div>

            <div
                v-if="etapa.descripcion && !compacto"
                class="text-caption text-medium-emphasis mt-1"
            >
              {{ etapa.descripcion }}
            </div>
          </div>
        </div>
      </div>
    </VCardText>
  </VCard>
</template>

<style scoped>
.tracking-item {
  display: flex;
  align-items: stretch;
  gap: 14px;
}

.tracking-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
}

.tracking-line {
  width: 2px;
  flex: 1;
  min-height: 22px;
  margin: 5px 0;
  background-color: rgba(var(--v-theme-on-surface), 0.12);
}

.tracking-line-completed {
  background-color: rgb(var(--v-theme-success));
}
</style>
