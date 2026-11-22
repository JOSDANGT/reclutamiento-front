<script setup lang="ts">
defineProps<{ documentos: any[] }>()
</script>
<template>
  <VCard>
    <VCardTitle>Documentos ({{ documentos.length }})</VCardTitle>
    <VDivider/>
    <VCardText>
      <VAlert v-if="!documentos.length" type="warning" variant="tonal">No se han adjuntado documentos.</VAlert>
      <VList v-else lines="two">
        <VListItem v-for="documento in documentos" :key="documento.id"
                   :title="documento.nombre_original" :subtitle="documento.tipo_documento">
          <template #prepend>
            <VIcon icon="mdi-file-document-outline" class="mr-3"/>
          </template>
          <template #append>
            <VChip v-if="documento.es_principal" color="success" size="small" variant="tonal">Principal</VChip>
          </template>
        </VListItem>
      </VList>
      <div v-if="documentos.length" class="text-caption text-medium-emphasis mt-2">
        La visualización de archivos requiere la descarga autenticada para Recursos Humanos.
      </div>
    </VCardText>
  </VCard>
</template>
