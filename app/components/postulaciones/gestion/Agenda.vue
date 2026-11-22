<script setup lang="ts">
import AgendaEntrevistas from './AgendaEntrevistas.vue'

const props = defineProps<{
  postulacionId: number
  estado: string
}>()

const emit = defineEmits<{
  actualizada: []
}>()
</script>

<template>
  <AgendaEntrevistas
      :postulacion-id="props.postulacionId"
      :estado="props.estado"
      @actualizada="emit('actualizada')"
  />
</template>