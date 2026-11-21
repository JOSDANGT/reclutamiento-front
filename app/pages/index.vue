<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
})

const auth = useAuthStore()
const { post } = useApi()

const cerrandoSesion = ref(false)

async function cerrarSesion() {
  cerrandoSesion.value = true

  try {
    await post('/api/auth/logout')

    auth.limpiarSesion()

    await navigateTo('/login')
  }
  finally {
    cerrandoSesion.value = false
  }
}
</script>

<template>
  <VMain>
    <VContainer class="py-10">
      <VCard rounded="xl" class="pa-6">
        <VCardTitle>
          Bienvenido a TalentHub
        </VCardTitle>

        <VCardText>
          <p class="mb-3">
            Usuario:
            {{ auth.usuario?.primer_nombre }}
            {{ auth.usuario?.primer_apellido }}
          </p>

          <p class="mb-3">
            Roles: {{ auth.roles.join(', ') }}
          </p>

          <p class="mb-5">
            Permisos: {{ auth.permisos.join(', ') }}
          </p>

          <VBtn
              color="primary"
              :loading="cerrandoSesion"
              @click="cerrarSesion"
          >
            Cerrar sesión
          </VBtn>
        </VCardText>
      </VCard>
    </VContainer>
  </VMain>
</template>