
<script setup lang="ts">
const auth = useAuthStore()
const { post, eliminarToken } = useClienteRequest()

const emit = defineEmits<{
  toggleSidebar: []
}>()

const cerrandoSesion = ref(false)
const error = ref('')

const nombreUsuario = computed(() => [
  auth.usuario?.primer_nombre,
  auth.usuario?.primer_apellido,
].filter(Boolean).join(' '))

async function cerrarSesion() {
  cerrandoSesion.value = true
  error.value = ''

  try {
    await post('/api/auth/logout')

    eliminarToken()
    auth.limpiarSesion()

    await navigateTo('/login')
  }
  catch (exception: any) {
    error.value = exception.response?.data?.message
        || 'No fue posible cerrar sesión.'
  }
  finally {
    cerrandoSesion.value = false
  }
}
</script>

<template>
  <VAppBar elevation="1" height="65">
    <VAppBarNavIcon
        @click="emit('toggleSidebar')"
    />

    <VAppBarTitle class="text-subtitle-1 font-weight-medium">
      Sistema de Reclutamiento y Selección
    </VAppBarTitle>

    <VSpacer />

    <VMenu>
      <template #activator="{ props }">
        <VBtn
            v-bind="props"
            variant="text"
            class="text-none"
        >
          <VAvatar size="32" color="primary" class="mr-2">
            <VIcon icon="mdi-account" />
          </VAvatar>

          <span class="d-none d-sm-inline">
            {{ nombreUsuario }}
          </span>

          <VIcon icon="mdi-chevron-down" end />
        </VBtn>
      </template>

      <VList min-width="220">
        <VListItem
            :title="nombreUsuario"
            :subtitle="auth.usuario?.email"
        />

        <VDivider class="my-2" />

        <VListItem
            title="Cerrar sesión"
            prepend-icon="mdi-logout"
            :disabled="cerrandoSesion"
            @click="cerrarSesion"
        />
      </VList>
    </VMenu>

    <VSnackbar
        :model-value="!!error"
        color="error"
        :timeout="4000"
        @update:model-value="valor => {
        if (!valor) error = ''
      }"
    >
      {{ error }}
    </VSnackbar>
  </VAppBar>
</template>
