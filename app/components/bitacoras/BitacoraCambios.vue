<script setup lang="ts">
import {formatearValor, interpretarDatos, nombreCampo,} from '../../utils/bitacoras/configuracion.ts'

const props = defineProps<{
  anteriores?: any
  nuevos?: any
  tipo: string
  referencias?: Record<string, Record<string, string>>
}>()

const camposExcluidos = [
  'id',
  'created_at',
  'updated_at',
  'deleted_at',
  'creado_por',
  'model_id',
  'model_type',
  'usuario_id',

  'unidad',
  'bitacoras',
  'requisitos_count',

  'password',
  'password_confirmation',
  'remember_token',
  'access_token',
  'token',
  'secret',
  'api_key',
]

function mostrarValor(valor: any, campo: string) {
  if (valor === null || valor === undefined || valor === '') {
    return campo.endsWith('_id') ? 'Sin asignar' : 'Sin información'
  }

  const referencia = props.referencias?.[campo]?.[String(valor)]

  if (referencia) {
    return referencia
  }

  return formatearValor(valor, campo, props.tipo)
}


function esCampoRequisitos(campo: string) {
  return props.tipo === 'vacante' && campo === 'requisitos'
}

function obtenerRequisitos(valor: any) {
  if (!Array.isArray(valor)) return []

  return valor.map((requisito: any) => ({
    id: requisito.id,
    nombre: requisito.nombre || `Requisito #${requisito.id}`,
    obligatorio: [true, 1, '1'].includes(
        requisito.pivot?.obligatorio ?? requisito.obligatorio,
    ),
    orden: Number(
        requisito.pivot?.orden ?? requisito.orden ?? 0,
    ),
  }))
}

function descripcionRequisito(requisito: any) {
  return requisito.obligatorio ? 'Obligatorio' : 'Opcional'
}


function valoresIguales(anterior: any, nuevo: any) {
  if (anterior === nuevo) return true

  if (anterior == null || nuevo == null) {
    return anterior === nuevo
  }

  if (typeof anterior === 'object' || typeof nuevo === 'object') {
    return JSON.stringify(anterior) === JSON.stringify(nuevo)
  }

  return String(anterior) === String(nuevo)
}

function esObjeto(valor: any) {
  return valor !== null
      && typeof valor === 'object'
      && !Array.isArray(valor)
}

const cambios = computed(() => {
  const anteriores = interpretarDatos(props.anteriores)
  const nuevos = interpretarDatos(props.nuevos)

  const antes = esObjeto(anteriores) ? anteriores : {}
  const despues = esObjeto(nuevos) ? nuevos : {}

  const campos = [...new Set([
    ...Object.keys(antes),
    ...Object.keys(despues),
  ])]

  return campos
      .filter(campo => !camposExcluidos.includes(campo.toLowerCase()))
      .filter(campo => {
        const existeAnterior = Object.prototype.hasOwnProperty.call(antes, campo)
        const existeNuevo = Object.prototype.hasOwnProperty.call(despues, campo)

        if (!existeAnterior || !existeNuevo) {
          return true
        }

        return !valoresIguales(antes[campo], despues[campo])
      })
      .map(campo => ({
        campo,
        nombre: nombreCampo(campo, props.tipo),
        anterior: antes[campo],
        nuevo: despues[campo],
        tieneAnterior: Object.prototype.hasOwnProperty.call(antes, campo),
        tieneNuevo: Object.prototype.hasOwnProperty.call(despues, campo),
      }))
})

const soloCreacion = computed(() =>
    !interpretarDatos(props.anteriores),
)

function esComplejo(valor: any) {
  return valor !== null
      && typeof valor === 'object'
}

function esEstado(campo: string) {
  return campo === 'estado'
}
</script>



<template>
  <div v-if="cambios.length" class="bitacora-cambios">
    <div
        v-for="cambio in cambios"
        :key="cambio.campo"
        class="cambio-fila"
    >
      <div class="text-body-2 font-weight-medium mb-1">
        {{ cambio.nombre }}
      </div>

      <!-- Visualización específica de requisitos -->
      <div v-if="esCampoRequisitos(cambio.campo)">
        <!-- Requisitos anteriores -->
        <div
            v-if="!soloCreacion && cambio.tieneAnterior"
            class="mb-3"
        >
          <div class="text-caption text-medium-emphasis mb-2">
            Anteriores
          </div>

          <div
              v-for="requisito in obtenerRequisitos(cambio.anterior)"
              :key="`anterior-${requisito.id}`"
              class="d-flex align-start ga-2 mb-2"
          >
            <VIcon
                icon="mdi-circle-small"
                color="medium-emphasis"
                size="20"
            />

            <div>
              <div class="text-body-2">
                {{ requisito.nombre }}
              </div>

              <div class="text-caption text-medium-emphasis">
                {{ descripcionRequisito(requisito) }}
              </div>
            </div>
          </div>

          <div
              v-if="!obtenerRequisitos(cambio.anterior).length"
              class="text-body-2 text-medium-emphasis"
          >
            Sin requisitos
          </div>
        </div>

        <!-- Requisitos nuevos -->
        <div v-if="cambio.tieneNuevo">
          <div
              v-if="!soloCreacion"
              class="text-caption text-medium-emphasis mb-2"
          >
            Nuevos
          </div>

          <div
              v-for="requisito in obtenerRequisitos(cambio.nuevo)"
              :key="`nuevo-${requisito.id}`"
              class="d-flex align-start ga-2 mb-2"
          >
            <VIcon
                icon="mdi-check-circle-outline"
                color="success"
                size="18"
            />

            <div>
              <div class="text-body-2 font-weight-medium">
                {{ requisito.nombre }}
              </div>

              <div class="text-caption text-medium-emphasis">
                {{ descripcionRequisito(requisito) }}
              </div>
            </div>
          </div>

          <div
              v-if="!obtenerRequisitos(cambio.nuevo).length"
              class="text-body-2 text-medium-emphasis"
          >
            Sin requisitos
          </div>
        </div>
      </div>

      <!-- Creación: mostrar únicamente el valor nuevo -->
      <div
          v-else-if="soloCreacion"
          class="text-body-2 valor-nuevo"
      >
        {{ mostrarValor(cambio.nuevo, cambio.campo) }}
      </div>

      <!-- Actualización: mostrar anterior → nuevo -->
      <div
          v-else
          class="d-flex align-center flex-wrap ga-2"
      >
        <span class="text-body-2 text-medium-emphasis valor">
          {{
            cambio.tieneAnterior
                ? mostrarValor(cambio.anterior, cambio.campo)
                : 'Sin información'
          }}
        </span>

        <VIcon
            icon="mdi-arrow-right"
            size="16"
            color="medium-emphasis"
        />

        <span class="text-body-2 font-weight-medium valor">
          {{
            cambio.tieneNuevo
                ? mostrarValor(cambio.nuevo, cambio.campo)
                : 'Sin información'
          }}
        </span>
      </div>
    </div>
  </div>

  <div v-else class="text-body-2 text-medium-emphasis">
    No hay diferencias de campos disponibles.
  </div>
</template>



<style scoped>

.bitacora-cambios {
  border: 1px solid rgba(var(--v-border-color), 0.2);
  border-radius: 8px;
  overflow: hidden;
}

.cambio-fila {
  padding: 10px 14px;
}

.cambio-fila + .cambio-fila {
  border-top: 1px solid rgba(var(--v-border-color), 0.12);
}

.valor {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  min-width: 0;
}

.valor-nuevo {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

</style>
