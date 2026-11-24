<script setup lang="ts">
import VerDocumento from '@/components/candidatos/VerDocumento.vue'

defineProps<{
  postulacionId: number
  documentos: any[]
}>()
</script>

<template>
  <VCard>
    <VCardTitle>Documentos ({{ documentos.length }})</VCardTitle>
    <VDivider />

    <VCardText>
      <VAlert
          v-if="!documentos.length"
          type="warning"
          variant="tonal"
      >
        No se han adjuntado documentos.
      </VAlert>

      <VList v-else lines="two">
        <VListItem
            v-for="documento in documentos"
            :key="documento.id"
            :title="documento.nombre_original"
            :subtitle="documento.tipo_documento"
        >
          <template #prepend>
            <VIcon icon="mdi-file-document-outline" class="mr-3" />
          </template>

          <template #append>
            <VChip
                v-if="documento.es_principal"
                color="success"
                size="small"
                variant="tonal"
                class="mr-2"
            >
              Principal
            </VChip>

            <VerDocumento
                :ruta="`/api/postulaciones/documentos/${postulacionId}/${documento.id}`"
                :nombre="documento.nombre_original"
                :mime-type="documento.mime_type"
            />
          </template>
        </VListItem>
      </VList>
    </VCardText>
  </VCard>
</template>