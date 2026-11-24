<script setup lang="ts">
const props = defineProps<{ candidato: any }>()
const ubicacion = computed(() => [props.candidato?.municipio, props.candidato?.departamento, props.candidato?.pais].filter(Boolean).join(', ') || '-')
</script>

<template>
  <VCard>
    <VCardTitle>Información profesional</VCardTitle>
    <VDivider/>
    <VCardText>
      <VRow>
        <VCol cols="12" md="6">
          <strong>Candidato:</strong>
          {{ candidato?.usuario?.nombre_completo || 'Sin nombre registrado' }}
        </VCol>
        <VCol cols="12" md="6"><strong>Teléfono:</strong> {{ candidato?.telefono_contacto || '-' }}</VCol>
        <VCol cols="12" md="6"><strong>Título:</strong> {{ candidato?.titulo_profesional || '-' }}</VCol>
        <VCol cols="12" md="6"><strong>Nivel académico:</strong> {{ candidato?.nivel_academico || '-' }}</VCol>
        <VCol cols="12" md="6"><strong>Experiencia:</strong> {{ candidato?.anios_experiencia ?? 0 }} años</VCol>
        <VCol cols="12" md="6"><strong>Pretensión salarial:</strong> {{ candidato?.pretension_salarial ?? '-' }}</VCol>
        <VCol cols="12" md="6"><strong>Disponibilidad:</strong> {{ candidato?.disponibilidad || '-' }}</VCol>
        <VCol cols="12" md="6"><strong>Ubicación:</strong> {{ ubicacion }}</VCol>
        <VCol cols="12"><strong>Resumen profesional:</strong>
          <p class="mt-2">{{ candidato?.resumen_profesional || '-' }}</p></VCol>
      </VRow>
    </VCardText>
  </VCard>
</template>
