<script setup lang="ts">
const datos = defineModel<any>({required: true})

function validarUrl(v: string) {
  if (!v?.trim()) return true
  try {
    return ['http:', 'https:'].includes(new URL(v).protocol) || 'Ingresa una URL válida'
  } catch {
    return 'Ingresa una URL válida'
  }
}
</script>

<template>
  <VRow>
    <VCol cols="12">
      <VTextField
          v-model="datos.linkedin_url"
          label="LinkedIn"
          placeholder="https://linkedin.com/in/..."
          maxlength="500"
          :rules="[validarUrl]"
          prepend-inner-icon="mdi-linkedin"
          variant="outlined"
          density="comfortable"
      />
    </VCol>
    <VCol cols="12">
      <VTextField
          v-model="datos.github_url"
          label="GitHub"
          placeholder="https://github.com/..."
          maxlength="500" :rules="[validarUrl]"
          prepend-inner-icon="mdi-github"
          variant="outlined"
          density="comfortable"
      />
    </VCol>
    <VCol cols="12">
      <VTextField
          v-model="datos.portafolio_url"
          label="Portafolio"
          placeholder="https://..."
          maxlength="500"
          :rules="[validarUrl]" prepend-inner-icon="mdi-web" variant="outlined" density="comfortable"
      />
    </VCol>
  </VRow>
</template>
