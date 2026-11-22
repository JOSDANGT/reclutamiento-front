<script setup lang="ts">
defineProps<{ formaciones: any[] }>()
</script>
<template>
  <VCard>
    <VCardTitle>Formación académica ({{ formaciones.length }})</VCardTitle>
    <VDivider/>
    <VCardText>
      <VAlert v-if="!formaciones.length" type="info" variant="tonal">Sin formación académica registrada.</VAlert>
      <VTable v-else density="compact">
        <thead>
        <tr>
          <th>Institución</th>
          <th>Título</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="formacion in formaciones" :key="formacion.id">
          <td>{{ formacion.institucion ?? '-' }}</td>
          <td>{{ formacion.titulo ?? '-' }}</td>
        </tr>
        </tbody>
      </VTable>
    </VCardText>
  </VCard>
</template>
