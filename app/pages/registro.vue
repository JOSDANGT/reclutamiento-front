<script setup lang="ts">
import type { VForm } from 'vuetify/components'

definePageMeta({
  layout: 'auth',
})

useHead({
  title: 'Registro de candidato | TalentHub',
})

const { post } = useClienteRequest()

const formulario = ref<InstanceType<typeof VForm> | null>(null)

const datos = reactive({
  primer_nombre: '',
  segundo_nombre: '',
  tercer_nombre: '',
  primer_apellido: '',
  segundo_apellido: '',
  apellido_casada: '',
  email: '',
  telefono: '',
  password: '',
  password_confirmation: '',
})

const cargando = ref(false)
const error = ref('')
const errores = ref<Record<string, string[]>>({})

const mostrarPassword = ref(false)
const mostrarConfirmacion = ref(false)

const reglas = {
  requerido: (valor: string) =>
      !!valor?.trim() || 'Este campo es obligatorio.',

  correo: (valor: string) =>
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor)
      || 'Ingresa un correo electrónico válido.',

  password: (valor: string) =>
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(valor)
      || 'Mínimo 8 caracteres, mayúscula, minúscula y número.',

  confirmacion: (valor: string) =>
      valor === datos.password
      || 'Las contraseñas no coinciden.',
}

function obtenerError(campo: string): string[] {
  return errores.value[campo] ?? []
}

const config = useRuntimeConfig()

console.log('URL configurada:', config.public.apiBase)
console.log('Enviando petición de registro...')
async function registrarCandidato() {
  const resultado = await formulario.value?.validate()

  if (!resultado?.valid) return

  cargando.value = true
  error.value = ''
  errores.value = {}

  try {
    await post('/api/auth/register', {
      primer_nombre: datos.primer_nombre.trim(),
      segundo_nombre: datos.segundo_nombre.trim() || null,
      tercer_nombre: datos.tercer_nombre.trim() || null,
      primer_apellido: datos.primer_apellido.trim(),
      segundo_apellido: datos.segundo_apellido.trim() || null,
      apellido_casada: datos.apellido_casada.trim() || null,
      email: datos.email.trim().toLowerCase(),
      telefono: datos.telefono.trim() || null,
      password: datos.password,
      password_confirmation: datos.password_confirmation,
    })

    await navigateTo('/')
  }
  catch (exception: unknown) {
    const respuesta = exception as {
      data?: {
        statusCode?: number
        message?: string
        data?: {
          message?: string
          errors?: Record<string, string[]>
        }
      }
    }

    error.value =
        respuesta.data?.data?.message
        || respuesta.data?.message
        || 'No fue posible registrar el candidato.'

    errores.value = respuesta.data?.data?.errors ?? {}
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
    <div class="mb-6">
      <h2 class="text-h5 font-weight-bold mb-2">
        Crear cuenta
      </h2>

      <p class="text-body-2 text-medium-emphasis">
        Regístrate para conocer nuestras oportunidades laborales.
      </p>
    </div>

    <VAlert
        type="info"
        variant="tonal"
        density="comfortable"
        class="mb-6"
    >
      ¿Ya trabajas en la Cooperativa Guayacán?
      Utiliza tu cuenta institucional para iniciar sesión.
    </VAlert>

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
        @submit.prevent="registrarCandidato"
    >
      <div class="d-flex align-center ga-2 mb-4">
        <VIcon
            icon="mdi-account-outline"
            color="primary"
        />
        <h3 class="text-subtitle-1 font-weight-bold">
          Información personal
        </h3>
      </div>

      <VRow dense>
        <VCol cols="12" sm="6">
          <VTextField
              v-model="datos.primer_nombre"
              label="Primer nombre *"
              variant="outlined"
              density="comfortable"
              maxlength="100"
              :rules="[reglas.requerido]"
              :error-messages="obtenerError('primer_nombre')"
          />
        </VCol>

        <VCol cols="12" sm="6">
          <VTextField
              v-model="datos.segundo_nombre"
              label="Segundo nombre"
              variant="outlined"
              density="comfortable"
              maxlength="100"
              :error-messages="obtenerError('segundo_nombre')"
          />
        </VCol>

        <VCol cols="12" sm="6">
          <VTextField
              v-model="datos.tercer_nombre"
              label="Tercer nombre"
              variant="outlined"
              density="comfortable"
              maxlength="100"
              :error-messages="obtenerError('tercer_nombre')"
          />
        </VCol>

        <VCol cols="12" sm="6">
          <VTextField
              v-model="datos.primer_apellido"
              label="Primer apellido *"
              variant="outlined"
              density="comfortable"
              maxlength="100"
              :rules="[reglas.requerido]"
              :error-messages="obtenerError('primer_apellido')"
          />
        </VCol>

        <VCol cols="12" sm="6">
          <VTextField
              v-model="datos.segundo_apellido"
              label="Segundo apellido"
              variant="outlined"
              density="comfortable"
              maxlength="100"
              :error-messages="obtenerError('segundo_apellido')"
          />
        </VCol>

        <VCol cols="12" sm="6">
          <VTextField
              v-model="datos.apellido_casada"
              label="Apellido de casada"
              variant="outlined"
              density="comfortable"
              maxlength="100"
              :error-messages="obtenerError('apellido_casada')"
          />
        </VCol>

        <VCol cols="12" sm="6">
          <VTextField
              v-model="datos.email"
              label="Correo electrónico *"
              type="email"
              prepend-inner-icon="mdi-email-outline"
              variant="outlined"
              density="comfortable"
              maxlength="150"
              autocomplete="email"
              :rules="[reglas.requerido, reglas.correo]"
              :error-messages="obtenerError('email')"
          />
        </VCol>

        <VCol cols="12" sm="6">
          <VTextField
              v-model="datos.telefono"
              label="Teléfono"
              type="tel"
              prepend-inner-icon="mdi-phone-outline"
              variant="outlined"
              density="comfortable"
              maxlength="25"
              autocomplete="tel"
              :error-messages="obtenerError('telefono')"
          />
        </VCol>
      </VRow>


      <VDivider class="my-5" />

      <div class="d-flex align-center ga-2 mb-4">
        <VIcon
            icon="mdi-lock-outline"
            color="primary"
        />
        <h3 class="text-subtitle-1 font-weight-bold">
          Credenciales de acceso
        </h3>
      </div>

      <VTextField
          v-model="datos.password"
          label="Contraseña *"
          :type="mostrarPassword ? 'text' : 'password'"
          prepend-inner-icon="mdi-lock-outline"
          :append-inner-icon="mostrarPassword ? 'mdi-eye-off' : 'mdi-eye'"
          variant="outlined"
          density="comfortable"
          autocomplete="new-password"
          :rules="[reglas.requerido, reglas.password]"
          :error-messages="obtenerError('password')"
          @click:append-inner="mostrarPassword = !mostrarPassword"
      />

      <VTextField
          v-model="datos.password_confirmation"
          label="Confirmar contraseña *"
          :type="mostrarConfirmacion ? 'text' : 'password'"
          prepend-inner-icon="mdi-lock-check-outline"
          :append-inner-icon="mostrarConfirmacion ? 'mdi-eye-off' : 'mdi-eye'"
          variant="outlined"
          density="comfortable"
          autocomplete="new-password"
          :rules="[reglas.requerido, reglas.confirmacion]"
          class="mt-2"
          @click:append-inner="mostrarConfirmacion = !mostrarConfirmacion"
      />

      <VBtn
          type="submit"
          color="primary"
          size="large"
          rounded="lg"
          block
          class="mt-5"
          :loading="cargando"
          :disabled="cargando"
      >
        Crear cuenta
      </VBtn>
    </VForm>

    <VDivider class="my-6" />

    <div class="text-center">
      <span class="text-body-2 text-medium-emphasis">
        ¿Ya tienes una cuenta?
      </span>

      <VBtn
          to="/login"
          color="primary"
          variant="text"
      >
        Iniciar sesión
      </VBtn>
    </div>
  </VCard>
</template>