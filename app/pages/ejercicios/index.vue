
<script setup lang="ts">
import EjerciciosLogica from '@/components/ejercicios/EjerciciosLogica.vue'

definePageMeta({
  middleware: 'auth',
})
</script>

<template>
  <VContainer fluid class="pa-6">
    <div class="mb-5">
      <h1 class="text-h5 font-weight-bold">
        Ejercicios de programación
      </h1>

      <p class="text-body-2 text-medium-emphasis mt-2">
        Resolución de ejercicios de lógica mediante JavaScript.
      </p>
    </div>

    <EjerciciosLogica />
  </VContainer>
</template>
