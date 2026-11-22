<script setup lang="ts">
const props = defineProps<{ habilidades: any[] }>()

function nombreNivel(habilidad: any) {
  return habilidad.pivot?.nivel_habilidad?.nombre
      ?? habilidad.nivel_habilidad?.nombre
      ?? habilidad.nivel?.nombre
      ?? `Nivel #${habilidad.pivot?.nivel_habilidad_id ?? '-'}`
}
</script>

<template>
  <VCard>
    <VCardTitle>Habilidades ({{ habilidades.length }})</VCardTitle>
    <VDivider/>
    <VCardText>
      <VAlert v-if="!habilidades.length" type="info" variant="tonal">El candidato no tiene habilidades registradas.
      </VAlert>
      <VTable v-else density="compact">
        <thead>
        <tr>
          <th>Habilidad</th>
          <th>Nivel</th>
          <th>Años</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="habilidad in habilidades" :key="habilidad.id">
          <td>{{ habilidad.nombre }}</td>
          <td>{{ nombreNivel(habilidad) }}</td>
          <td>{{ habilidad.pivot?.anios_experiencia ?? 0 }}</td>
        </tr>
        </tbody>
      </VTable>
    </VCardText>
  </VCard>
</template>
