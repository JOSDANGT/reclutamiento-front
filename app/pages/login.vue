<script setup lang="ts">
definePageMeta({
  layout: 'auth',
})

useHead({
  title: 'Iniciar sesión | TalentHub',
})

const { post } = useApi()

const formulario = ref()
const usuario = ref('')
const password = ref('')

const mostrarPassword = ref(false)
const cargando = ref(false)
const error = ref('')

const reglas = {
  requerido: (valor: string) =>
      !!valor?.trim() || 'Este campo es obligatorio.',
}

async function iniciarSesion() {
  const { valid } = await formulario.value.validate()

  if (!valid) return

  cargando.value = true
  error.value = ''

  try {
    await post('/api/auth/login', {
      usuario_dominio: usuario.value.trim(),
      password: password.value,
    })

    await navigateTo('/')
  }
  catch (exception: unknown) {
    const respuesta = exception as {
      data?: {
        message?: string
        data?: {
          message?: string
        }
      }
    }

    error.value =
        respuesta.data?.data?.message
        || respuesta.data?.message
        || 'No fue posible iniciar sesión.'
  }
  finally {
    cargando.value = false
  }
}
</script>

<template>
  <VCard
      rounded="xl"
      elevation="3"
      class="pa-6 pa-sm-8"
  >
    <div class="mb-7">
      <h2 class="text-h5 font-weight-bold mb-2">
        Bienvenido
      </h2>

      <p class="text-body-2 text-medium-emphasis">
        Ingresa tus credenciales para continuar.
      </p>
    </div>

    <VAlert
        v-if="error"
        type="error"
        variant="tonal"
        closable
        class="mb-5"
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
          label="Correo electrónico o usuario"
          placeholder="Ingresa tu correo o usuario"
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
          :append-inner-icon="
          mostrarPassword ? 'mdi-eye-off' : 'mdi-eye'
        "
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
          rounded="lg"
          block
          :loading="cargando"
          :disabled="cargando"
      >
        Iniciar sesión
      </VBtn>
    </VForm>

    <VDivider class="my-7" />

    <div class="text-center">
      <p class="text-body-2 text-medium-emphasis mb-3">
        ¿Todavía no tienes una cuenta?
      </p>

      <VBtn
          to="/registro"
          color="primary"
          variant="text"
          prepend-icon="mdi-account-plus-outline"
      >
        Registrarme como candidato
      </VBtn>
    </div>
  </VCard>
</template>