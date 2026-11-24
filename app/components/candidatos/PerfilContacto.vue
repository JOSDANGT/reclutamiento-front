<script setup lang="ts">
const datos = defineModel<any>({ required: true })
const disponibilidades = [
  { title: 'Inmediata', value: 'INMEDIATA' },
  { title: '15 días', value: '15_DIAS' },
  { title: '30 días', value: '30_DIAS' },
  { title: 'A convenir', value: 'A_CONVENIR' },
]
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
          maxlength="100"
          variant="outlined"
          density="comfortable"
      />
    </VCol>
    <VCol cols="12" md="6">
      <VTextField
          v-model="datos.departamento"
          label="Departamento" maxlength="100"
          variant="outlined"
          density="comfortable"
      />
    </VCol>
    <VCol cols="12" md="6">
      <VTextField
          v-model="datos.municipio"
          label="Municipio" maxlength="100"
          variant="outlined" density="comfortable"
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
