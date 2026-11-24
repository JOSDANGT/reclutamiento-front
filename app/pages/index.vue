
<script setup lang="ts">
definePageMeta({
  layout: 'default',
  middleware: 'auth',
})

const auth = useAuthStore()

const nombreUsuario = computed(() => {
  return auth.usuario?.primer_nombre || 'Usuario'
})
</script>

<template>
  <VContainer fluid class="pa-6">
    <div class="mb-6">
      <h1 class="text-h5 font-weight-bold mb-2">
        Bienvenido, {{ nombreUsuario }}
      </h1>

      <p class="text-body-2 text-medium-emphasis">
        Panel principal del Sistema de Reclutamiento y Selección.
      </p>
    </div>

    <VRow>
      <VCol cols="12" md="6">
        <VCard rounded="lg" elevation="1">
          <VCardTitle class="d-flex align-center ga-2">
            <VIcon icon="mdi-account-circle-outline" color="primary" />
            Mi información
          </VCardTitle>

          <VCardText>
            <div class="mb-3">
              <strong>Nombre:</strong>
              {{ auth.usuario?.primer_nombre }}
              {{ auth.usuario?.primer_apellido }}
            </div>

            <div class="mb-3">
              <strong>Correo:</strong>
              {{ auth.usuario?.email }}
            </div>

            <div>
              <strong>Roles:</strong>
              {{ auth.roles.join(', ') }}
            </div>
          </VCardText>
        </VCard>
      </VCol>

    </VRow>
  </VContainer>
</template>
