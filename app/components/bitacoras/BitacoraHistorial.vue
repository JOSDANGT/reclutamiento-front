
<script setup lang="ts">
import BitacoraMovimiento from '../bitacoras/BitacoraMovimiento.vue'
import { obtenerConfiguracionBitacora } from '../../utils/bitacoras/configuracion.ts'

const props = withDefaults(defineProps<{
  registros?: any[]
  tipo?: string
  titulo?: string
  referencias?: Record<string, Record<string, string>>
}>(), {
  registros: () => [],
  tipo: 'general',
  titulo: '',
  referencias: () => ({}),
})

const configuracion = computed(() =>
    obtenerConfiguracionBitacora(props.tipo),
)

const tituloHistorial = computed(() =>
    props.titulo || configuracion.value.titulo,
)

const historial = computed(() =>
    [...props.registros].sort((a, b) => {
      const fechaA = new Date(a.created_at).getTime() || 0
      const fechaB = new Date(b.created_at).getTime() || 0

      return fechaB - fechaA || Number(b.id) - Number(a.id)
    }),
)
</script>

<template>
  <VCard rounded="lg" elevation="1">
    <VCardTitle class="d-flex align-center ga-2 pa-5">
      <VIcon
          icon="mdi-history"
          color="primary"
      />

      <span class="text-subtitle-1 font-weight-bold">
        {{ tituloHistorial }}
      </span>

      <VSpacer />

      <VChip
          color="primary"
          variant="tonal"
          size="small"
      >
        {{ historial.length }} movimientos
      </VChip>
    </VCardTitle>

    <VDivider />

    <VCardText class="pa-5">
      <VAlert
          v-if="!historial.length"
          type="info"
          variant="tonal"
      >
        No hay movimientos registrados.
      </VAlert>

      <div v-else class="historial">
        <BitacoraMovimiento
            v-for="registro in historial"
            :key="registro.id"
            :registro="registro"
            :tipo="tipo"
            :referencias="referencias"
        />
      </div>
    </VCardText>
  </VCard>
</template>

<style scoped>
.historial {
  width: 100%;
  min-width: 0;
}
</style>
