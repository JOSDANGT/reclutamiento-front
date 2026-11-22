<script setup lang="ts">
type Situacion =
    | 'Completada'
    | 'Programada'
    | 'Pendiente de decisión'
    | 'Pendiente'
    | 'Bloqueada'

type Etapa = {
  id: number
  nombre: string
  descripcion: string
  situacion: Situacion
}

defineProps<{
  etapas: Etapa[]
}>()

const apariencia = {
  'Completada': {
    color: 'success',
    icono: 'mdi-check-circle-outline',
  },
  'Programada': {
    color: 'primary',
    icono: 'mdi-calendar-clock',
  },
  'Pendiente de decisión': {
    color: 'warning',
    icono: 'mdi-account-question-outline',
  },
  'Pendiente': {
    color: 'warning',
    icono: 'mdi-clock-outline',
  },
  'Bloqueada': {
    color: 'secondary',
    icono: 'mdi-lock-outline',
  },
}
</script>

<template>
  <VCard rounded="lg">
    <VCardTitle class="pa-4">Etapas de entrevista</VCardTitle>
    <VDivider />

    <VList lines="two">
      <VListItem
          v-for="etapa in etapas"
          :key="etapa.id"
          :title="etapa.nombre"
          :subtitle="etapa.descripcion"
      >
        <template #prepend>
          <VIcon
              :icon="apariencia[etapa.situacion].icono"
              :color="apariencia[etapa.situacion].color"
          />
        </template>

        <template #append>
          <VChip
              :color="apariencia[etapa.situacion].color"
              size="small"
              variant="tonal"
          >
            {{ etapa.situacion }}
          </VChip>
        </template>
      </VListItem>
    </VList>
  </VCard>
</template>