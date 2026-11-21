
<script setup lang="ts">
definePageMeta({
  layout: 'auth',
})

const { post, guardarToken, eliminarToken } = useClienteRequest()
const auth = useAuthStore()

const formulario = ref()
const usuario = ref('')
const password = ref('')
const mostrarPassword = ref(false)
const cargando = ref(false)
const error = ref('')

const reglas = {
  requerido: (valor: string) => !!valor?.trim() || 'Este campo es obligatorio.',
}

async function iniciarSesion() {
  const { valid } = await formulario.value.validate()

  if (!valid) return

  cargando.value = true
  error.value = ''

  try {
    const respuesta = await post('/api/auth/login', {
      usuario_dominio: usuario.value.trim(),
      password: password.value,
    })

    guardarToken(respuesta.data.access_token)

    const autenticado = await auth.cargarUsuario()

    if (!autenticado) {
      eliminarToken()
      throw new Error('No fue posible obtener la información del usuario.')
    }

    await navigateTo('/')
  }
  catch (exception: any) {
    error.value = exception.response?.data?.message
        || exception.message
        || 'No fue posible iniciar sesión.'
  }
  finally {
    cargando.value = false
  }
}
</script>

<template>
  <VCard
      elevation="3"
      rounded="lg"
      width="100%"
      max-width="450"
      class="mx-auto"
  >
    <VCardTitle class="text-h5 text-center pt-6">
      Iniciar sesión
    </VCardTitle>

    <VCardSubtitle class="text-center">
      Ingresa tus credenciales para continuar
    </VCardSubtitle>

    <VCardText class="pa-6">
      <VAlert
          v-if="error"
          type="error"
          variant="tonal"
          closable
          class="mb-4"
          @click:close="error = ''"
      >
        {{ error }}
      </VAlert>

      <VForm
          ref="formulario"
          @submit.prevent="iniciarSesion"
      >
        <VTextField
            v-model="usuario"
            label="Usuario o correo electrónico"
            prepend-inner-icon="mdi-account-outline"
            variant="outlined"
            density="comfortable"
            autocomplete="username"
            :rules="[reglas.requerido]"
            class="mb-3"
        />

        <VTextField
            v-model="password"
            label="Contraseña"
            prepend-inner-icon="mdi-lock-outline"
            :append-inner-icon="mostrarPassword ? 'mdi-eye-off' : 'mdi-eye'"
            :type="mostrarPassword ? 'text' : 'password'"
            variant="outlined"
            density="comfortable"
            autocomplete="current-password"
            :rules="[reglas.requerido]"
            class="mb-3"
            @click:append-inner="mostrarPassword = !mostrarPassword"
        />

        <VBtn
            type="submit"
            color="primary"
            size="large"
            block
            :loading="cargando"
            :disabled="cargando"
        >
          Iniciar sesión
        </VBtn>
      </VForm>

      <div class="text-center mt-5">
        <span class="text-body-2 text-medium-emphasis">
          ¿No tienes una cuenta?
        </span>

        <NuxtLink
            to="/registro"
            class="text-primary text-decoration-none font-weight-medium ml-1"
        >
          Regístrate
        </NuxtLink>
      </div>
    </VCardText>
  </VCard>
</template>
