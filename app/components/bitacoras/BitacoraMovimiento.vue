
<script setup lang="ts">
import BitacoraCambios from '../bitacoras/BitacoraCambios.vue'
import {
  configuracionAccion,
  formatearFechaBitacora,
} from '../../utils/bitacoras/configuracion.ts'

const props = defineProps<{
  registro: any
  tipo: string
  referencias?: Record<string, Record<string, string>>
}>()

const accion = computed(() =>
    configuracionAccion(props.registro.accion || ''),
)

const tieneDetalles = computed(() =>
    props.registro.datos_anteriores !== null
    && props.registro.datos_anteriores !== undefined
    || props.registro.datos_nuevos !== null
    && props.registro.datos_nuevos !== undefined,
)

const expandido = ref(false)
</script>

<template>
  <div class="movimiento">
    <div class="movimiento-icono">
      <VAvatar
          :color="accion.color"
          size="38"
      >
        <VIcon
            :icon="accion.icono"
            color="white"
            size="20"
        />
      </VAvatar>
    </div>

    <div class="movimiento-contenido">
      <div class="d-flex align-center justify-space-between flex-wrap ga-2 mb-2">
        <div class="d-flex align-center flex-wrap ga-2">
          <span class="text-subtitle-1 font-weight-bold">
            {{ accion.titulo }}
          </span>

          <VChip
              :color="accion.color"
              size="x-small"
              variant="tonal"
          >
            {{ registro.accion }}
          </VChip>
        </div>

        <span class="text-caption text-medium-emphasis">
          {{ formatearFechaBitacora(registro.created_at) }}
        </span>
      </div>

      <p class="text-body-2 mb-2">
        {{ registro.descripcion }}
      </p>

      <div class="d-flex align-center ga-2 mb-3">
        <VIcon
            icon="mdi-account-outline"
            size="16"
            color="medium-emphasis"
        />

        <span class="text-caption text-medium-emphasis">
          {{ registro.usuario?.nombre_completo ?? 'Usuario no disponible' }}
        </span>
      </div>

      <div v-if="tieneDetalles" class="detalles">
        <VBtn
            variant="text"
            color="primary"
            size="small"
            :append-icon="expandido
            ? 'mdi-chevron-up'
            : 'mdi-chevron-down'"
            @click="expandido = !expandido"
        >
          {{ expandido ? 'Ocultar detalles' : 'Ver cambios' }}
        </VBtn>

        <VExpandTransition>
          <div v-if="expandido" class="pt-3">
            <BitacoraCambios
                :anteriores="registro.datos_anteriores"
                :nuevos="registro.datos_nuevos"
                :tipo="tipo"
                :referencias="referencias"
            />
          </div>
        </VExpandTransition>
      </div>
    </div>
  </div>
</template>

<style scoped>
.movimiento {
  position: relative;
  display: flex;
  gap: 16px;
  width: 100%;
}

.movimiento:not(:last-child)::before {
  content: '';
  position: absolute;
  top: 42px;
  bottom: 0;
  left: 18px;
  width: 2px;
  background: rgba(var(--v-border-color), 0.22);
}

.movimiento-icono {
  position: relative;
  z-index: 1;
  flex-shrink: 0;
}

.movimiento-contenido {
  flex: 1;
  min-width: 0;
  padding-bottom: 26px;
}

.detalles {
  min-width: 0;
  width: 100%;
}
</style>
