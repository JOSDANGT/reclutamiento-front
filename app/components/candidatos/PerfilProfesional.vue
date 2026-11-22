<script setup lang="ts">
const datos = defineModel<any>({ required: true })

const nivelesAcademicos = [
  { title: 'Diversificado', value: 'DIVERSIFICADO' },
  { title: 'Técnico', value: 'TECNICO' },
  { title: 'Universitario', value: 'UNIVERSITARIO' },
  { title: 'Licenciatura', value: 'LICENCIATURA' },
  { title: 'Maestría', value: 'MAESTRIA' },
  { title: 'Doctorado', value: 'DOCTORADO' },
]
</script>

<template>
  <VRow>
    <VCol cols="12">
      <VTextField v-model="datos.titulo_profesional" label="Título profesional" placeholder="Ej. Analista de créditos" counter="150" maxlength="150" variant="outlined" density="comfortable" />
    </VCol>
    <VCol cols="12">
      <VTextarea v-model="datos.resumen_profesional" label="Resumen profesional" placeholder="Cuéntanos sobre tu experiencia, fortalezas y objetivos" rows="4" auto-grow counter="5000" maxlength="5000" variant="outlined" density="comfortable" />
    </VCol>
    <VCol cols="12" md="6">
      <VTextField v-model.number="datos.anios_experiencia" label="Años de experiencia" type="number" min="0" max="100" step="1" :rules="[v => Number.isInteger(Number(v)) && Number(v) >= 0 && Number(v) <= 100 || 'Indica años válidos (0 a 100)']" variant="outlined" density="comfortable" />
    </VCol>
    <VCol cols="12" md="6">
      <VSelect v-model="datos.nivel_academico" :items="nivelesAcademicos" label="Nivel académico" clearable variant="outlined" density="comfortable" />
    </VCol>
  </VRow>
</template>
