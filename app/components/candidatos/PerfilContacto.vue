<script setup lang="ts">
const datos = defineModel<any>({ required: true })
import { departamentos, municipiosPorDepartamento } from '../../data/ubicacionesGuatemala'

datos.value.pais = 'Guatemala'
const disponibilidades = [
  { title: 'Inmediata', value: 'INMEDIATA' },
  { title: '15 días', value: '15_DIAS' },
  { title: '30 días', value: '30_DIAS' },
  { title: 'A convenir', value: 'A_CONVENIR' },
]



const departamentos = Object.keys(municipiosPorDepartamento)

const municipios = computed(() => {
  return municipiosPorDepartamento[datos.value.departamento] ?? []
})

function cambiarDepartamento(valor: string | null) {
  const departamento = valor ?? ''

  if (datos.value.departamento === departamento) return

  datos.value.departamento = departamento
  datos.value.municipio = ''
}
</script>

<template>
  <VRow>
    <VCol cols="12" md="6">
      <VTextField
          v-model="datos.telefono_contacto"
          label="Teléfono de contacto"
          maxlength="25"
          variant="outlined"
          density="comfortable"
      />
    </VCol>
    <VCol cols="12" md="6">
      <VTextField
          v-model="datos.pais"
          label="País"
          variant="outlined"
          density="comfortable"
          disabled
      />
    </VCol>
    <VCol cols="12" md="6">
      <VAutocomplete
          :model-value="datos.departamento"
          :items="departamentos"
          item-title="title"
          item-value="value"
          label="Departamento"
          variant="outlined"
          density="comfortable"
          no-data-text="No se encontraron departamentos"
          clearable
          @update:model-value="cambiarDepartamento"
      />
    </VCol>

    <VCol cols="12" md="6">
      <VAutocomplete
          v-model="datos.municipio"
          :items="municipios"
          :disabled="!municipios.length"
          label="Municipio"
          variant="outlined"
          density="comfortable"
          no-data-text="No se encontraron municipios"
          clearable
      />
    </VCol>
    <VCol cols="12" md="6">
      <VSelect
          v-model="datos.disponibilidad"
          :items="disponibilidades"
          label="Disponibilidad laboral"
          clearable variant="outlined"
          density="comfortable"
      />
    </VCol>
    <VCol cols="12" md="6">
      <VTextField
          v-model.number="datos.pretension_salarial"
          label="Pretensión salarial (GTQ)"
          prefix="Q"
          type="number"
          min="0"
          step="0.01"
          :rules="[v => v == null || v === '' || Number(v) >= 0 || 'Ingresa un monto válido']" variant="outlined" density="comfortable" /></VCol>
  </VRow>
</template>
