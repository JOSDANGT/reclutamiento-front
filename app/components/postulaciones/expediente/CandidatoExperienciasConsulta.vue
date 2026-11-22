<script setup lang="ts">
defineProps<{ experiencias: any[] }>()

function fecha(valor: string | null) {
  if (!valor) return '-'
  const [anio, mes, dia] = String(valor).substring(0, 10).split('-')
  return anio && mes && dia ? `${dia}/${mes}/${anio}` : '-'
}
</script>
<template>
  <VCard>
    <VCardTitle>Experiencia laboral ({{ experiencias.length }})</VCardTitle>
    <VDivider/>
    <VCardText>
      <VAlert v-if="!experiencias.length" type="info" variant="tonal">Sin experiencia laboral registrada.</VAlert>
      <VTable v-else density="compact">
        <thead>
        <tr>
          <th>Empresa</th>
          <th>Puesto</th>
          <th>Inicio</th>
          <th>Fin</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="experiencia in experiencias" :key="experiencia.id">
          <td>{{ experiencia.empresa ?? '-' }}</td>
          <td>{{ experiencia.puesto ?? '-' }}</td>
          <td>{{ fecha(experiencia.fecha_inicio) }}</td>
          <td>{{ fecha(experiencia.fecha_fin) }}</td>
        </tr>
        </tbody>
      </VTable>
    </VCardText>
  </VCard>
</template>
